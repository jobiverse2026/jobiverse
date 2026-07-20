"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const candidateStatuses = ["Submitted", "Screening", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;

async function findAuthUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  while (page <= 20) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) return match;
    if (data.users.length < 1000) break;
    page += 1;
  }
  return null;
}

async function createOrUpdateMasterEmployerAccount({ email, password, fullName }: { email: string; password: string; fullName: string }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await findAuthUserByEmail(normalizedEmail);
  const userId = existing?.id;

  if (userId) {
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { role: "employer", full_name: fullName },
    });
    if (updateError) throw new Error(updateError.message);
  } else {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "employer", full_name: fullName },
    });
    if (error) throw new Error(error.message);
    if (!data.user?.id) throw new Error("Master Employer account could not be created.");
  }

  const authUserId = userId ?? (await findAuthUserByEmail(normalizedEmail))?.id;
  if (!authUserId) throw new Error("Master Employer account could not be linked.");

  const { error: profileError } = await adminSupabase.from("users").upsert({
    id: authUserId,
    email: normalizedEmail,
    full_name: fullName,
    role: "employer",
    is_active: true,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw new Error(profileError.message);

  return { id: authUserId, email: normalizedEmail, full_name: fullName };
}

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
    masterName: z.string().trim().min(2).max(140),
    masterEmail: z.string().trim().email(),
    temporaryPassword: z.string().min(8).max(128),
    industry: z.string().trim().max(120).optional(),
    companySize: z.string().trim().max(80).optional(),
    companyEmail: z.string().trim().email().optional(),
    phone: z.string().trim().max(40).optional(),
    website: z.union([z.literal(""), z.string().trim().url()]).optional(),
    address: z.string().trim().max(250).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
    country: z.string().trim().max(80).optional(),
    pincode: z.string().trim().max(20).optional(),
    recruiterSeatLimit: z.coerce.number().int().min(0).max(500).default(0),
    employerSeatLimit: z.coerce.number().int().min(0).max(500).default(0),
  }).parse({
    companyName: formData.get("companyName"),
    masterName: formData.get("masterName"),
    masterEmail: formData.get("masterEmail"),
    temporaryPassword: formData.get("temporaryPassword"),
    industry: formData.get("industry") || undefined,
    companySize: formData.get("companySize") || undefined,
    companyEmail: formData.get("companyEmail") || undefined,
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || "",
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    country: formData.get("country") || "India",
    pincode: formData.get("pincode") || undefined,
    recruiterSeatLimit: formData.get("recruiterSeatLimit") || 0,
    employerSeatLimit: formData.get("employerSeatLimit") || 0,
  });
  const owner = await createOrUpdateMasterEmployerAccount({
    email: parsed.masterEmail,
    password: parsed.temporaryPassword,
    fullName: parsed.masterName,
  });
  const { error } = await adminSupabase.from("companies").insert({
    owner_id: owner.id,
    company_name: parsed.companyName,
    industry: parsed.industry ?? null,
    company_size: parsed.companySize ?? null,
    website: parsed.website || null,
    city: parsed.city ?? null,
    state: parsed.state ?? null,
    country: parsed.country ?? "India",
    pincode: parsed.pincode ?? null,
    address: parsed.address ?? null,
    phone: parsed.phone ?? null,
    company_email: parsed.companyEmail ?? owner.email,
    recruiter_seat_limit: parsed.recruiterSeatLimit,
    employer_seat_limit: parsed.employerSeatLimit,
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
