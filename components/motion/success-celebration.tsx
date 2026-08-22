"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessCelebration() {
  const reduced = useReducedMotion();
  return <span aria-hidden="true" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
    {!reduced && Array.from({ length: 8 }).map((_, index) => <motion.i key={index} initial={{ opacity: 1, x: 0, y: 0, scale: 1 }} animate={{ opacity: 0, x: Math.cos(index * Math.PI / 4) * 30, y: Math.sin(index * Math.PI / 4) * 30, scale: 0 }} transition={{ duration: .75, delay: .08 }} className="absolute h-1.5 w-1.5 rounded-full bg-violet-500"/>)}
    <motion.span initial={reduced ? false : { scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}><Check size={20}/></motion.span>
  </span>;
}
