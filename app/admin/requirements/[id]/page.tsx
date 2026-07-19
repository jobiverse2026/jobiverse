import Link from "next/link";
import { ArrowLeft, ArrowRight, Globe2, ShieldCheck, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

import CompanyCard from "@/components/admin/requirement/CompanyCard";
import HiringCard from "@/components/admin/requirement/HiringCard";
import SkillsCard from "@/components/admin/requirement/SkillsCard";
import JobDescriptionCard from "@/components/admin/requirement/JobDescriptionCard";
import AdditionalInfoCard from "@/components/admin/requirement/AdditionalInfoCard";
import CommercialTermsCard from "@/components/admin/requirement/CommercialTermsCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequirementDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  await requireRole(["admin"]);

  const { data: requirement } = await adminSupabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .eq("hiring_team_requested", true)
    .maybeSingle();

  if (!requirement) {
    notFound();
  }

  const { data: company } = await adminSupabase
    .from("companies")
    .select("*")
    .eq("id", requirement.company_id)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <Link
        href="/admin/requirements"
        className="inline-flex items-center text-zinc-500 hover:text-black"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Requirements
      </Link>

      <div>
        <h1 className="text-4xl font-bold">
          {requirement.job_title}
        </h1>

        <p className="mt-2 text-lg text-zinc-500">
          {company?.company_name ?? "-"}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-2xl border p-5 ${requirement.hiring_team_requested?"border-violet-200 bg-violet-50":"border-zinc-200 bg-zinc-50"}`}><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><UsersRound size={20}/><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">JobiVerse Hiring Team</p><p className="mt-1 font-semibold">{requirement.hiring_team_requested?"Employer requested hiring support":"Not requested"}</p></div></div>{requirement.hiring_team_requested&&<Link href={`/admin/requirements/${requirement.id}/submit-candidate`} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white">Submit candidate<ArrowRight size={14}/></Link>}</div></div>
        <div className={`rounded-2xl border p-5 ${requirement.is_public?"border-emerald-200 bg-emerald-50":"border-zinc-200 bg-zinc-50"}`}><div className="flex items-center gap-3"><Globe2 size={20}/><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">JobiVerse Jobs Portal</p><p className="mt-1 font-semibold">{requirement.is_public?"Live for candidates":"Private requirement"}</p></div></div></div>
      </section>

      {requirement.hiring_team_requested && (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700">JobiVerse submission protection</p>
              <h2 className="mt-2 text-xl font-semibold text-amber-950">Candidates submitted here become visible to the employer.</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Use Submit candidate when JobiVerse has sourced or screened a profile for this mandate. The employer will see the candidate in their Submitted Candidates workspace with resume, status and interview actions.
              </p>
            </div>
          </div>
        </section>
      )}

      <CompanyCard company={company} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HiringCard requirement={requirement} />

        <SkillsCard requirement={requirement} />
      </div>

      <JobDescriptionCard requirement={requirement} />

      <AdditionalInfoCard requirement={requirement} />

      <CommercialTermsCard requirement={requirement} />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/requirements" className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-100">
          Back to requirements
        </Link>
        {requirement.hiring_team_requested && (
          <Link href={`/admin/requirements/${requirement.id}/submit-candidate`} className="rounded-xl bg-zinc-950 px-6 py-3 font-semibold text-white hover:bg-zinc-800">
            Submit candidate
          </Link>
        )}
      </div>
    </div>
  );
}
