"use server";

import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";

const inviteRoleSchema = z.enum(["employer", "recruiter"]);
const signupRoleSchema = z.enum(["candidate", "employer", "recruiter", "creator"]);

export async function hasPendingEmployerTeamInvite(email: string, role: "employer" | "recruiter") {
  const input = z.object({ email: z.string().trim().email(), role: inviteRoleSchema }).safeParse({ email, role });
  if (!input.success) return false;

  const { count, error } = await adminSupabase
    .from("employer_team_invitations")
    .select("id", { count: "exact", head: true })
    .eq("invited_email", input.data.email.toLowerCase())
    .eq("role", input.data.role)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function confirmSignupUser(userId: string, email: string, role: "candidate" | "employer" | "recruiter" | "creator") {
  const input = z.object({
    userId: z.string().uuid(),
    email: z.string().trim().email(),
    role: signupRoleSchema,
  }).safeParse({ userId, email, role });

  if (!input.success) return { error: "Unable to confirm this signup. Please try logging in again." };

  if (input.data.role === "recruiter") {
    const invited = await hasPendingEmployerTeamInvite(input.data.email, "recruiter");
    if (!invited) return { error: "Recruiter access is not assigned to this email yet." };
  }

  const normalizedEmail = input.data.email.toLowerCase();
  const { data: authUser, error: authReadError } = await adminSupabase.auth.admin.getUserById(input.data.userId);
  if (authReadError || !authUser.user) return { error: authReadError?.message ?? "Signup user was not found." };
  if (authUser.user.email?.toLowerCase() !== normalizedEmail) return { error: "Signup email verification mismatch. Please use the same email." };

  const { error } = await adminSupabase.auth.admin.updateUserById(input.data.userId, { email_confirm: true });
  if (error) return { error: error.message };

  return { confirmed: true };
}
