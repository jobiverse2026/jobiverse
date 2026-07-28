"use client";

import { BellRing, BookmarkPlus, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteCandidateSearch, saveCandidateSearch } from "@/app/jobs/actions";

type Filters = {
  query: string;
  location: string;
  sector: string;
  source: "all" | "jobiverse" | "partner";
  jobType: string;
  workMode: string;
  freshness: string;
  searchIn: "role" | "company";
  radius: string;
};

export function SaveSearchControl({ filters, searches = [] }: { filters: Filters; searches?: Array<{ id: string; name: string; href: string; isAlertEnabled: boolean }> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(filters.query || (filters.sector ? `${filters.sector.replaceAll("-", " ")} jobs` : filters.location ? `${filters.location} opportunities` : "My opportunity search"));
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveCandidateSearch({ ...filters, name, alertEnabled });
      setMessage(result.message);
      setSuccess(result.ok);
      if (result.ok) setOpen(false);
    });
  }

  return <section className="mt-5 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.15em] text-zinc-400">Your searches</p><h2 className="mt-1 text-xl font-bold">Return to the right opportunities faster.</h2></div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"><BookmarkPlus size={16}/>Save this search</button>
    </div>
    {open && <div className="mt-4 grid gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name this search" className="h-11 rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500"/>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={alertEnabled} onChange={(event) => setAlertEnabled(event.target.checked)}/><BellRing size={15}/>Direct-role alerts</label>
      <button type="button" disabled={pending} onClick={save} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{pending?<LoaderCircle className="animate-spin" size={16}/>:<CheckCircle2 size={16}/>}Save</button>
    </div>}
    {message && <p role="status" className={`mt-3 text-sm font-semibold ${success ? "text-emerald-700" : "text-red-700"}`}>{message}</p>}
    {!!searches.length && <div className="mt-4 flex flex-wrap gap-2">{searches.map((search) => <span key={search.id} className="inline-flex items-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold"><a href={search.href} className="px-4 py-2">{search.name}{search.isAlertEnabled ? " · alerts on" : ""}</a><button type="button" aria-label={`Delete ${search.name}`} onClick={() => startTransition(() => deleteCandidateSearch(search.id))} className="cursor-pointer border-l border-zinc-200 px-2 py-2 text-zinc-400 hover:text-red-600"><X size={13}/></button></span>)}</div>}
  </section>;
}
