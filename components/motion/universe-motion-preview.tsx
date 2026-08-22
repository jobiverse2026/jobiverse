"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell, BriefcaseBusiness, CircleDollarSign, FileText, GraduationCap, UsersRound } from "lucide-react";

export function UniverseMotionPreview({ type }: { type: "professional" | "student" | "employer" | "creator" }) {
  const reduced = useReducedMotion();
  const icons = { professional: FileText, student: GraduationCap, employer: UsersRound, creator: CircleDollarSign };
  const Icon = icons[type];
  const labels = { professional: ["Profile", "Matched", "Interview"], student: ["Learn", "Prepare", "Apply"], employer: ["Applied", "Review", "Hire"], creator: ["Offer", "Deliver", "Earn"] }[type];
  return <div aria-hidden="true" className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-3">
    <div className="flex items-center gap-2"><motion.span animate={reduced ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity }} className="grid h-8 w-8 place-items-center rounded-xl bg-white text-violet-950"><Icon size={15}/></motion.span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: "20%" }} animate={{ width: reduced ? "72%" : ["20%", "72%", "44%"] }} transition={{ duration: 4.5, repeat: Infinity }} className="h-full rounded-full bg-violet-300"/></div>{type === "professional" ? <Bell size={13} className="text-violet-200"/> : <BriefcaseBusiness size={13} className="text-white/40"/>}</div>
    <div className="mt-3 grid grid-cols-3 gap-1.5">{labels.map((label,index)=><motion.span key={label} animate={reduced ? undefined : { opacity: [.35, 1, .35] }} transition={{ duration: 3, repeat: Infinity, delay: index*.55 }} className="rounded-lg bg-white/[.07] px-1 py-2 text-center text-[8px] font-bold uppercase tracking-wide text-white/60">{label}</motion.span>)}</div>
  </div>;
}
