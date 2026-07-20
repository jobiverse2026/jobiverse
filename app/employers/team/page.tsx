import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, ShieldCheck, UserPlus, UsersRound } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { TeamInviteForm } from "@/components/employer/team/TeamInviteForm";
import { cancelEmployerRecruiterInvite, removeEmployerTeamMemberAccess, updateEmployerTeamMemberStatus } from "./actions";

type TeamRole = "employer" | "recruiter";

export default async function EmployerTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; invited_count?: string; already_access?: string; role?: string; cancelled?: string; member?: string; removed?: string }>;
}) {
  const { user } = await requireRole(["employer"]);
  const params = await searchParams;
  const { data: company } = await adminSupabase
    .from("companies")
    .select("id,company_name,recruiter_seat_limit,employer_seat_limit")
    .eq("owner_id", user.id)
    .maybeSingle();

  const [{ data: members }, { data: invites }] = company
    ? await Promise.all([
        adminSupabase
          .from("employer_team_members")
          .select("id,email,status,role,created_at,users(full_name,avatar_url)")
          .eq("company_id", company.id)
          .order("created_at", { ascending: false }),
        adminSupabase
          .from("employer_team_invitations")
          .select("id,invited_email,status,role,expires_at,created_at")
          .eq("company_id", company.id)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const usage = {
    employer: seatUsage(members ?? [], invites ?? [], "employer"),
    recruiter: seatUsage(members ?? [], invites ?? [], "recruiter"),
  };
  const limits = {
    employer: company?.employer_seat_limit ?? 0,
    recruiter: company?.recruiter_seat_limit ?? 0,
  };
  const left = {
    employer: Math.max(0, limits.employer - usage.employer.used),
    recruiter: Math.max(0, limits.recruiter - usage.recruiter.used),
  };

  const invitedRole = params.role === "employer" ? "Employer" : "Recruiter";
  const successMessage = params.invited
    ? `${invitedRole} invitation created for ${params.invited}.`
    : params.invited_count
      ? `${params.invited_count} new ${invitedRole.toLowerCase()} access ${params.invited_count === "1" ? "entry" : "entries"} created successfully${Number(params.already_access ?? 0) > 0 ? `; ${params.already_access} already had pending access` : ""}.`
    : params.already_access
      ? `${params.already_access} ${invitedRole.toLowerCase()} ${params.already_access === "1" ? "email already has" : "emails already have"} pending access.`
    : params.cancelled
      ? "Invitation cancelled successfully."
      : params.member === "restored"
        ? "Team member access restored successfully."
        : params.member === "suspended"
          ? "Team member suspended successfully. One seat is now available again."
          : params.removed
            ? "Team member access removed successfully. One seat is now available again."
            : null;

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/employers/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600">
          <ArrowLeft size={16} />
          Employer dashboard
        </Link>

        <section className="mt-7 overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12">
          <UserPlus />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Company access seats</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Invite the right people to the right portal.</h1>
          <p className="mt-4 max-w-3xl text-zinc-300">
            Add exact email access for employer workspace users and recruiter desk users. Each invite opens only the portal assigned to that seat.
          </p>
        </section>

        {!company ? (
          <section className="mt-7 rounded-[2rem] border border-dashed bg-white p-14 text-center">
            <h2 className="text-2xl font-semibold">Create company profile first</h2>
            <Link href="/employers/company" className="mt-5 inline-flex rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">
              Open company profile
            </Link>
          </section>
        ) : (
          <>
            {successMessage && (
              <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {successMessage} The user can now sign up or log in with the exact same email. No invitation email is required.
              </p>
            )}

            <section className="mt-7 grid gap-5 md:grid-cols-2">
              <SeatCard
                icon={<BriefcaseBusiness size={20} />}
                title="Employer seats"
                description="For company owners, HR heads or hiring managers who need the employer workspace."
                limit={limits.employer}
                active={usage.employer.active}
                pending={usage.employer.pending}
                left={left.employer}
              />
              <SeatCard
                icon={<UsersRound size={20} />}
                title="Recruiter seats"
                description="For company recruiters who should work from the recruiter desk, not the employer portal."
                limit={limits.recruiter}
                active={usage.recruiter.active}
                pending={usage.recruiter.pending}
                left={left.recruiter}
              />
            </section>

            <section className="mt-7 grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
              <TeamInviteForm employerSeatsLeft={left.employer} recruiterSeatsLeft={left.recruiter} />

              <section className="rounded-[2rem] border bg-white p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <UsersRound />
                  <div>
                    <h2 className="text-2xl font-semibold">Seat management</h2>
                    <p className="text-sm text-zinc-500">Suspend, restore or remove access for {company.company_name}.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {members?.length ? (
                    members.map((member: any) => {
                      const person = Array.isArray(member.users) ? member.users[0] : member.users;
                      const active = member.status === "active";
                      const role = member.role === "employer" ? "Employer" : "Recruiter";
                      return (
                        <article key={member.id} className="rounded-2xl bg-zinc-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{person?.full_name || member.email}</p>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-600">{role}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                  {active ? "Assigned" : "Suspended"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">{member.email} | {active ? "Using 1 seat" : "Seat released"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <form action={updateEmployerTeamMemberStatus}>
                                <input type="hidden" name="memberId" value={member.id} />
                                <button
                                  name="status"
                                  value={active ? "disabled" : "active"}
                                  className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition ${active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                                >
                                  {active ? "Suspend" : "Restore"}
                                </button>
                              </form>
                              <form action={removeEmployerTeamMemberAccess}>
                                <input type="hidden" name="memberId" value={member.id} />
                                <button className="cursor-pointer rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">
                                  Remove access
                                </button>
                              </form>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <Empty text="No invited company team members yet." />
                  )}
                </div>
              </section>
            </section>

            <section className="mt-7 rounded-[2rem] border bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck />
                <div>
                  <h2 className="text-2xl font-semibold">Invitations</h2>
                  <p className="text-sm text-zinc-500">Pending, accepted and cancelled invite history.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {invites?.length ? (
                  invites.map((invite: any) => (
                    <article key={invite.id} className="rounded-2xl border border-zinc-200 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{invite.invited_email}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {invite.role === "employer" ? "Employer access" : "Recruiter access"} | Expires {new Date(invite.expires_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold capitalize">{invite.status}</span>
                      </div>
                      {invite.status === "pending" && (
                        <form action={cancelEmployerRecruiterInvite} className="mt-4">
                          <input type="hidden" name="inviteId" value={invite.id} />
                          <button className="cursor-pointer rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                            Cancel invite
                          </button>
                        </form>
                      )}
                    </article>
                  ))
                ) : (
                  <Empty text="No invitations yet." />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function seatUsage(members: any[], invites: any[], role: TeamRole) {
  const active = members.filter((item) => item.role === role && item.status === "active").length;
  const pending = invites.filter((item) => item.role === role && item.status === "pending" && new Date(item.expires_at).getTime() > Date.now()).length;
  return { active, pending, used: active + pending };
}

function SeatCard({ icon, title, description, limit, active, pending, left }: { icon: React.ReactNode; title: string; description: string; limit: number; active: number; pending: number; left: number }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">{icon}</span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        <Small label="Limit" value={String(limit)} />
        <Small label="Active" value={String(active)} />
        <Small label="Pending" value={String(pending)} />
        <Small label="Left" value={String(left)} />
      </div>
    </article>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase text-zinc-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">{text}</p>;
}
