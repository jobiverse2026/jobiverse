import Link from "next/link";
import { ArrowLeft, Globe2, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import CompanyCard from "@/components/admin/requirement/CompanyCard";
import HiringCard from "@/components/admin/requirement/HiringCard";
import SkillsCard from "@/components/admin/requirement/SkillsCard";
import JobDescriptionCard from "@/components/admin/requirement/JobDescriptionCard";
import AdditionalInfoCard from "@/components/admin/requirement/AdditionalInfoCard";
import StatusCard from "@/components/admin/requirement/StatusCard";
import RecruiterCard from "@/components/admin/requirement/RecruiterCard";
import ActionButtons from "@/components/admin/requirement/ActionButtons";
import CommercialTermsCard from "@/components/admin/requirement/CommercialTermsCard";
import PublishJobCard from "@/components/admin/requirement/PublishJobCard";

import { getRecruiters } from "@/lib/recruiters";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequirementDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .single();

  if (!requirement) {
    notFound();
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", requirement.company_id)
    .single();

  const recruiters = await getRecruiters();

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
        <div className={`rounded-2xl border p-5 ${requirement.hiring_team_requested?"border-violet-200 bg-violet-50":"border-zinc-200 bg-zinc-50"}`}><div className="flex items-center gap-3"><UsersRound size={20}/><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">JobiVerse Hiring Team</p><p className="mt-1 font-semibold">{requirement.hiring_team_requested?"Employer requested hiring support":"Not requested"}</p></div></div></div>
        <div className={`rounded-2xl border p-5 ${requirement.is_public?"border-emerald-200 bg-emerald-50":"border-zinc-200 bg-zinc-50"}`}><div className="flex items-center gap-3"><Globe2 size={20}/><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">JobiVerse Jobs Portal</p><p className="mt-1 font-semibold">{requirement.is_public?"Live for candidates":"Private requirement"}</p></div></div></div>
      </section>

      <CompanyCard company={company} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HiringCard requirement={requirement} />

        <SkillsCard requirement={requirement} />
      </div>

      <JobDescriptionCard requirement={requirement} />

      <AdditionalInfoCard requirement={requirement} />

      <CommercialTermsCard requirement={requirement} />

      <PublishJobCard requirement={requirement} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusCard requirement={requirement} />

        <RecruiterCard
          requirement={requirement}
          recruiters={recruiters}
        />
      </div>

      <ActionButtons />
    </div>
  );
}
