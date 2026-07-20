"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { getEmployerCompanyAccess, scopeEmployerJoinedRequirementQuery } from "@/lib/employer-team/access";
import { adminSupabase } from "@/lib/supabase/admin";

async function ownedApplication(id: string, userId: string) {
  const access = await getEmployerCompanyAccess(userId);
  const { data } = await scopeEmployerJoinedRequirementQuery(
    adminSupabase
      .from("candidate_applications")
      .select("id,requirement_id,applicant_name,status,requirements!inner(job_title,employer_id,company_id,companies(company_name))")
      .eq("id", id),
    access,
    userId
  ).maybeSingle();

  if (!data) throw new Error("Application not found or access denied.");
  return { application: data, access };
}

async function notifyAdminsAboutExternalApplication(application: any, title: string, message: string) {
  const { data: admins } = await adminSupabase.from("users").select("id").eq("role", "admin").eq("is_active", true);
  if (!admins?.length) return;
  await adminSupabase.from("notifications").insert(admins.map((admin) => ({
    user_id: admin.id,
    type: "external_application_update",
    title,
    message,
    href: "/admin/candidates?source=external",
    reference_id: application.id,
  })));
}

export async function updateExternalApplicationStatus(applicationId: string, status: string) {
  const parsed = z.enum(["Applied", "Under Review", "Shortlisted", "Interview", "Offered", "Hired", "Rejected", "Withdrawn"]).parse(status);
  const { user, profile } = await requireRole(["employer"]);
  const { application } = await ownedApplication(applicationId, user.id);

  const { error } = await adminSupabase
    .from("candidate_applications")
    .update({ status: parsed, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);

  await adminSupabase
    .from("talent_introductions")
    .update({ hiring_status: parsed === "Hired" ? "joined" : parsed === "Offered" ? "offered" : ["Rejected", "Withdrawn"].includes(parsed) ? parsed.toLowerCase() : "in_process" })
    .eq("application_id", applicationId);

  const requirement = Array.isArray((application as any).requirements) ? (application as any).requirements[0] : (application as any).requirements;
  await notifyAdminsAboutExternalApplication(
    application,
    "External applicant status changed",
    `${profile.full_name || profile.email || "Employer"} moved ${application.applicant_name || "an external applicant"} for ${requirement?.job_title || "a published role"} from ${application.status || "previous status"} to ${parsed}.`
  );

  revalidatePath("/admin/candidates");
  revalidatePath(`/employers/external-applicants/${applicationId}`);
  revalidatePath("/employers/external-applicants");
  return { success: `Application moved to ${parsed}.` };
}

export async function scheduleExternalApplicantInterview(values: unknown) {
  const parsed = z.object({
    applicationId: z.string().uuid(),
    round: z.string().trim().min(2).max(100),
    date: z.string().min(1),
    mode: z.string().trim().min(2).max(50),
    meetingLink: z.string().trim().max(500).optional(),
    interviewer: z.string().trim().max(120).optional(),
  }).parse(values);
  const interviewDate = new Date(parsed.date);
  if (Number.isNaN(interviewDate.getTime()) || interviewDate.getTime() <= Date.now()) throw new Error("Select a future interview date and time.");
  let meetingLink = parsed.meetingLink || null;
  if (meetingLink && !/^https?:\/\//i.test(meetingLink)) meetingLink = `https://${meetingLink}`;
  if (meetingLink) {
    try {
      new URL(meetingLink);
    } catch {
      throw new Error("Enter a valid meeting link.");
    }
  }
  const { user, profile } = await requireRole(["employer"]);
  const { application } = await ownedApplication(parsed.applicationId, user.id);
  const { error } = await adminSupabase.from("application_interviews").insert({
    application_id: application.id,
    requirement_id: application.requirement_id,
    employer_id: user.id,
    interview_round: parsed.round,
    interview_date: interviewDate.toISOString(),
    interview_mode: parsed.mode,
    meeting_link: meetingLink,
    interviewer_name: parsed.interviewer || null,
  });
  if (error) throw new Error(error.message);
  await adminSupabase.from("candidate_applications").update({ status: "Interview", updated_at: new Date().toISOString() }).eq("id", application.id);
  const requirement = Array.isArray((application as any).requirements) ? (application as any).requirements[0] : (application as any).requirements;
  await notifyAdminsAboutExternalApplication(
    application,
    "External applicant interview scheduled",
    `${profile.full_name || profile.email || "Employer"} scheduled ${parsed.round} for ${application.applicant_name || "an external applicant"} on ${interviewDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} for ${requirement?.job_title || "a published role"}.`
  );
  revalidatePath("/admin/candidates");
  revalidatePath(`/employers/external-applicants/${application.id}`);
  return { success: "Interview scheduled successfully." };
}

export async function updateExternalInterviewFeedback(values: unknown) {
  const parsed = z.object({
    interviewId: z.string().uuid(),
    applicationId: z.string().uuid(),
    status: z.enum(["completed", "cancelled", "rescheduled", "no_show"]),
    feedback: z.string().trim().max(3000).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
  }).parse(values);

  const { user, profile } = await requireRole(["employer"]);
  const { application } = await ownedApplication(parsed.applicationId, user.id);

  const { error } = await adminSupabase
    .from("application_interviews")
    .update({
      status: parsed.status,
      feedback: parsed.feedback || null,
      rating: parsed.rating || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.interviewId)
    .eq("application_id", parsed.applicationId);

  if (error) throw new Error(error.message);

  if (parsed.status === "completed") {
    await adminSupabase
      .from("candidate_applications")
      .update({ status: "Interview", updated_at: new Date().toISOString() })
      .eq("id", parsed.applicationId);
  }

  const requirement = Array.isArray((application as any).requirements) ? (application as any).requirements[0] : (application as any).requirements;
  await notifyAdminsAboutExternalApplication(
    application,
    "External applicant interview feedback updated",
    `${profile.full_name || profile.email || "Employer"} saved interview feedback for ${application.applicant_name || "an external applicant"} on ${requirement?.job_title || "a published role"}.`
  );

  revalidatePath("/admin/candidates");
  revalidatePath(`/employers/external-applicants/${parsed.applicationId}`);
  return { success: "Interview feedback saved successfully." };
}
