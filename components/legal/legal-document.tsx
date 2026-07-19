import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/page-header";

export type LegalSection = { title: string; content: ReactNode };

export function LegalDocument({ title, description, sections }: { title: string; description: string; sections: LegalSection[] }) {
  return <main className="min-h-screen bg-[#f5f5f3] text-zinc-950">
    <PageHeader eyebrow="Legal & Trust" title={title} description={description}/>
    <section className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl">
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-500">Effective date: 17 July 2026 | Last updated: 17 July 2026</div>
      <div className="space-y-5">{sections.map((section,index)=><article key={section.title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-9"><div className="flex gap-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-bold text-white">{index+1}</span><div><h2 className="text-xl font-bold sm:text-2xl">{section.title}</h2><div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600 sm:text-base">{section.content}</div></div></div></article>)}</div>
      <p className="mt-8 text-center text-xs leading-5 text-zinc-400">These platform policies should be reviewed by a qualified Indian legal professional before production launch.</p>
    </div></section>
  </main>;
}
