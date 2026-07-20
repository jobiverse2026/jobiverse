"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const candidateStatuses = ["Submitted", "Screening", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;

export async function updateCompanyVerification(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("companyId"));
  const verified = z.enum(["true", "false"]).parse(formData.get("verified")) === "true";
  const { error } = await adminSupabase.from("companies").update({ is_verified: verified }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
  redirect(`/admin/companies?verified=${verified ? "1" : "0"}`);
}

export async function updateCompanySeatLimits(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("companyId"));
  const recruiterSeatLimit = z.coerce.number().int().min(0).max(500).parse(formData.get("recruiterSeatLimit"));
  const employerSeatLimit = z.coerce.number().int().min(0).max(500).parse(formData.get("employerSeatLimit"));
  const { error } = await adminSupabase.from("companies").update({ recruiter_seat_limit: recruiterSeatLimit, employer_seat_limit: employerSeatLimit }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
  redirect("/admin/companies?seats=1");
}

export async function createAdminCompany(formData: FormData) {
  await requireRole(["admin"]);
  const parsed = z.object({
    companyName: z.string().trim().min(2).max(160),
    ownerId: z.string().uuid(),
    industry: z.string().trim().max(120).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
  }).parse({
    companyName: formData.get("companyName"),
    ownerId: formData.get("ownerId"),
    industry: formData.get("industry") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
  const { data: owner } = await adminSupabase.from("users").select("id,email,full_name").eq("id", parsed.ownerId).eq("role", "employer").maybeSingle();
  if (!owner) throw new Error("Select a valid employer account as Master Employer.");
  const { error } = await adminSupabase.from("companies").insert({
    owner_id: parsed.ownerId,
    company_name: parsed.companyName,
    industry: parsed.industry ?? null,
    city: parsed.city ?? null,
    state: parsed.state ?? null,
    company_email: owner.email,
  });
  if (error) throw new Error(error.code === "23505" ? "This master employer is already linked to a company." : error.message);
  revalidatePath("/admin/companies");
  redirect("/admin/companies?company=created");
}

export async function updateCompanyMasterEmployer(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("companyId"));
  const ownerId = z.string().uuid().parse(formData.get("ownerId"));
  const { data: owner } = await adminSupabase.from("users").select("id,email").eq("id", ownerId).eq("role", "employer").maybeSingle();
  if (!owner) throw new Error("Select a valid employer account as Master Employer.");
  const { data: currentCompany, error: currentError } = await adminSupabase.from("companies").select("owner_id").eq("id", id).maybeSingle();
  if (currentError) throw new Error(currentError.message);
  const previousOwnerId = currentCompany?.owner_id;
  const { error } = await adminSupabase.from("companies").update({ owner_id: ownerId, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.code === "23505" ? "This master employer is already linked to another company." : error.message);
  if (previousOwnerId && previousOwnerId !== ownerId) {
    const now = new Date().toISOString();
    await Promise.all([
      adminSupabase.from("employer_team_members").update({ employer_id: ownerId, updated_at: now }).eq("company_id", id).eq("employer_id", previousOwnerId).eq("role", "recruiter"),
      adminSupabase.from("employer_team_invitations").update({ employer_id: ownerId, updated_at: now }).eq("company_id", id).eq("employer_id", previousOwnerId).eq("role", "recruiter").eq("status", "pending"),
      adminSupabase.from("employer_team_members").delete().eq("company_id", id).eq("user_id", ownerId).eq("role", "employer"),
    ]);
  }
  revalidatePath("/admin/companies");
  redirect("/admin/companies?master=1");
}

export async function updateCandidateStatus(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("candidateId"));
  const status = z.enum(candidateStatuses).parse(formData.get("status"));
  const { error } = await adminSupabase
    .from("candidates")
    .update({ status })
    .eq("id", id)
    .or("recruiter_name.eq.JobiVerse Hiring Team,recruiter_email.eq.jobiverse@outlook.com");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates");
}
