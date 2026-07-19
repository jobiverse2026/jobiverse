"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobiverse.in").replace(/\/$/, "");

async function employerCompany(employerId: string) {
  const { data, error } = await adminSupabase.from("companies").select("id,owner_id,company_name,recruiter_seat_limit").eq("owner_id", employerId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Complete your company profile before inviting recruiters.");
  return data;
}

export async function inviteEmployerRecruiter(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const email = z.string().trim().email().parse(formData.get("email")).toLowerCase();
  const company = await employerCompany(user.id);
  const [{ count: activeMembers }, { count: pendingInvites }] = await Promise.all([
    adminSupabase.from("employer_team_members").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("status", "active"),
    adminSupabase.from("employer_team_invitations").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("status", "pending").gt("expires_at", new Date().toISOString()),
  ]);
  const usedSeats = (activeMembers ?? 0) + (pendingInvites ?? 0);
  if (usedSeats >= company.recruiter_seat_limit) throw new Error(`Recruiter invite limit reached. Current limit: ${company.recruiter_seat_limit}. Ask JobiVerse admin to increase seats.`);
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const inviteUrl = `${siteUrl()}/employer-invite/${token}`;
  const { error } = await adminSupabase.from("employer_team_invitations").insert({ company_id: company.id, employer_id: user.id, invited_email: email, token });
  if (error) throw new Error(error.code === "23505" ? "This email already has a pending invite for your company." : error.message);
  await adminSupabase.auth.admin.inviteUserByEmail(email, { redirectTo: inviteUrl }).catch(() => null);
  revalidatePath("/employers/team");
  redirect(`/employers/team?invited=${encodeURIComponent(email)}`);
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
  const { data: invite, error } = await adminSupabase.from("employer_team_invitations").select("id,company_id,employer_id,invited_email,status,expires_at").eq("token", token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at).getTime() < Date.now()) throw new Error("This invite is no longer valid.");
  if (invite.invited_email.toLowerCase() !== user.email.toLowerCase()) throw new Error("Please sign in using the invited email address.");
  const now = new Date().toISOString();
  const { error: memberError } = await adminSupabase.from("employer_team_members").upsert({ company_id: invite.company_id, employer_id: invite.employer_id, user_id: user.id, email: user.email.toLowerCase(), role: "recruiter", status: "active", updated_at: now }, { onConflict: "company_id,user_id" });
  if (memberError) throw new Error(memberError.message);
  await adminSupabase.from("employer_team_invitations").update({ status: "accepted", invited_user_id: user.id, accepted_at: now, updated_at: now }).eq("id", invite.id);
  redirect("/employers/talent-search");
}
