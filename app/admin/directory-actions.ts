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
