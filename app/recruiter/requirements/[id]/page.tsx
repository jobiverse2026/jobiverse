import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

import CompanyCard from "@/components/admin/requirement/CompanyCard";
import ContactCard from "@/components/admin/requirement/ContactCard";
import HiringCard from "@/components/admin/requirement/HiringCard";
import SkillsCard from "@/components/admin/requirement/SkillsCard";
import JobDescriptionCard from "@/components/admin/requirement/JobDescriptionCard";
import AdditionalInfoCard from "@/components/admin/requirement/AdditionalInfoCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RecruiterRequirementDetailsPage({
  params,
}: Props) {

  const { id } = await params;

  const { user } = await requireRole(["recruiter"]);

  // Requirement

  const { data: requirement } = await adminSupabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .single();

  if (!requirement) {
    notFound();
  }
  const { data: assignment } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("id")
    .eq("requirement_id", id)
    .eq("recruiter_id", user.id)
    .maybeSingle();
  if (requirement.assigned_recruiter !== user.id && !assignment) notFound();

  // Company

  const { data: company } = await adminSupabase
    .from("companies")
    .select("*")
    .eq("id", requirement.company_id)
    .single();

  // Contact

  const { data: contact } = await adminSupabase
    .from("employer_contacts")
    .select("*")
    .eq("company_id", requirement.company_id)
    .single();

  return (

    <div className="space-y-8">

      {/* Back */}

      <Link
        href="/recruiter/requirements"
        className="
        inline-flex
        items-center
        text-zinc-500
        hover:text-black
        "
      >

        <ArrowLeft className="mr-2 h-4 w-4" />

        Back to My Requirements

      </Link>

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">

          {requirement.job_title}

        </h1>

        <p className="mt-2 text-lg text-zinc-500">

          {company?.company_name ?? "-"}

        </p>

      </div>

            {/* Company + Contact */}

      <div className="grid gap-6 lg:grid-cols-2">

        <CompanyCard
          company={company}
        />

        <ContactCard
          contact={contact}
        />

      </div>

      {/* Hiring */}

      <div className="grid gap-6 lg:grid-cols-2">

        <HiringCard
          requirement={requirement}
        />

        <SkillsCard
          requirement={requirement}
        />

      </div>

      {/* Job Description */}

      <JobDescriptionCard
        requirement={requirement}
      />

      {/* Additional Info */}

      <AdditionalInfoCard
        requirement={requirement}
      />

            {/* Recruiter Information */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-200
        bg-white
        p-8
        "
      >

        <h2 className="text-2xl font-bold">
          Recruiter Assignment
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div>

            <p className="text-sm text-zinc-500">
              Recruiter
            </p>

            <p className="mt-1 font-semibold">
              Assigned to your recruiter account
            </p>

          </div>

          <div>

            <p className="text-sm text-zinc-500">
              Email
            </p>

            <p className="mt-1 font-semibold break-all">
              Protected account email
            </p>

          </div>

        </div>

      </div>

      {/* Candidate Module */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-200
        bg-white
        p-8
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Candidates
            </h2>

            <p className="mt-2 text-zinc-500">
              Submit candidates for this requirement.
            </p>

          </div>

          <Link
            href={`/recruiter/requirements/${requirement.id}/add-candidate`}
            className="
            rounded-xl
            bg-black
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-zinc-800
            "
          >
            + Add Candidate
          </Link>

        </div>

        <div
          className="
          mt-10
          rounded-2xl
          border
          border-dashed
          border-zinc-300
          p-10
          text-center
          "
        >

          <h3 className="text-xl font-semibold">
            No Candidates Submitted
          </h3>

          <p className="mt-3 text-zinc-500">
            Recruiters can start submitting candidates
            using the button above.
          </p>

        </div>

      </div>

            {/* Bottom Actions */}

      <div className="flex flex-wrap gap-4">

        <Link
          href="/recruiter/requirements"
          className="
          rounded-xl
          border
          border-zinc-300
          px-6
          py-3
          font-semibold
          transition
          hover:bg-zinc-100
          "
        >
          ← Back
        </Link>

        <Link
          href={`/recruiter/requirements/${requirement.id}/add-candidate`}
          className="
          rounded-xl
          bg-green-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-green-700
          "
        >
          + Submit Candidate
        </Link>

      </div>

    </div>

  );

}
