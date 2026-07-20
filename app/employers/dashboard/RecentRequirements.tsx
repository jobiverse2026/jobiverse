"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";

type Requirement = {
  id: string;
  job_title: string;
  status: string;
  assigned_recruiter: string | null;
  created_at: string;
  is_public?: boolean | null;
  hiring_team_requested?: boolean | null;
  candidate_count?: number;
  latest_candidate_status?: string | null;
  candidate_status_counts?: { stage: string; count: number }[];
};

export default function RecentRequirements({ requirements }: { requirements: Requirement[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-lg"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Recent Requirements
        </h2>

        <Link
          href="/employers/requirements"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left text-sm text-zinc-500">
              <th className="pb-4">Position</th>
              <th className="pb-4">Hiring channel</th>
              <th className="pb-4">Candidates</th>
              <th className="pb-4">Candidate status</th>
              <th className="pb-4">Requirement status</th>
            </tr>
          </thead>

          <tbody>
            {!requirements.length ? <tr><td colSpan={5} className="py-10 text-center text-zinc-500">No requirements created yet.</td></tr> : requirements.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-none"
              >
                <td className="py-5 font-semibold">
                  <Link href={`/employers/requirements/${item.id}`} className="transition hover:text-zinc-500">{item.job_title}</Link>
                </td>

                <td>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.hiring_team_requested ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"}`}>
                      {item.hiring_team_requested ? "JobiVerse Team" : item.assigned_recruiter ? "Company recruiter" : "Self managed"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_public ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                      {item.is_public ? "Jobs portal live" : "Private"}
                    </span>
                  </div>
                </td>

                <td>
                  <Link href={`/employers/candidates?requirement=${item.id}`} className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5">
                    <Users size={14} />
                    {item.candidate_count ?? 0} submitted
                  </Link>
                </td>

                <td>
                  <div className="flex flex-wrap gap-2">
                    {item.candidate_status_counts?.length ? item.candidate_status_counts.map((status) => (
                      <Link key={status.stage} href={`/employers/candidates?requirement=${item.id}&status=${encodeURIComponent(status.stage)}`} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                        {status.stage}: {status.count}
                      </Link>
                    )) : <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">No candidates</span>}
                  </div>
                </td>

                <td>
                  <Link href={`/employers/requirements/${item.id}`} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200">
                    {requirementStatusLabel(item.status)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function requirementStatusLabel(status?: string | null) {
  const value = String(status ?? "").toLowerCase().replaceAll("_", " ").trim();
  if (["open", "sourcing"].includes(value)) return "Working";
  if (value === "interview") return "Interview stage";
  if (value === "offer") return "Offer stage";
  if (["joined", "closed", "filled"].includes(value)) return "Filled";
  if (value === "on hold") return "On Hold";
  if (value === "cancelled") return "Cancelled";
  return status || "Working";
}
