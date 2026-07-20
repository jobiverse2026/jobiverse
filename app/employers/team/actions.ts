"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { claimPendingEmployerTeamInvite } from "@/lib/employer-team/invitations";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";

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
  const access = await getEmployerCompanyAccess(user.id);
  const company = access.company;
  if (!access.isMasterEmployer && inviteRole === "employer") {
    throw new Error("Only the master employer can add employer access. Invited employers can add recruiters only.");
  }
  const managerId = access.isMasterEmployer ? company.owner_id : user.id;
  const [{ count: activeMembers }, { count: pendingInvites }, { data: duplicateInvites }, { data: activeEmployerAllowances }] = await Promise.all([
    adminSupabase.from("employer_team_members").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("role", inviteRole).eq("employer_id", managerId).eq("status", "active"),
    adminSupabase.from("employer_team_invitations").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("role", inviteRole).eq("employer_id", managerId).eq("status", "pending").gt("expires_at", new Date().toISOString()),
    adminSupabase.from("employer_team_invitations").select("invited_email").eq("company_id", company.id).eq("role", inviteRole).eq("employer_id", managerId).eq("status", "pending").in("invited_email", emails),
    access.isMasterEmployer && inviteRole === "recruiter"
      ? adminSupabase.from("employer_team_members").select("recruiter_seat_limit").eq("company_id", company.id).eq("role", "employer").eq("status", "active")
      : Promise.resolve({ data: [] }),
  ]);
  const duplicateEmails = new Set((duplicateInvites ?? []).map((invite) => String(invite.invited_email).toLowerCase()));
  const newEmails = emails.filter((email) => !duplicateEmails.has(email));
  const allocatedRecruiterSeats = (activeEmployerAllowances ?? []).reduce((total: number, member: any) => total + Number(member.recruiter_seat_limit ?? 0), 0);
  const usedSeats = (activeMembers ?? 0) + (pendingInvites ?? 0) + allocatedRecruiterSeats;
  const seatLimit = inviteRole === "employer" ? company.employer_seat_limit : (access.isMasterEmployer ? company.recruiter_seat_limit : (company.recruiter_seat_allowance ?? 0));
  if (!newEmails.length) {
    revalidatePath("/employers/team");
    revalidatePath("/employers/dashboard");
    redirect(`/employers/team?already_access=${emails.length}&role=${inviteRole}`);
  }
  if (usedSeats + newEmails.length > seatLimit) throw new Error(`${inviteRole === "employer" ? "Employer" : "Recruiter"} invite limit reached. Seats left: ${Math.max(0, seatLimit - usedSeats)}. You tried to add ${newEmails.length}. Ask JobiVerse admin to increase seats.`);
  const rows = newEmails.map((email) => ({
    company_id: company.id,
    employer_id: managerId,
    invited_email: email,
    token: crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""),
    role: inviteRole,
  }));
  const { error } = await adminSupabase.from("employer_team_invitations").insert(rows);
  if (error?.code === "23505") {
    revalidatePath("/employers/team");
    revalidatePath("/employers/dashboard");
    redirect(`/employers/team?already_access=${emails.length}&role=${inviteRole}`);
  }
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  revalidatePath("/employers/dashboard");
  const skipped = emails.length - newEmails.length;
  redirect(`/employers/team?invited_count=${newEmails.length}&already_access=${skipped}&role=${inviteRole}`);
}

export async function cancelEmployerRecruiterInvite(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("inviteId"));
  const access = await getEmployerCompanyAccess(user.id);
  let query = adminSupabase.from("employer_team_invitations").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id).eq("company_id", access.company.id).eq("status", "pending");
  if (!access.isMasterEmployer) query = query.eq("role", "recruiter").eq("employer_id", user.id);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  revalidatePath("/employers/dashboard");
  redirect("/employers/team?cancelled=1");
}

export async function updateEmployerTeamMemberStatus(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("memberId"));
  const status = z.enum(["active", "disabled"]).parse(formData.get("status"));
  const access = await getEmployerCompanyAccess(user.id);
  let query = adminSupabase.from("employer_team_members").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("company_id", access.company.id);
  if (!access.isMasterEmployer) query = query.eq("role", "recruiter").eq("employer_id", user.id);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  revalidatePath("/employers/dashboard");
  redirect(`/employers/team?member=${status === "active" ? "restored" : "suspended"}`);
}

export async function removeEmployerTeamMemberAccess(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const id = z.string().uuid().parse(formData.get("memberId"));
  const access = await getEmployerCompanyAccess(user.id);
  let query = adminSupabase
    .from("employer_team_members")
    .delete()
    .eq("id", id)
    .eq("company_id", access.company.id);
  if (!access.isMasterEmployer) query = query.eq("role", "recruiter").eq("employer_id", user.id);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  revalidatePath("/employers/dashboard");
  redirect("/employers/team?removed=1");
}

export async function updateInvitedEmployerRecruiterSeatLimit(formData: FormData) {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  if (!access.isMasterEmployer) throw new Error("Only the master employer can assign recruiter seat allowances.");
  const id = z.string().uuid().parse(formData.get("memberId"));
  const recruiterSeatLimit = z.coerce.number().int().min(0).max(500).parse(formData.get("recruiterSeatLimit"));
  const now = new Date().toISOString();
  const [{ data: employerMembers, error: employerMembersError }, { count: directActiveRecruiters, error: directActiveError }, { count: directPendingRecruiters, error: directPendingError }] = await Promise.all([
    adminSupabase
      .from("employer_team_members")
      .select("id,status,recruiter_seat_limit")
      .eq("company_id", access.company.id)
      .eq("role", "employer"),
    adminSupabase
      .from("employer_team_members")
      .select("id", { count: "exact", head: true })
      .eq("company_id", access.company.id)
      .eq("role", "recruiter")
      .eq("employer_id", access.company.owner_id)
      .eq("status", "active"),
    adminSupabase
      .from("employer_team_invitations")
      .select("id", { count: "exact", head: true })
      .eq("company_id", access.company.id)
      .eq("role", "recruiter")
      .eq("employer_id", access.company.owner_id)
      .eq("status", "pending")
      .gt("expires_at", now),
  ]);
  if (employerMembersError) throw new Error(employerMembersError.message);
  if (directActiveError) throw new Error(directActiveError.message);
  if (directPendingError) throw new Error(directPendingError.message);
  const targetEmployer = (employerMembers ?? []).find((member) => member.id === id);
  if (!targetEmployer) throw new Error("Employer access not found for this company.");
  if (targetEmployer.status !== "active") throw new Error("Restore this employer access before assigning recruiter seats.");
  const otherEmployerAllowances = (employerMembers ?? [])
    .filter((member) => member.id !== id && member.status === "active")
    .reduce((total, member) => total + Number(member.recruiter_seat_limit ?? 0), 0);
  const directRecruiterUsage = (directActiveRecruiters ?? 0) + (directPendingRecruiters ?? 0);
  const maxAllowedForThisEmployer = Math.max(0, Number(access.company.recruiter_seat_limit ?? 0) - directRecruiterUsage - otherEmployerAllowances);
  if (recruiterSeatLimit > maxAllowedForThisEmployer) {
    throw new Error(`You only have ${maxAllowedForThisEmployer} recruiter seats available for this employer. Direct recruiters and other employer allowances are already using the rest.`);
  }
  const { error } = await adminSupabase
    .from("employer_team_members")
    .update({ recruiter_seat_limit: recruiterSeatLimit, updated_at: now })
    .eq("id", id)
    .eq("company_id", access.company.id)
    .eq("role", "employer");
  if (error) throw new Error(error.message);
  revalidatePath("/employers/team");
  revalidatePath("/employers/dashboard");
  redirect("/employers/team?allowance=1");
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
