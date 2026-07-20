"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { getHiringNotificationRecipients } from "@/lib/hiring/notification-targets";
import { adminSupabase } from "@/lib/supabase/admin";

const interviewSchema = z.object({
  candidateId: z.string().uuid(),
  interviewRound: z.string().trim().min(1, "Interview round is required.").max(100),
  interviewDate: z.string().min(1),
  interviewMode: z.string().trim().max(50).optional(),
  meetingLink: z.string().trim().optional(),
  interviewerName: z.string().trim().max(120).optional(),
});

export async function scheduleEmployerInterview(values: unknown) {
  const result = interviewSchema.safeParse(values);

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Please check the interview details.");
  }

  const parsed = result.data;
  const interviewDate = new Date(parsed.interviewDate);
  let meetingLink = parsed.meetingLink || "";

  if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
    meetingLink = `https://${meetingLink}`;
  }

  if (meetingLink) {
    try {
      const url = new URL(meetingLink);
      if (!url.hostname.includes(".")) throw new Error();
    } catch {
      throw new Error("Please enter a valid meeting link, for example meet.google.com/abc-defg-hij.");
    }
  }

  if (Number.isNaN(interviewDate.getTime()) || interviewDate.getTime() <= Date.now()) {
    throw new Error("Please select a valid future interview date and time.");
  }

  const { supabase, user, profile } = await requireRole(["employer"]);
  const { data, error } = await supabase.rpc("schedule_candidate_interview", {
    p_candidate_id: parsed.candidateId,
    p_interview_round: parsed.interviewRound,
    p_interview_date: interviewDate.toISOString(),
    p_interview_mode: parsed.interviewMode || null,
    p_meeting_link: meetingLink || null,
    p_interviewer_name: parsed.interviewerName || null,
  });

  if (error) throw new Error(error.message);

  const { data: candidate } = await adminSupabase
    .from("candidates")
    .select("id, full_name, recruiter_id, requirements(id, job_title, employer_id, company_id, assigned_recruiter)")
    .eq("id", parsed.candidateId)
    .maybeSingle();

  const requirement = Array.isArray((candidate as any)?.requirements)
    ? (candidate as any).requirements[0]
    : (candidate as any)?.requirements;

  if (candidate && requirement) {
    const recipients = await getHiringNotificationRecipients({
      requirementId: requirement.id,
      companyId: requirement.company_id,
      employerId: requirement.employer_id,
      assignedRecruiterId: null,
      candidateRecruiterId: candidate.recruiter_id,
      actorId: user.id,
    });
    const actorName = profile.full_name || profile.email || "Employer";
    const scheduledAt = interviewDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    if (recipients.length) {
      await adminSupabase.from("notifications").insert(recipients.map((recipient) => ({
        user_id: recipient.userId,
        type: "interview_scheduled",
        title: "Interview scheduled",
        message: `${actorName} scheduled ${parsed.interviewRound} for ${candidate.full_name || "a candidate"} on ${scheduledAt}.`,
        href: recipient.role === "employer" ? `/employers/candidates/${candidate.id}` : `/recruiter/requirements/${requirement.id}`,
        reference_id: candidate.id,
      })));
    }
  }

  revalidatePath(`/employers/candidates/${parsed.candidateId}`);
  revalidatePath("/employers/candidates");
  revalidatePath("/employers/dashboard");

  return { interviewId: data };
}
