"use client";

import { CalendarDays, Menu, Search } from "lucide-react";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:min-h-24 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} aria-label="Open admin navigation" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-100 lg:hidden"><Menu size={20} /></button>
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 sm:text-sm">Welcome back</p>
          <h1 className="mt-1 truncate text-lg font-bold tracking-tight sm:text-2xl lg:text-3xl">Admin Dashboard</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-5">
        <div className="hidden items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 lg:flex">
          <Search className="h-5 w-5 text-zinc-400" />
          <input type="text" aria-label="Search admin dashboard" placeholder="Search..." className="w-48 bg-transparent text-sm outline-none placeholder:text-zinc-400 xl:w-64" />
        </div>

        <div className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 xl:flex">
          <CalendarDays className="h-5 w-5 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">{today}</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-2 py-2 sm:px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white sm:h-11 sm:w-11">A</div>
          <div className="hidden lg:block"><p className="text-sm font-semibold">Admin</p><p className="text-xs text-zinc-500">Platform control</p></div>
        </div>
      </div>
    </header>
  );
}
