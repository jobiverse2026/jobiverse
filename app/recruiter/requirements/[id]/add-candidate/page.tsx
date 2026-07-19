import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import CandidateForm from "@/components/recruiter/candidate/CandidateForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AddCandidatePage({
  params,
}: Props) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  // Requirement

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .single();

  if (!requirement) {
    notFound();
  }

  // Company

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", requirement.company_id)
    .single();

  return (

    <div className="mx-auto max-w-5xl space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">

          Add Candidate

        </h1>

        <p className="mt-3 text-zinc-500">

          Submit a candidate for this hiring requirement.

        </p>

      </div>

      {/* Requirement Summary */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-200
        bg-white
        p-8
        "
      >

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <p className="text-sm text-zinc-500">
              Company
            </p>

            <p className="mt-1 text-lg font-semibold">
              {company?.company_name}
            </p>

          </div>

          <div>

            <p className="text-sm text-zinc-500">
              Position
            </p>

            <p className="mt-1 text-lg font-semibold">
              {requirement.job_title}
            </p>

          </div>

          <div>

            <p className="text-sm text-zinc-500">
              Department
            </p>

            <p className="mt-1 font-semibold">
              {requirement.department}
            </p>

          </div>

          <div>

            <p className="text-sm text-zinc-500">
              Work Mode
            </p>

            <p className="mt-1 font-semibold">
              {requirement.work_mode}
            </p>

          </div>

        </div>

      </div>

      {/* Candidate Form */}

      <CandidateForm
        requirement={requirement}
      />

    </div>

  );

}
