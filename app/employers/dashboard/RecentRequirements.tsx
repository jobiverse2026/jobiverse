"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Requirement = { id: string; job_title: string; status: string; assigned_recruiter: string | null; created_at: string; candidates: { count: number }[] };

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
              <th className="pb-4">Recruiter</th>
              <th className="pb-4">Candidates</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {!requirements.length ? <tr><td colSpan={4} className="py-10 text-center text-zinc-500">No requirements created yet.</td></tr> : requirements.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-none"
              >
                <td className="py-5 font-semibold">
                  <Link href={`/employers/requirements/${item.id}`} className="transition hover:text-zinc-500">{item.job_title}</Link>
                </td>

                <td>{item.assigned_recruiter ? "Assigned" : "Unassigned"}</td>

                <td>{item.candidates?.[0]?.count ?? 0}</td>

                <td>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
