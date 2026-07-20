"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { claimPendingEmployerTeamInvite } from "@/lib/employer-team/invitations";

async function employerCompany(employerId: string) {
  const { data, error } = await adminSupabase.from("companies").select("id,owner_id,company_name,recruiter_seat_limit,employer_seat_limit").eq("owner_id", employerId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Complete your company profile before inviting team members.");
  return data;
}

export async function inviteEmployerRecruiter(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const rawEmails = [...formData.getAll("emails"), formData.get("email")]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
  const emails = Array.from(new Set(rawEmails));
  if (!emails.length) throw new Error("Add at least one email address.");
  const emailSchema = z.string().trim().email();
  const invalidEmail = emails.find((email) => !emailSchema.safeParse(email).success);
  if (invalidEmail) throw new Error(`Invalid email address: ${invalidEmail}`);
  const inviteRole = z.enum(["employer", "recruiter"]).parse(formData.get("inviteRole") ?? "recruiter");
  const company = await employerCompany(user.id);
  const [{ count: activeMembers }, { count: pendingInvites }, { data: duplicateInvites }] = await Promise.all([
    adminSupabase.from("employer_team_members").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("role", inviteRole).eq("status", "active"),
    adminSupabase.from("employer_team_invitations").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("role", inviteRole).eq("status", "pending").gt("expires_at", new Date().toISOString()),
    adminSupabase.from("employer_team_invitations").select("invited_email").eq("company_id", company.id).eq("role", inviteRole).eq("status", "pending").in("invited_email", emails),
  ]);
  const duplicateEmails = (duplicateInvites ?? []).map((invite) => invite.invited_email);
  if (duplicateEmails.length) throw new Error(`These emails already have pending ${inviteRole} access: ${duplicateEmails.join(", ")}`);
  const usedSeats = (activeMembers ?? 0) + (pendingInvites ?? 0);
  const seatLimit = inviteRole === "employer" ? company.employer_seat_limit : company.recruiter_seat_limit;
  if (usedSeats + emails.length > seatLimit) throw new Error(`${inviteRole === "employer" ? "Employer" : "Recruiter"} invite limit reached. Seats left: ${Math.max(0, seatLimit - usedSeats)}. You tried to add ${emails.length}. Ask JobiVerse admin to increase seats.`);
  const rows = emails.map((email) => ({
    company_id: company.id,
    employer_id: user.id,
    invited_email: email,
    token: crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""),
    role: inviteRole,
  }));
  const { error } = await adminSupabase.from("employer_team_invitations").insert(rows);
  if (error) throw new Error(error.code === "23505" ? "This email already has a pending invite for your company." : error.message);
  revalidatePath("/employers/team");
  redirect(`/employers/team?invited_count=${emails.length}&role=${inviteRole}`);
}

export async function cancelEmployerRecruiterInvite(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("inviteId"));
  const { error } = await adminSupabase.from("employer_team_invitations").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id).eq("employer_id", user.id).eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  redirect("/employers/team?cancelled=1");
}

export async function updateEmployerTeamMemberStatus(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("memberId"));
  const status = z.enum(["active", "disabled"]).parse(formData.get("status"));
  const { error } = await adminSupabase.from("employer_team_members").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("employer_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  redirect(`/employers/team?member=${status === "active" ? "restored" : "suspended"}`);
}

export async function removeEmployerTeamMemberAccess(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("memberId"));
  const { error } = await adminSupabase
    .from("employer_team_members")
    .delete()
    .eq("id", id)
    .eq("employer_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  redirect("/employers/team?removed=1");
}

export async function acceptEmployerInvitation(formData: FormData) {
  const token = z.string().min(20).parse(formData.get("token"));
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect(`/employer-invite/${token}?auth=required`);
  const { data: invite, error } = await adminSupabase.from("employer_team_invitations").select("id,company_id,employer_id,invited_email,status,expires_at,role").eq("token", token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at).getTime() < Date.now()) throw new Error("This invite is no longer valid.");
  if (invite.invited_email.toLowerCase() !== user.email.toLowerCase()) throw new Error("Please sign in using the invited email address.");
  const invitedRole = invite.role === "employer" ? "employer" : "recruiter";
  await claimPendingEmployerTeamInvite({ userId: user.id, email: user.email, expectedRole: invitedRole });
  redirect(invitedRole === "employer" ? "/employers/dashboard?team=accepted" : "/recruiter?team=accepted");
}
