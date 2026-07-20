import Link from "next/link";
import { CheckCircle2, LogIn, UserPlus } from "lucide-react";

import { acceptEmployerInvitation } from "@/app/employers/team/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function EmployerInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: invite } = await adminSupabase
    .from("employer_team_invitations")
    .select("invited_email,status,role,expires_at,companies(company_name)")
    .eq("token", token)
    .maybeSingle();
  const company = Array.isArray(invite?.companies) ? invite?.companies[0] : invite?.companies;
  const valid = invite?.status === "pending" && new Date(invite.expires_at).getTime() > Date.now();
  const role = invite?.role === "recruiter" ? "recruiter" : "employer";
  const roleLabel = role === "recruiter" ? "company recruiter" : "employer team member";
  const next = encodeURIComponent(`/employer-invite/${token}`);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 py-28">
      <section className="mx-auto max-w-2xl rounded-[2.5rem] border bg-white p-8 text-center shadow-xl sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-950 text-white">
          <UserPlus />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Company team invite</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Join {company?.company_name || "an employer team"} on JobiVerse.</h1>

        {!valid ? (
          <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            This invitation is expired, cancelled or already accepted.
          </p>
        ) : user ? (
          <>
            <p className="mt-5 text-sm leading-6 text-zinc-500">
              Signed in as {user.email}. Accepting will add this account as a <strong>{roleLabel}</strong> for {invite.invited_email}.
            </p>
            <form action={acceptEmployerInvitation} className="mt-7">
              <input type="hidden" name="token" value={token} />
              <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 font-semibold text-white">
                <CheckCircle2 size={18} />
                Accept {role === "recruiter" ? "recruiter" : "employer"} invite
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-5 text-sm leading-6 text-zinc-500">
              This invite is for <strong>{invite.invited_email}</strong> as a <strong>{roleLabel}</strong>. Sign up or log in using this same email.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href={`/signup?role=${role}&next=${next}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">
                <UserPlus size={17} />
                Create account
              </Link>
              <Link href={`/login/${role}?next=${next}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 font-semibold">
                <LogIn size={17} />
                Login
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
