"use server";

import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";

const inviteRoleSchema = z.enum(["employer", "recruiter"]);

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
