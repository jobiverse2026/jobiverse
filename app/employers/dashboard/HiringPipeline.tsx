"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HiringPipeline({ pipeline }: { pipeline: { stage: string; value: number }[] }) {
  const maximum = Math.max(...pipeline.map((item) => item.value), 1);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-lg"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Hiring funnel board</p>
          <h2 className="mt-2 text-2xl font-bold">Stage-wise candidate movement</h2>
        </div>
        <Link href="/employers/candidates" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold">Open pipeline</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pipeline.map((item) => (
          <Link href={`/employers/candidates?status=${encodeURIComponent(item.stage)}`} key={item.stage} className="block rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{item.stage}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">{item.value}</span>
            </div>

            <div className="h-3 rounded-full bg-zinc-100">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-black via-zinc-700 to-zinc-400 transition-all"
                style={{
                  width: `${(item.value / maximum) * 100}%`,
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
