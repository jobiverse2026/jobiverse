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

export async function requiresEmailConfirmation() {
  return process.env.SUPABASE_AUTH_SMTP_READY === "true";
}

export async function confirmSignupUser(userId: string, email: string, role: "candidate" | "employer" | "recruiter" | "creator") {
  const input = z.object({
    userId: z.string().uuid(),
    email: z.string().trim().email(),
    role: signupRoleSchema,
  }).safeParse({ userId, email, role });

  if (!input.success) return { error: "Unable to confirm this signup. Please try logging in again." };

  if (input.data.role === "recruiter") {
    const invited = await hasPendingEmployerTeamInvite(input.data.email, input.data.role);
    if (!invited) {
      return {
        error: "Recruiter signup is not open publicly. Please ask your employer to add this exact email to recruiter seats, or contact JobiVerse.",
      };
    }
  }

  if (process.env.SUPABASE_AUTH_SMTP_READY === "true") {
    return { emailConfirmationRequired: true };
  }

  const normalizedEmail = input.data.email.toLowerCase();
  const { data: authUser, error: authReadError } = await adminSupabase.auth.admin.getUserById(input.data.userId);
  if (authReadError || !authUser.user) return { error: authReadError?.message ?? "Signup user was not found." };
  if (authUser.user.email?.toLowerCase() !== normalizedEmail) return { error: "Signup email verification mismatch. Please use the same email." };

  const { error } = await adminSupabase.auth.admin.updateUserById(input.data.userId, { email_confirm: true });
  if (error) return { error: error.message };

  return { confirmed: true };
}

export async function confirmExistingSignupEmail(email: string, role: "candidate" | "employer" | "recruiter" | "creator") {
  const input = z.object({
    email: z.string().trim().email(),
    role: signupRoleSchema,
  }).safeParse({ email, role });

  if (!input.success) return { error: "Unable to verify this account. Please check the email and try again." };

  if (input.data.role === "recruiter") {
    const invited = await hasPendingEmployerTeamInvite(input.data.email, input.data.role);
    if (!invited) {
      return {
        error: "Recruiter access is not assigned to this email yet. Please ask your employer to add this email first.",
      };
    }
  }

  if (process.env.SUPABASE_AUTH_SMTP_READY === "true") {
    return { error: "This email is not confirmed yet. Please check your verification email or use Resend code." };
  }

  const normalizedEmail = input.data.email.toLowerCase();
  let page = 1;
  let userId: string | null = null;

  while (!userId && page <= 10) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { error: error.message };

    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) userId = match.id;
    if (!data.users.length || data.users.length < 1000) break;
    page += 1;
  }

  if (!userId) return { error: "Signup account was not found. Please create an account first." };

  const { error } = await adminSupabase.auth.admin.updateUserById(userId, { email_confirm: true });
  if (error) return { error: error.message };

  return { confirmed: true };
}
