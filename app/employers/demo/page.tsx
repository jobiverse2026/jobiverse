import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { EmployerWorkspaceDemo } from "@/components/employer/EmployerWorkspaceDemo";

export const metadata: Metadata = { title: "Employer Workspace Demo | JobiVerse", description: "Interact with the JobiVerse employer workspace before choosing an employer plan." };

export default function EmployerDemoPage(){return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-7xl"><Link href="/employers" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/>Employer universe</Link><section className="py-10 text-center"><span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-violet-800"><Sparkles size={14}/>Explore before you subscribe</span><h1 className="mx-auto mt-6 max-w-5xl text-4xl font-semibold tracking-[-.055em] sm:text-7xl">Experience the hiring workspace.</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-600">Click through requirements, candidates, Talent Search and reports using safe illustrative data.</p></section><EmployerWorkspaceDemo/><section className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[2.25rem] bg-zinc-950 p-8 text-white sm:flex-row"><div><h2 className="text-2xl font-bold">Ready to build your hiring workspace?</h2><p className="mt-2 text-zinc-400">Post jobs free or unlock complete employer operations.</p></div><div className="flex flex-wrap gap-3"><Link href="/signup?role=employer" className="rounded-xl bg-white px-5 py-3 font-bold text-zinc-950">Start free</Link><Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-bold">Compare plans<ArrowRight size={16}/></Link></div></section></div></main>}

