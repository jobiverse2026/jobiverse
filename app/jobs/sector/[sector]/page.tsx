import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Search, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getJobSector, JOB_SECTORS } from "@/lib/jobs/sectors";

export function generateStaticParams() { return JOB_SECTORS.map((sector) => ({ sector: sector.value })); }

export async function generateMetadata({params}:{params:Promise<{sector:string}>}):Promise<Metadata> {
  const {sector}=await params;const item=getJobSector(sector);if(!item)return {};
  return {title:`${item.label} Jobs in India | JobiVerse`,description:`Explore current ${item.label.toLowerCase()} opportunities across India from JobiVerse employers and clearly attributed partner job feeds.`,alternates:{canonical:`/jobs/sector/${item.value}`}};
}

export default async function SectorJobsLanding({params}:{params:Promise<{sector:string}>}) {
  const {sector}=await params;const item=getJobSector(sector);if(!item)notFound();
  const cities=["Mumbai","Bengaluru","Delhi NCR","Hyderabad","Pune","Chennai"];
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-7xl">
    <section className="relative overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,.3),transparent_30rem),linear-gradient(135deg,#09090b,#27272a)] p-9 text-white sm:p-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em]"><Sparkles size={14}/>Sector universe</span>
      <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-.05em] sm:text-7xl">{item.label} jobs in India.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">Discover current roles from direct JobiVerse employers and licensed or public partner feeds. Filter by city, work mode, employment type and freshness.</p>
      <Link href={`/jobs?sector=${item.value}`} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-zinc-950">Explore live {item.label} roles<ArrowRight size={17}/></Link>
    </section>
    <section className="mt-8 grid gap-5 md:grid-cols-3"><Feature icon={Search} title="Focused discovery" text={`Search roles categorized for the ${item.label} sector.`}/><Feature icon={MapPin} title="City-wise filters" text="Narrow opportunities across major Indian hiring cities and remote work."/><Feature icon={Building2} title="Clear attribution" text="Know whether a role is direct or hosted by an original partner source."/></section>
    <section className="mt-12 rounded-[2.5rem] border border-zinc-200 bg-white p-8 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Popular location searches</p><h2 className="mt-2 text-3xl font-bold">Find {item.label.toLowerCase()} roles near you.</h2><div className="mt-6 flex flex-wrap gap-3">{cities.map((city)=><Link key={city} href={`/jobs?sector=${item.value}&location=${encodeURIComponent(city)}&radius=40`} className="rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold hover:border-violet-300 hover:bg-violet-50">{city}<ArrowRight className="ml-2 inline" size={14}/></Link>)}</div></section>
  </div></main>;
}

function Feature({icon:Icon,title,text}:{icon:typeof BriefcaseBusiness;title:string;text:string}){return <article className="rounded-[2rem] border border-zinc-200 bg-white p-7"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={20}/></span><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></article>}
