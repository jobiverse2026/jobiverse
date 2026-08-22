import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, GraduationCap, MapPin } from "lucide-react";

const collections = [
  ["Freshers & first jobs", "Entry-level, graduate and trainee opportunities.", "/jobs?collection=freshers", GraduationCap],
  ["Internships", "Internship and apprenticeship opportunities with practical exposure.", "/jobs?collection=internships", BriefcaseBusiness],
  ["New this week", "Recently published opportunities across the JobiVerse catalogue.", "/jobs?collection=new", Clock3],
  ["Remote opportunities", "Early-career roles you can explore beyond your city.", "/jobs?collection=remote", MapPin],
] as const;

export default function StudentJobsPage(){return <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl"><section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Student opportunity desk</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Fresh opportunities, less noise.</h1><p className="mt-5 max-w-2xl leading-7 text-zinc-300">Choose a student-friendly collection. The same cached JobiVerse catalogue powers these results, so listings stay current without unnecessary server usage.</p></section><div className="mt-8 grid gap-5 md:grid-cols-2">{collections.map(([title,text,href,Icon])=><Link key={title} href={href} className="group rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Icon size={26}/><h2 className="mt-7 text-2xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-zinc-500">{text}</p><span className="mt-7 inline-flex items-center gap-2 font-bold">View jobs <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></Link>)}</div><p className="mt-8 text-center text-sm text-zinc-500">Always verify the source and never pay an application or interview fee.</p></div></main>}
