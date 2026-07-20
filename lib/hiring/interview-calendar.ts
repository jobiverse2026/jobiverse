import "server-only";

import { getEmployerCompanyAccess } from "@/lib/employer-team/access";
import { formatIndiaDate, formatIndiaDateTime, formatIndiaTime, getFutureIstRange, getTodayIstRange } from "@/lib/format/date-time";
import { getHiringNotificationRecipients } from "@/lib/hiring/notification-targets";
import { adminSupabase } from "@/lib/supabase/admin";

export type InterviewCalendarItem = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateStatus: string;
  requirementId: string;
  jobTitle: string;
  requirementStatus: string;
  interviewRound: string;
  interviewDate: string;
  interviewMode: string | null;
  meetingLink: string | null;
  interviewerName: string | null;
  status: string;
  href: string;
};

function isMissingRequirementAssignmentsTable(error: any) {
  const message = String(error?.message ?? "").toLowerCase();
  return error?.code === "42P01"
    || error?.code === "PGRST205"
    || (message.includes("requirement_recruiter_assignments") && (message.includes("schema cache") || message.includes("does not exist") || message.includes("could not find")));
}

function normalizeInterview(row: any, hrefPrefix: "employers" | "recruiter"): InterviewCalendarItem {
  const candidate = Array.isArray(row.candidates) ? row.candidates[0] : row.candidates;
  const requirement = Array.isArray(row.requirements) ? row.requirements[0] : row.requirements;
  return {
    id: row.id,
    candidateId: row.candidate_id,
    candidateName: candidate?.full_name || "Candidate",
    candidateStatus: candidate?.status || "Interview",
    requirementId: row.requirement_id,
    jobTitle: requirement?.job_title || "Requirement",
    requirementStatus: requirement?.status || "Working",
    interviewRound: row.interview_round,
    interviewDate: row.interview_date,
    interviewMode: row.interview_mode,
    meetingLink: row.meeting_link,
    interviewerName: row.interviewer_name,
    status: row.status,
    href: hrefPrefix === "employers" ? `/employers/candidates/${row.candidate_id}` : `/recruiter/requirements/${row.requirement_id}`,
  };
}

async function getRecruiterRequirementIds(userId: string) {
  const { data: directRequirements } = await adminSupabase
    .from("requirements")
    .select("id")
    .eq("assigned_recruiter", userId);

  const { data: assignments, error } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("requirement_id")
    .eq("recruiter_id", userId);

  if (error && !isMissingRequirementAssignmentsTable(error)) throw new Error(error.message);

  return [...new Set([
    ...(directRequirements ?? []).map((item: any) => item.id),
    ...(!error ? (assignments ?? []).map((item: any) => item.requirement_id) : []),
  ].filter(Boolean))];
}

async function getInterviewsByRequirementIds(requirementIds: string[], hrefPrefix: "employers" | "recruiter", days = 30) {
  if (!requirementIds.length) return [];
  const { start, end } = getFutureIstRange(days);
  const { data, error } = await adminSupabase
    .from("interviews")
    .select("id,requirement_id,candidate_id,interview_round,interview_date,interview_mode,meeting_link,interviewer_name,status,candidates(full_name,status),requirements(job_title,status)")
    .in("requirement_id", requirementIds)
    .gte("interview_date", start.toISOString())
    .lt("interview_date", end.toISOString())
    .order("interview_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeInterview(row, hrefPrefix));
}

export async function getEmployerUpcomingInterviews(userId: string) {
  const access = await getEmployerCompanyAccess(userId);
  let query = adminSupabase.from("requirements").select("id,employer_id").eq("company_id", access.company.id);
  if (!access.isMasterEmployer) query = query.eq("employer_id", userId);
  const { data: requirements, error } = await query;
  if (error) throw new Error(error.message);
  return getInterviewsByRequirementIds((requirements ?? []).map((item: any) => item.id), "employers");
}

export async function getRecruiterUpcomingInterviews(userId: string) {
  const requirementIds = await getRecruiterRequirementIds(userId);
  const assignedInterviews = await getInterviewsByRequirementIds(requirementIds, "recruiter");
  const { start, end } = getFutureIstRange(30);
  const { data: ownCandidateInterviews, error } = await adminSupabase
    .from("interviews")
    .select("id,requirement_id,candidate_id,interview_round,interview_date,interview_mode,meeting_link,interviewer_name,status,candidates!inner(full_name,status,recruiter_id),requirements(job_title,status)")
    .eq("candidates.recruiter_id", userId)
    .gte("interview_date", start.toISOString())
    .lt("interview_date", end.toISOString())
    .order("interview_date", { ascending: true });
  if (error) throw new Error(error.message);
  const merged = new Map<string, InterviewCalendarItem>();
  [...assignedInterviews, ...(ownCandidateInterviews ?? []).map((row) => normalizeInterview(row, "recruiter"))].forEach((item) => merged.set(item.id, item));
  return [...merged.values()].sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());
}

export async function ensureTodayInterviewRemindersForUser(userId: string, interviews: InterviewCalendarItem[]) {
  const { start, end } = getTodayIstRange();
  const todaysInterviews = interviews.filter((item) => {
    const time = new Date(item.interviewDate).getTime();
    return time >= start.getTime() && time < end.getTime() && item.status !== "cancelled";
  });
  if (!todaysInterviews.length) return;

  const { data: existing } = await adminSupabase
    .from("notifications")
    .select("reference_id")
    .eq("user_id", userId)
    .eq("type", "interview_today")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  const existingIds = new Set((existing ?? []).map((item: any) => item.reference_id));
  const rows = todaysInterviews
    .filter((item) => !existingIds.has(item.id))
    .map((item) => ({
      user_id: userId,
      type: "interview_today",
      title: "Interview today",
      message: `${item.interviewRound} for ${item.candidateName} is today at ${formatIndiaTime(item.interviewDate)} for ${item.jobTitle}.`,
      href: item.href,
      reference_id: item.id,
    }));

  if (rows.length) await adminSupabase.from("notifications").insert(rows);
}

export async function sendTodayInterviewRemindersToAll() {
  const { start, end } = getTodayIstRange();
  const { data: interviews, error } = await adminSupabase
    .from("interviews")
    .select("id,requirement_id,candidate_id,interview_round,interview_date,status,candidates(full_name,recruiter_id),requirements(id,job_title,employer_id,company_id,assigned_recruiter)")
    .gte("interview_date", start.toISOString())
    .lt("interview_date", end.toISOString())
    .neq("status", "cancelled");
  if (error) throw new Error(error.message);

  const rows: any[] = [];
  for (const interview of interviews ?? []) {
    const candidate = Array.isArray((interview as any).candidates) ? (interview as any).candidates[0] : (interview as any).candidates;
    const requirement = Array.isArray((interview as any).requirements) ? (interview as any).requirements[0] : (interview as any).requirements;
    if (!requirement) continue;
    const recipients = await getHiringNotificationRecipients({
      requirementId: requirement.id,
      companyId: requirement.company_id,
      employerId: requirement.employer_id,
      assignedRecruiterId: requirement.assigned_recruiter,
      candidateRecruiterId: candidate?.recruiter_id,
    });
    for (const recipient of recipients) {
      const { data: existing } = await adminSupabase
        .from("notifications")
        .select("id")
        .eq("user_id", recipient.userId)
        .eq("type", "interview_today")
        .eq("reference_id", interview.id)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .maybeSingle();
      if (!existing) {
        rows.push({
          user_id: recipient.userId,
          type: "interview_today",
          title: "Interview today",
          message: `${interview.interview_round} for ${candidate?.full_name || "a candidate"} is today at ${formatIndiaTime(interview.interview_date)} for ${requirement.job_title || "a role"}.`,
          href: recipient.role === "employer" ? `/employers/candidates/${interview.candidate_id}` : `/recruiter/requirements/${interview.requirement_id}`,
          reference_id: interview.id,
        });
      }
    }
  }

  if (rows.length) await adminSupabase.from("notifications").insert(rows);
  return { reminders: rows.length, date: formatIndiaDate(start), checked: formatIndiaDateTime(new Date()) };
}
