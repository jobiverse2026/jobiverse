import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerJoinedRequirementQuery } from "@/lib/employer-team/access";

export default async function JobiverseSubmittedCard() {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const { count } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select("id,requirements!inner(employer_id,company_id)", { count: "exact", head: true }), access, user.id)
    .or("source.eq.jobiverse_hiring_team,recruiter_name.eq.JobiVerse Hiring Team");

  return (
    <Link href="/employers/candidates?source=jobiverse" className="group flex items-center justify-between gap-5 rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-zinc-50 p-7 text-zinc-950 shadow-xl transition hover:-translate-y-1">
      <div className="flex items-center gap-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-950 text-white">
          <ShieldCheck />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">JobiVerse Hiring Team</p>
          <h2 className="mt-2 text-2xl font-semibold">JobiVerse Submitted Candidates</h2>
          <p className="mt-1 text-sm text-zinc-500">Profiles sourced, screened and introduced by JobiVerse.</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-4xl font-bold">{count ?? 0}</span>
        <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </Link>
  );
}
