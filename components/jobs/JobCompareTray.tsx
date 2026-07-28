"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { readComparedJobs } from "./JobCompareButton";

export function JobCompareTray() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => setCount(readComparedJobs().length);
    refresh(); window.addEventListener("jobiverse:compare-change", refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("jobiverse:compare-change", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  if (!count) return null;
  return <div className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-3 text-white shadow-2xl"><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 px-2 text-sm font-semibold"><GitCompareArrows size={17}/>{count}/3 jobs selected</span><Link href="/jobs/compare" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-950">Compare now <ArrowRight size={15}/></Link></div></div>;
}
