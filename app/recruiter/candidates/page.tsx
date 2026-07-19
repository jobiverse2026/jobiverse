import { createServerSupabaseClient } from "@/lib/supabase/server";

import CandidatePipeline from "@/components/recruiter/candidate/CandidatePipeline";

import type { Candidate } from "@/types/candidate";

export default async function RecruiterCandidatesPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("candidates")
    .select(
      `
      *,
      requirements (
        job_title
      )
    `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    return (
      <div className="mx-auto max-w-7xl">
        <div
          className="
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-8
          text-red-700
          "
        >
          <h1 className="text-2xl font-bold">
            Unable to load candidates
          </h1>

          <p className="mt-2">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const candidates = await Promise.all(
    ((data as Candidate[]) ?? []).map(async (candidate) => {
      if (!candidate.resume_path) return { ...candidate, resume_url: null };

      const { data: signedResume } = await supabase.storage
        .from("candidate-resumes")
        .createSignedUrl(candidate.resume_path, 3600);

      return { ...candidate, resume_url: signedResume?.signedUrl ?? null };
    })
  );

  return (
    <div
      className="
      mx-auto
      max-w-[1800px]
      space-y-8
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Candidate Pipeline
          </h1>

          <p className="mt-2 text-zinc-500">
            Drag candidates between stages to
            update their recruitment status.
          </p>
        </div>

        <div
          className="
          rounded-2xl
          border
          bg-white
          px-6
          py-4
          shadow-sm
          "
        >
          <p className="text-sm text-zinc-500">
            Total Candidates
          </p>

          <p className="mt-1 text-3xl font-bold">
            {candidates.length}
          </p>
        </div>
      </div>

      {/* Empty State */}

      {candidates.length === 0 ? (
        <div
          className="
          rounded-3xl
          border-2
          border-dashed
          border-zinc-300
          bg-zinc-50
          py-24
          text-center
          "
        >
          <h2 className="text-2xl font-bold">
            No Candidates Found
          </h2>

          <p className="mt-3 text-zinc-500">
            Submit your first candidate to
            start managing your recruitment
            pipeline.
          </p>
        </div>
      ) : (
        <CandidatePipeline
          candidates={candidates}
        />
      )}
    </div>
  );
}
