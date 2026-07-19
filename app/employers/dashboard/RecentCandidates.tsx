"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Candidate = { id: string; full_name: string; total_experience: string | null; status: string; requirements: { job_title: string }[] | null };

export default function RecentCandidates({ candidates }: { candidates: Candidate[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold">
        Recent Candidates
      </h2>

      <div className="space-y-4">
        {!candidates.length ? <p className="text-zinc-500">No candidates shared yet.</p> : candidates.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/employers/candidates/${candidate.id}`}
            className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-zinc-50"
          >
            <div>
              <h3 className="font-semibold">
                {candidate.full_name}
              </h3>

              <p className="text-sm text-zinc-500">
                {candidate.requirements?.[0]?.job_title ?? "Hiring requirement"}
              </p>
            </div>

            <div className="text-right">
              <p>{candidate.total_experience || "Not specified"}</p>

              <span className="text-sm font-semibold text-zinc-700">
                {candidate.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
