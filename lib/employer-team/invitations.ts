import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export type EmployerTeamRole = "employer" | "recruiter";

export async function claimPendingEmployerTeamInvite({
  userId,
  email,
  expectedRole,
}: {
  userId: string;
  email: string;
  expectedRole?: EmployerTeamRole;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  let query = adminSupabase
    .from("employer_team_invitations")
    .select("id,company_id,employer_id,invited_email,status,expires_at,role")
    .eq("invited_email", normalizedEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (expectedRole) query = query.eq("role", expectedRole);

  const { data: invites, error } = await query;
  if (error) throw new Error(error.message);

  const invite = invites?.[0];
  if (!invite) return null;

  const invitedRole: EmployerTeamRole = invite.role === "employer" ? "employer" : "recruiter";
  const { data: account, error: accountError } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (accountError) throw new Error(accountError.message);
  if (account?.role && !["candidate", invitedRole].includes(account.role)) {
    throw new Error(`This invite is for a ${invitedRole} seat. Please use an account that is not already assigned to another portal.`);
  }

  const now = new Date().toISOString();
  const { error: roleError } = await adminSupabase
    .from("users")
    .update({ role: invitedRole, updated_at: now })
    .eq("id", userId);

  if (roleError) throw new Error(roleError.message);

  const { error: memberError } = await adminSupabase.from("employer_team_members").upsert(
    {
      company_id: invite.company_id,
      employer_id: invite.employer_id,
      user_id: userId,
      email: normalizedEmail,
      role: invitedRole,
      status: "active",
      updated_at: now,
    },
    { onConflict: "company_id,user_id" }
  );

  if (memberError) throw new Error(memberError.message);

  const { error: inviteError } = await adminSupabase
    .from("employer_team_invitations")
    .update({ status: "accepted", invited_user_id: userId, accepted_at: now, updated_at: now })
    .eq("id", invite.id);

  if (inviteError) throw new Error(inviteError.message);

  return { role: invitedRole, companyId: invite.company_id };
}
