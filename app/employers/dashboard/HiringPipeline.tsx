"use client";

import { motion } from "framer-motion";

export default function HiringPipeline({ pipeline }: { pipeline: { stage: string; value: number }[] }) {
  const maximum = Math.max(...pipeline.map((item) => item.value), 1);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold">
        Hiring Pipeline
      </h2>

      <div className="space-y-6">
        {pipeline.map((item) => (
          <div key={item.stage}>
            <div className="mb-2 flex justify-between">
              <span>{item.stage}</span>
              <span>{item.value}</span>
            </div>

            <div className="h-3 rounded-full bg-zinc-100">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-black via-zinc-700 to-zinc-400"
                style={{
                  width: `${(item.value / maximum) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
