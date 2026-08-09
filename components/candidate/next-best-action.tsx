import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

type Action = { title: string; description: string; href: string; done: boolean };

export function NextBestAction({ actions }: { actions: Action[] }) {
  const completed = actions.filter((action) => action.done).length;
  const next = actions.find((action) => !action.done);
  const percent = Math.round(completed / actions.length * 100);
  return <section className="mt-6 overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-violet-700"><Sparkles size={15}/>Next best action</p><h2 className="mt-2 text-2xl font-bold text-zinc-950">{next?.title ?? "Your career workspace is ready"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{next?.description ?? "Keep your profile current and continue tracking the right opportunities."}</p></div><div className="min-w-32 rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-3xl font-bold text-zinc-950">{percent}%</p><p className="text-[10px] font-bold uppercase text-zinc-400">setup complete</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600" style={{width:`${percent}%`}}/></div>{next&&<Link href={next.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white">Continue <ArrowRight size={15}/></Link>} {!next&&<p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16}/>All essential steps completed</p>}</section>;
}
