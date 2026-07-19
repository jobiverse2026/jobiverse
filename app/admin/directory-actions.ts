"use server";

import { revalidatePath } from "next/cache";
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
}

export async function updateCompanyRecruiterSeatLimit(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("companyId"));
  const recruiterSeatLimit = z.coerce.number().int().min(0).max(500).parse(formData.get("recruiterSeatLimit"));
  const { error } = await adminSupabase.from("companies").update({ recruiter_seat_limit: recruiterSeatLimit }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
}

export async function updateRecruiterAccess(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("recruiterId"));
  const active = z.enum(["true", "false"]).parse(formData.get("active")) === "true";
  const { error } = await adminSupabase.from("users").update({ is_active: active }).eq("id", id).eq("role", "recruiter");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/recruiters");
}

export async function updateCandidateStatus(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("candidateId"));
  const status = z.enum(candidateStatuses).parse(formData.get("status"));
  const { error } = await adminSupabase.from("candidates").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates");
}
