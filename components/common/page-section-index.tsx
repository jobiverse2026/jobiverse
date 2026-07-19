import Link from "next/link";
import { ArrowDownRight } from "lucide-react";

export function PageSectionIndex({ items }: { items: Array<{ label: string; href: string; description?: string }> }) {
  return <div className="bg-[#f6f6f3] px-5 pb-10 pt-0 sm:px-8"><nav aria-label="On this page" className="relative z-20 mx-auto max-w-6xl"><div className="flex flex-col gap-2 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#111113,#29292d)] p-2 text-white shadow-[0_22px_55px_-35px_rgba(0,0,0,.75)] lg:flex-row lg:items-center"><p className="shrink-0 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-zinc-500">Explore this page</p><div className="grid flex-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">{items.map(item=><Link key={item.label} href={item.href} className="group flex items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[.07]"><p className="truncate text-xs font-semibold text-zinc-200 sm:text-sm">{item.label}</p><ArrowDownRight className="shrink-0 text-zinc-600 transition group-hover:text-white" size={15}/></Link>)}</div></div></nav></div>;
}
