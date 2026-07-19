"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  return <header className="flex min-h-20 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenu} aria-label="Open recruiter navigation" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-100 lg:hidden"><Menu size={20}/></button><div className="min-w-0"><h2 className="truncate text-lg font-bold sm:text-xl">Recruiter Workspace</h2><p className="hidden text-sm text-zinc-500 sm:block">Hiring operations and candidate delivery</p></div></div><Link href="/recruiter/requirements" className="shrink-0 rounded-xl bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:text-sm">Assigned roles</Link></header>;
}
