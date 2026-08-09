"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorization";

const uuid = z.string().uuid();

async function applicationContext(applicationId: string) {
  const auth = await requireRole(["candidate", "employer", "admin"]);
  const { data: application } = await adminSupabase
    .from("candidate_applications")
    .select("id,candidate_user_id,status,requirements(id,job_title,location,employer_id)")
    .eq("id", applicationId)
    .maybeSingle();
  if (!application) throw new Error("Application not found.");
  const requirement = Array.isArray(application.requirements) ? application.requirements[0] : application.requirements;
  const participant = auth.profile.role === "admin" || application.candidate_user_id === auth.user.id || requirement?.employer_id === auth.user.id;
  if (!participant) throw new Error("You do not have access to this application.");
  return { ...auth, application, requirement };
}

export async function sendApplicationMessage(formData: FormData) {
  const applicationId = uuid.parse(formData.get("applicationId"));
  const body = z.string().trim().min(1).max(3000).parse(formData.get("body"));
  const attachmentUrlRaw = String(formData.get("attachmentUrl") ?? "").trim();
  const attachmentUrl = attachmentUrlRaw ? z.string().url().max(1000).parse(attachmentUrlRaw) : null;
  const attachmentName = attachmentUrl ? z.string().trim().max(160).parse(formData.get("attachmentName") || "Shared document") : null;
  const { user } = await applicationContext(applicationId);
  const { error } = await adminSupabase.from("application_messages").insert({ application_id: applicationId, sender_id: user.id, body, attachment_url: attachmentUrl, attachment_name: attachmentName });
  if (error) throw new Error(error.message);
  revalidatePath(`/hiring/applications/${applicationId}`);
}

export async function sendEmploymentOffer(formData: FormData) {
  const applicationId = uuid.parse(formData.get("applicationId"));
  const annualCtc = z.coerce.number().positive().max(1000000000).parse(formData.get("annualCtc"));
  const joiningDate = String(formData.get("joiningDate") ?? "") || null;
  const workLocation = z.string().trim().max(160).parse(formData.get("workLocation") ?? "");
  const terms = z.string().trim().max(5000).parse(formData.get("terms") ?? "");
  const { user, profile, application, requirement } = await applicationContext(applicationId);
  if (profile.role !== "employer" || requirement?.employer_id !== user.id) throw new Error("Only the hiring employer can issue this offer.");
  const payload = { application_id: applicationId, employer_id: user.id, candidate_user_id: application.candidate_user_id, job_title: requirement?.job_title || "Employment offer", annual_ctc: annualCtc, work_location: workLocation || requirement?.location || null, joining_date: joiningDate, terms: terms || null, status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { error } = await adminSupabase.from("employment_offers").upsert(payload, { onConflict: "application_id" });
  if (error) throw new Error(error.message);
  await adminSupabase.from("candidate_applications").update({ status: "Offered" }).eq("id", applicationId);
  await adminSupabase.from("notifications").insert({ user_id: application.candidate_user_id, type: "offer_update", title: "Employment offer received", message: `${requirement?.job_title || "A role"} offer is ready for your review.`, href: `/hiring/applications/${applicationId}`, reference_id: applicationId });
  revalidatePath(`/hiring/applications/${applicationId}`);
  revalidatePath("/candidates/applications");
}

export async function respondToEmploymentOffer(formData: FormData) {
  const applicationId = uuid.parse(formData.get("applicationId"));
  const decision = z.enum(["accepted", "declined", "countered"]).parse(formData.get("decision"));
  const response = z.string().trim().max(3000).parse(formData.get("response") ?? "");
  const counterRaw = String(formData.get("counterAnnualCtc") ?? "").trim();
  const counterAnnualCtc = decision === "countered" ? z.coerce.number().positive().max(1000000000).parse(counterRaw) : null;
  const { user, profile, application, requirement } = await applicationContext(applicationId);
  if (profile.role !== "candidate" || application.candidate_user_id !== user.id) throw new Error("Only the candidate can respond to this offer.");
  const { error } = await adminSupabase.from("employment_offers").update({ status: decision, candidate_response: response || null, counter_annual_ctc: counterAnnualCtc, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("application_id", applicationId).eq("candidate_user_id", user.id);
  if (error) throw new Error(error.message);
  await adminSupabase.from("candidate_applications").update({ status: decision === "accepted" ? "Accepted" : decision === "declined" ? "Declined" : "Offer negotiation" }).eq("id", applicationId);
  if (requirement?.employer_id) await adminSupabase.from("notifications").insert({ user_id: requirement.employer_id, type: "offer_update", title: `Offer ${decision}`, message: `The candidate responded to the ${requirement.job_title || "role"} offer.`, href: `/hiring/applications/${applicationId}`, reference_id: applicationId });
  revalidatePath(`/hiring/applications/${applicationId}`);
  revalidatePath("/candidates/applications");
}

