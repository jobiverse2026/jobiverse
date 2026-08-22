"use client";

import { motion, useReducedMotion } from "framer-motion";

export function WorkflowAnimation({ type }: { type: "employer" | "creator" }) {
  const reduced = useReducedMotion();
  const steps = type === "employer" ? ["Applied", "Review", "Interview", "Offer"] : ["Offer", "Order", "Delivery", "Earnings"];
  return <div aria-label={`${type} workflow preview`} className="relative mt-6">
    <div className="absolute left-[8%] right-[8%] top-3 h-px bg-white/15" />
    {!reduced && <motion.span className="absolute top-[7px] z-10 h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,.9)]" animate={{ left: ["7%", "37%", "67%", "91%"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0,.32,.66,1] }}/>}
    <div className="relative grid grid-cols-4 gap-2">{steps.map((step,index)=><div key={step} className="text-center"><span className="mx-auto block h-6 w-6 rounded-full border-4 border-[#241733] bg-white/20"/><p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-zinc-400">{step}</p>{type === "creator" && index === 3 && <motion.p animate={reduced ? undefined : {scale:[1,1.08,1]}} transition={{duration:2,repeat:Infinity}} className="mt-1 text-xs font-black text-emerald-300">₹ earned</motion.p>}</div>)}</div>
  </div>;
}
