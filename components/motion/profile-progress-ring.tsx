"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ProfileProgressRing({ value, label = "ready", size = 88 }: { value: number; label?: string; size?: number }) {
  const reduced=useReducedMotion(); const safe=Math.max(0,Math.min(100,value)); const radius=34; const circumference=2*Math.PI*radius;
  return <div className="relative grid shrink-0 place-items-center" style={{width:size,height:size}}><svg viewBox="0 0 80 80" className="h-full w-full -rotate-90"><circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="6"/><motion.circle cx="40" cy="40" r={radius} fill="none" stroke="#a78bfa" strokeLinecap="round" strokeWidth="6" strokeDasharray={circumference} initial={reduced?false:{strokeDashoffset:circumference}} animate={{strokeDashoffset:circumference*(1-safe/100)}} transition={{duration:reduced?0:1.1,ease:[.22,1,.36,1]}}/></svg><div className="absolute text-center text-white"><p className="text-lg font-black">{safe}%</p><p className="text-[8px] font-bold uppercase tracking-wider text-violet-200">{label}</p></div></div>;
}
