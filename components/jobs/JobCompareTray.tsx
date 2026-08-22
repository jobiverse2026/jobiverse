"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, GitCompareArrows, Trash2, X } from "lucide-react";
import { readComparedJobs, writeComparedJobs, type ComparedJob } from "./JobCompareButton";

export function JobCompareTray() {
  const [jobs, setJobs] = useState<ComparedJob[]>([]);
  const [dragged, setDragged] = useState<number | null>(null);
  useEffect(() => {
    const refresh = () => setJobs(readComparedJobs());
    refresh(); window.addEventListener("jobiverse:compare-change", refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("jobiverse:compare-change", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  if (!jobs.length) return null;

  function update(next: ComparedJob[]) {
    writeComparedJobs(next);
    setJobs(next);
    window.dispatchEvent(new CustomEvent("jobiverse:compare-change"));
  }

  return <aside aria-label="Selected jobs comparison" className="fixed bottom-4 left-1/2 z-50 w-[min(94vw,1020px)] -translate-x-1/2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 text-white shadow-[0_24px_80px_rgba(0,0,0,.38)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
      <span className="flex items-center gap-2 text-sm font-semibold"><GitCompareArrows size={17}/>{jobs.length}/3 jobs selected</span>
      <button type="button" onClick={() => update([])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white"><Trash2 size={13}/>Clear all</button>
    </div>
    <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-stretch">
      {jobs.map((job, index) => <div key={job.key} draggable onDragStart={()=>setDragged(index)} onDragEnd={()=>setDragged(null)} onDragOver={event=>event.preventDefault()} onDrop={()=>{if(dragged===null||dragged===index)return;const next=[...jobs];const [moved]=next.splice(dragged,1);next.splice(index,0,moved);update(next);setDragged(null)}} className={`jv-compare-drag flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.07] px-3 py-2.5 ${dragged===index?"opacity-40 ring-2 ring-violet-400":""}`}>
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Drag to reorder · Selection {index + 1}</p><p className="truncate text-sm font-bold" title={job.title}>{job.title}</p><p className="truncate text-[11px] text-zinc-400" title={job.company}>{job.company}</p></div>
        <button type="button" onClick={() => update(jobs.filter((item) => item.key !== job.key))} aria-label={`Remove ${job.title}`} title="Remove from comparison" className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-white/10 text-zinc-300 transition hover:bg-red-500 hover:text-white"><X size={15}/></button>
      </div>)}
      <Link href="/jobs/compare" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-zinc-950 transition hover:bg-violet-100 sm:col-span-2 lg:col-span-1">Compare now <ArrowRight size={15}/></Link>
    </div>
  </aside>;
}
