"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, X } from "lucide-react";

export type ComparedJob = {
  key: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  employmentType: string;
  salary: string;
  estimatedMin: number;
  estimatedMax: number;
  trustScore: number;
  trustLabel: string;
  source: string;
  href: string;
  external: boolean;
};

export const COMPARE_STORAGE_KEY = "jobiverse-job-comparison-v1";

export function readComparedJobs(): ComparedJob[] {
  try {
    // Comparisons are intentionally temporary. Also remove selections saved by
    // the older implementation so they cannot reappear in a future session.
    localStorage.removeItem(COMPARE_STORAGE_KEY);
    return JSON.parse(sessionStorage.getItem(COMPARE_STORAGE_KEY) || "[]").slice(0, 3);
  } catch {
    return [];
  }
}

export function writeComparedJobs(jobs: ComparedJob[]) {
  sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(jobs.slice(0, 3)));
}

export function JobCompareButton({ job }: { job: ComparedJob }) {
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    const refresh = () => setSelected(readComparedJobs().some((item) => item.key === job.key));
    refresh();
    window.addEventListener("jobiverse:compare-change", refresh);
    return () => window.removeEventListener("jobiverse:compare-change", refresh);
  }, [job.key]);

  function toggle() {
    const current = readComparedJobs();
    const exists = current.some((item) => item.key === job.key);
    const next = exists ? current.filter((item) => item.key !== job.key) : [...current, job].slice(-3);
    writeComparedJobs(next);
    setSelected(!exists);
    window.dispatchEvent(new CustomEvent("jobiverse:compare-change"));
  }

  return <button type="button" onClick={toggle} aria-pressed={selected} aria-label={selected ? `Remove ${job.title} from comparison` : `Add ${job.title} to comparison`} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${selected ? "border-violet-700 bg-violet-700 text-white hover:border-red-600 hover:bg-red-600" : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-400"}`}>{selected ? <X size={13}/> : <GitCompareArrows size={13}/>} {selected ? "Remove" : "Compare"}</button>;
}
