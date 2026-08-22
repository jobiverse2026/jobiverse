"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function JobsFilterPanel({ children, hasActiveFilters }: { children: ReactNode; hasActiveFilters: boolean }) {
  const [open, setOpen] = useState(hasActiveFilters);
  const reduced = useReducedMotion();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setOpen(media.matches || hasActiveFilters);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [hasActiveFilters]);

  return <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50/80">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="job-filter-panel" className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-zinc-800 md:hidden">
      <span className="flex items-center gap-2"><SlidersHorizontal size={17}/>{open ? "Hide filters" : "Show filters"}</span>
      <ChevronDown size={17} className={`transition ${open ? "rotate-180" : ""}`}/>
    </button>
    <AnimatePresence initial={false}>{open && <motion.div id="job-filter-panel" initial={reduced ? false : {height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={reduced ? undefined : {height:0,opacity:0}} transition={{duration:reduced?0:.25,ease:[.22,1,.36,1]}} className="overflow-hidden border-t border-zinc-200 md:block md:border-t-0"><div className="p-4">{children}</div></motion.div>}</AnimatePresence>
  </div>;
}
