"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { getHiringNotificationRecipients } from "@/lib/hiring/notification-targets";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerJoinedRequirementQuery } from "@/lib/employer-team/access";

const employerCandidateStatuses = ["Submitted", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;
const employerPlacementStatuses = ["offered", "accepted", "joined", "declined", "no_show", "replacement", "completed"] as const;

export async function updateEmployerCandidateStatus(formData: FormData) {
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  const status = z.enum(employerCandidateStatuses).parse(formData.get("status"));
  const { user, profile } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);

  const { data: candidate, error: candidateError } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select("id, full_name, status, recruiter_id, recruiter_name, recruiter_email, source, requirements!inner(id, job_title, employer_id, company_id, assigned_recruiter)")
    .eq("id", candidateId)
    , access, user.id)
    .maybeSingle();

  if (candidateError) throw new Error(candidateError.message);
  if (!candidate) throw new Error("Candidate not found or access denied.");

  const requirement = Array.isArray(candidate.requirements) ? candidate.requirements[0] : candidate.requirements;
  const previousStatus = String(candidate.status ?? "");

  if (previousStatus !== status) {
    const { error } = await adminSupabase
      .from("candidates")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", candidateId);

    if (error) throw new Error(error.message);

    const isJobiVerseCandidate =
      candidate.source === "jobiverse_hiring_team" ||
      candidate.recruiter_name === "JobiVerse Hiring Team" ||
      candidate.recruiter_email === "jobiverse@outlook.com";

    const actorName = profile.full_name || profile.email || "Employer";
    const [hiringRecipients, adminResult] = await Promise.all([
      getHiringNotificationRecipients({
        requirementId: requirement.id,
        companyId: requirement.company_id,
        employerId: requirement.employer_id,
        assignedRecruiterId: null,
        candidateRecruiterId: isJobiVerseCandidate ? null : candidate.recruiter_id,
        actorId: user.id,
      }),
      isJobiVerseCandidate
        ? adminSupabase.from("users").select("id").eq("role", "admin").eq("is_active", true)
        : Promise.resolve({ data: [] } as any),
    ]);

    const rows = [
      ...hiringRecipients.map((recipient) => ({
        user_id: recipient.userId,
        type: "candidate_status",
        title: "Candidate status updated",
        message: `${actorName} moved ${candidate.full_name || "a candidate"} for ${requirement?.job_title || "a requirement"} from ${previousStatus || "previous status"} to ${status}.`,
        href: recipient.role === "employer" ? `/employers/candidates/${candidate.id}` : `/recruiter/requirements/${requirement.id}`,
        reference_id: candidate.id,
      })),
      ...(adminResult.data ?? []).map((admin: any) => ({
        user_id: admin.id,
        type: "candidate_status",
        title: "Employer updated JobiVerse candidate",
        message: `${actorName} moved ${candidate.full_name || "a candidate"} for ${requirement?.job_title || "a requirement"} from ${previousStatus || "previous status"} to ${status}.`,
        href: `/admin/candidates?q=${encodeURIComponent(candidate.full_name || "")}`,
        reference_id: candidate.id,
      })),
    ];

    if (rows.length) await adminSupabase.from("notifications").insert(rows);
  }

  revalidatePath("/employers/candidates");
  revalidatePath(`/employers/candidates/${candidateId}`);
  revalidatePath("/admin/candidates");
  redirect(`/employers/candidates/${candidateId}?status_updated=1`);
}

export async function manageEmployerCandidateOffer(formData: FormData) {
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  const status = z.enum(employerPlacementStatuses).parse(formData.get("placementStatus"));
  const offeredCtc = Number(formData.get("offeredCtc") || 0);
  const joiningDate = String(formData.get("joiningDate") || "");
  const { user, profile } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);

  if (["offered", "accepted", "joined"].includes(status) && offeredCtc <= 0) {
    throw new Error("Please enter the annual offered CTC.");
  }
  if (status === "joined" && !joiningDate) {
    throw new Error("Please enter the confirmed joining date.");
  }

  const { data: candidate, error: candidateError } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select("id, full_name, status, recruiter_id, requirements!inner(id, job_title, employer_id, company_id, assigned_recruiter, fee_percentage, minimum_fee, replacement_days)")
    .eq("id", candidateId),
    access,
    user.id
  ).maybeSingle();

  if (candidateError) throw new Error(candidateError.message);
  if (!candidate) throw new Error("Candidate not found or access denied.");

  const requirement = Array.isArray(candidate.requirements) ? candidate.requirements[0] : candidate.requirements;
  const feePercentage = Number(requirement?.fee_percentage ?? 0);
  const minimumFee = Number(requirement?.minimum_fee ?? 0);
  const replacementDays = Number(requirement?.replacement_days ?? 0);
  const placementFee = offeredCtc > 0 && feePercentage > 0 ? Math.max(Number(((offeredCtc * feePercentage) / 100).toFixed(2)), minimumFee) : null;
  const gstAmount = placementFee == null ? null : Number((placementFee * 0.18).toFixed(2));
  const replacementEndDate = status === "joined" && joiningDate && replacementDays > 0
    ? new Date(new Date(`${joiningDate}T00:00:00.000+05:30`).getTime() + replacementDays * 86400000).toISOString().slice(0, 10)
    : null;

  const { data: placement, error } = await adminSupabase
    .from("placements")
    .upsert({
      requirement_id: requirement.id,
      candidate_id: candidateId,
      status,
      offered_ctc: offeredCtc > 0 ? offeredCtc : null,
      joining_date: joiningDate || null,
      fee_percentage: feePercentage || null,
      placement_fee: placementFee,
      gst_amount: gstAmount,
      replacement_end_date: replacementEndDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: "candidate_id" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const candidateStatus = status === "offered" || status === "accepted"
    ? "Offered"
    : status === "joined" || status === "completed"
      ? "Joined"
      : status === "no_show" || status === "declined"
        ? "Withdrawn"
        : "Selected";

  const requirementStatus = status === "offered" || status === "accepted"
    ? "Offer"
    : status === "joined" || status === "completed"
      ? "Joined"
      : null;

  await adminSupabase.from("candidates").update({ status: candidateStatus, updated_at: new Date().toISOString() }).eq("id", candidateId);
  if (requirementStatus) {
    await adminSupabase.from("requirements").update({ status: requirementStatus, updated_at: new Date().toISOString() }).eq("id", requirement.id);
  }

  const actorName = profile.full_name || profile.email || "Employer";
  const [hiringRecipients, adminResult] = await Promise.all([
    getHiringNotificationRecipients({
      requirementId: requirement.id,
      companyId: requirement.company_id,
      employerId: requirement.employer_id,
      assignedRecruiterId: null,
      candidateRecruiterId: candidate.recruiter_id,
      actorId: user.id,
    }),
    adminSupabase.from("users").select("id").eq("role", "admin").eq("is_active", true),
  ]);
  const rows = [
    ...hiringRecipients.map((recipient) => ({
      user_id: recipient.userId,
      type: "placement_status",
      title: "Offer details updated",
      message: `${actorName} marked ${candidate.full_name || "a candidate"} as ${status.replaceAll("_", " ")} for ${requirement?.job_title || "a requirement"}.`,
      href: recipient.role === "employer" ? `/employers/candidates/${candidate.id}` : `/recruiter/requirements/${requirement.id}`,
      reference_id: placement.id,
    })),
    ...(adminResult.data ?? []).map((admin: any) => ({
    user_id: admin.id,
    type: "placement_status",
    title: "Employer updated offer details",
    message: `${actorName} marked ${candidate.full_name || "a candidate"} as ${status.replaceAll("_", " ")} for ${requirement?.job_title || "a requirement"}.`,
    href: `/admin/candidates?q=${encodeURIComponent(candidate.full_name || "")}`,
    reference_id: placement.id,
  })),
  ];
  if (rows.length) await adminSupabase.from("notifications").insert(rows);

  revalidatePath("/employers/dashboard");
  revalidatePath("/employers/requirements");
  revalidatePath("/employers/candidates");
  revalidatePath(`/employers/candidates/${candidateId}`);
  revalidatePath("/admin/candidates");
  redirect(`/employers/candidates/${candidateId}?offer_updated=1`);
}

export async function toggleEmployerCandidateShortlist(formData: FormData) {
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  const note = z.string().trim().max(700).optional().parse(String(formData.get("note") ?? "") || undefined);
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);

  const { data: candidate, error } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select("id, full_name, requirements!inner(id, employer_id, company_id)")
    .eq("id", candidateId),
    access,
    user.id
  ).maybeSingle();

  if (error) throw new Error(error.message);
  if (!candidate) throw new Error("Candidate not found or access denied.");

  const { data: existing } = await adminSupabase
    .from("employer_candidate_shortlists")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("employer_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error: deleteError } = await adminSupabase
      .from("employer_candidate_shortlists")
      .delete()
      .eq("id", existing.id);
    if (deleteError) throw new Error(deleteError.message);
    revalidatePath("/employers/candidates");
    revalidatePath(`/employers/candidates/${candidateId}`);
    redirect(`/employers/candidates/${candidateId}?shortlist=removed`);
  }

  const { error: insertError } = await adminSupabase.from("employer_candidate_shortlists").insert({
    company_id: access.company.id,
    employer_id: user.id,
    candidate_id: candidateId,
    note: note ?? null,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath("/employers/candidates");
  revalidatePath(`/employers/candidates/${candidateId}`);
  redirect(`/employers/candidates/${candidateId}?shortlist=added`);
}

export async function addEmployerCandidateNote(formData: FormData) {
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  const note = z.string().trim().min(3).max(1500).parse(formData.get("note"));
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);

  const { data: candidate, error } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select("id, full_name, source, recruiter_name, recruiter_email, requirements!inner(id, employer_id, company_id)")
    .eq("id", candidateId),
    access,
    user.id
  ).maybeSingle();

  if (error) throw new Error(error.message);
  if (!candidate) throw new Error("Candidate not found or access denied.");

  const isJobiVerseProtected =
    candidate.source === "jobiverse_hiring_team" ||
    candidate.recruiter_name === "JobiVerse Hiring Team" ||
    candidate.recruiter_email === "jobiverse@outlook.com";

  const { error: noteError } = await adminSupabase.from("employer_candidate_notes").insert({
    company_id: access.company.id,
    employer_id: user.id,
    candidate_id: candidateId,
    note,
    is_jobiverse_protected: isJobiVerseProtected,
  });
  if (noteError) throw new Error(noteError.message);

  revalidatePath(`/employers/candidates/${candidateId}`);
  redirect(`/employers/candidates/${candidateId}?note_added=1`);
}
