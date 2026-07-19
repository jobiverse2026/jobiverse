import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { cancelEmployerRecruiterInvite, inviteEmployerRecruiter, removeEmployerTeamMemberAccess, updateEmployerTeamMemberStatus } from "./actions";

export default async function EmployerTeamPage({ searchParams }: { searchParams: Promise<{ invited?: string; cancelled?: string; member?: string; removed?: string }> }) {
  const { user } = await requireRole(["employer"]);
  const params = await searchParams;
  const { data: company } = await adminSupabase.from("companies").select("id,company_name,recruiter_seat_limit").eq("owner_id", user.id).maybeSingle();
  const [{ data: members }, { data: invites }] = company ? await Promise.all([
    adminSupabase.from("employer_team_members").select("id,email,status,role,created_at,users(full_name,avatar_url)").eq("company_id", company.id).order("created_at", { ascending: false }),
    adminSupabase.from("employer_team_invitations").select("id,invited_email,status,expires_at,created_at").eq("company_id", company.id).order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }];
  const activeMembers = (members ?? []).filter((item) => item.status === "active").length;
  const pendingInvites = (invites ?? []).filter((item) => item.status === "pending" && new Date(item.expires_at).getTime() > Date.now()).length;
  const used = activeMembers + pendingInvites;
  const seatsLeft = company ? Math.max(0, company.recruiter_seat_limit - used) : 0;
  const successMessage = params.invited
    ? `Invitation created for ${params.invited}.`
    : params.cancelled
      ? "Invitation cancelled successfully."
      : params.member === "restored"
        ? "Recruiter access restored successfully."
        : params.member === "suspended"
          ? "Recruiter suspended successfully. One seat is now available again."
          : params.removed
            ? "Recruiter access removed successfully. One seat is now available again."
            : null;

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-7xl">
    <Link href="/employers/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/>Employer dashboard</Link>
    <section className="mt-7 overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12">
      <UserPlus /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Employer team seats</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Invite company recruiters.</h1>
      <p className="mt-4 max-w-3xl text-zinc-300">Give specific people access to your employer workspace and Talent Search without opening access by domain.</p>
    </section>
    {!company ? <section className="mt-7 rounded-[2rem] border border-dashed bg-white p-14 text-center"><h2 className="text-2xl font-semibold">Create company profile first</h2><Link href="/employers/company" className="mt-5 inline-flex rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">Open company profile</Link></section> : <>
      {successMessage && <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{successMessage} If invite email is delayed, the invited person can signup/login with the same email and open the invite link.</p>}
      <section className="mt-7 grid gap-5 md:grid-cols-3"><Metric label="Seat limit" value={company.recruiter_seat_limit}/><Metric label="Seats used" value={used}/><Metric label="Seats left" value={seatsLeft}/></section>
      <section className="mt-7 grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <form action={inviteEmployerRecruiter} className="rounded-[2rem] border bg-white p-7 shadow-sm"><Mail className="text-zinc-400"/><h2 className="mt-5 text-2xl font-semibold">Invite by email</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Only this exact email can accept the invite. Seat limit is controlled by JobiVerse admin.</p><p className="mt-3 rounded-xl bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600">Seats used: {used} of {company.recruiter_seat_limit} | Seats left: {seatsLeft}</p><input name="email" type="email" required placeholder="recruiter@company.com" className="mt-5 h-13 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500"/><button disabled={used >= company.recruiter_seat_limit} className="mt-4 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Send invite</button></form>
        <section className="rounded-[2rem] border bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><UsersRound/><div><h2 className="text-2xl font-semibold">Seat management</h2><p className="text-sm text-zinc-500">Assign, suspend, restore or remove company recruiter access for {company.company_name}.</p></div></div><div className="mt-5 space-y-3">{members?.length ? members.map((member:any)=>{const person=Array.isArray(member.users)?member.users[0]:member.users;const active=member.status==="active";return <article key={member.id} className="rounded-2xl bg-zinc-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{person?.full_name || member.email}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${active?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{active?"Assigned":"Suspended"}</span></div><p className="mt-1 text-xs text-zinc-500">{member.email} | {member.role} | {active?"Using 1 seat":"Seat released"}</p></div><div className="flex flex-wrap gap-2"><form action={updateEmployerTeamMemberStatus}><input type="hidden" name="memberId" value={member.id}/><button name="status" value={active?"disabled":"active"} className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition ${active?"bg-amber-50 text-amber-700 hover:bg-amber-100":"bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{active?"Suspend":"Restore"}</button></form><form action={removeEmployerTeamMemberAccess}><input type="hidden" name="memberId" value={member.id}/><button className="cursor-pointer rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">Remove access</button></form></div></div></article>}) : <Empty text="No company recruiters yet."/>}</div></section>
      </section>
      <section className="mt-7 rounded-[2rem] border bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck/><div><h2 className="text-2xl font-semibold">Invitations</h2><p className="text-sm text-zinc-500">Pending, accepted and cancelled invite history.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2">{invites?.length ? invites.map((invite:any)=><article key={invite.id} className="rounded-2xl border border-zinc-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{invite.invited_email}</p><p className="mt-1 text-xs text-zinc-500">Expires {new Date(invite.expires_at).toLocaleDateString("en-IN")}</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold capitalize">{invite.status}</span></div>{invite.status==="pending"&&<form action={cancelEmployerRecruiterInvite} className="mt-4"><input type="hidden" name="inviteId" value={invite.id}/><button className="cursor-pointer rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">Cancel invite</button></form>}</article>) : <Empty text="No invitations yet."/>}</div></section>
    </>}
  </div></main>;
}

function Metric({label,value}:{label:string;value:number}){return <article className="rounded-3xl border bg-white p-6 shadow-sm"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-4xl font-bold">{value}</p></article>}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">{text}</p>}
