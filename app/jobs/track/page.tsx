import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Radar } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { trackPartnerApplication } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TrackPartnerJobPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams;
  const clean = (key: string) => String(values[key] ?? "").slice(0, key === "url" ? 2000 : 300);
  const payload = { id: clean("id"), provider: clean("provider"), title: clean("title"), company: clean("company"), location: clean("location"), url: clean("url") };
  if (!payload.id || !payload.title || !payload.provider || !payload.url.startsWith("https://")) redirect("/jobs");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: identity } = user ? await supabase.from("users").select("role,is_active").eq("id", user.id).maybeSingle() : { data: null };
  if (!user || identity?.role !== "candidate" || identity.is_active === false) {
    const next = `/jobs/track?${new URLSearchParams(payload).toString()}`;
    redirect(`/login/candidate?next=${encodeURIComponent(next)}`);
  }

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-4xl">
    <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/>Back to jobs</Link>
    <section className="mt-7 overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_80%_15%,rgba(139,92,246,.35),transparent_22rem),linear-gradient(135deg,#09090b,#27272a)] p-8 text-white sm:p-12">
      <Radar/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-violet-300">Universal application tracker</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Keep this opportunity in your orbit.</h1><p className="mt-4 max-w-2xl leading-7 text-zinc-300">Applied on a partner website? Add it to JobiVerse so your direct and external applications stay visible in one career timeline.</p>
    </section>
    <form action={trackPartnerApplication} className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-9">
      <input type="hidden" name="externalJobId" value={payload.id}/><input type="hidden" name="provider" value={payload.provider}/><input type="hidden" name="title" value={payload.title}/><input type="hidden" name="company" value={payload.company}/><input type="hidden" name="location" value={payload.location}/><input type="hidden" name="applyUrl" value={payload.url}/>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">{payload.provider}</p><h2 className="mt-2 text-3xl font-bold">{payload.title}</h2><p className="mt-2 text-zinc-500">{payload.company || "Company not disclosed"} · {payload.location || "Location not specified"}</p></div><a href={payload.url} target="_blank" rel="nofollow sponsored noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold">Open original <ExternalLink size={15}/></a></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Your current stage<select name="status" defaultValue="Applied" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4"><option>Saved</option><option>Applied</option><option>Response awaited</option></select></label><label className="text-sm font-semibold">Private note<input name="notes" maxLength={1500} placeholder="Follow-up date, contact or reminder" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4"/></label></div>
      <div className="mt-7 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 className="mr-2 inline" size={17}/>Only you can see and update external application records.</div>
      <button className="mt-6 w-full cursor-pointer rounded-xl bg-zinc-950 px-6 py-4 font-semibold text-white">Add to Career Activity</button>
    </form>
  </div></main>;
}
