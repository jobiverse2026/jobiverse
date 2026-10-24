import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, CalendarDays, CreditCard, Search, UsersRound } from "lucide-react";

type Props = { companyName?: string | null; industry?: string | null; activeRequirements: number; candidates: number; coreActive: boolean };

const hiringTools = [
  { icon: BriefcaseBusiness, title: "Requirements", text: "Create, publish and manage open roles.", href: "/employers/requirements", cta: "Manage roles" },
  { icon: UsersRound, title: "Candidate pipeline", text: "Review direct applicants and recruiter submissions.", href: "/employers/candidates", cta: "Review candidates" },
  { icon: CalendarDays, title: "Interviews", text: "Coordinate interview rounds, feedback and decisions.", href: "/employers/interviews", cta: "Open interviews" },
  { icon: UsersRound, title: "Hiring team", text: "Manage employer seats and authorised recruiters.", href: "/employers/team", cta: "Manage team" },
  { icon: Search, title: "Talent Search", text: "Find open-to-work professionals with controlled access.", href: "/employers/talent-search", cta: "Search talent" },
  { icon: BarChart3, title: "Hiring reports", text: "Track requirement, source and recruiter performance.", href: "/employers/reports", cta: "View reports" },
] as const;

export function EmployerCommandCenter({ companyName, industry, activeRequirements, candidates, coreActive }: Props) {
  return <div className="space-y-8">
    <section className="jv-brand-gradient relative overflow-hidden rounded-[3rem] p-8 text-white shadow-2xl sm:p-12">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-violet-200"><Building2 size={15}/> Employer hiring workspace</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-.055em] text-white sm:text-7xl">Hire the right people.<br/>Manage every step.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">Publish roles, work with authorised recruiters, review candidates, schedule interviews and track hiring outcomes from one focused portal.</p></div>
        <div className="rounded-[2rem] border border-white/15 bg-white/[.08] p-6 backdrop-blur"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">{companyName || "Your company"}</p><p className="mt-2 text-sm text-zinc-300">{industry || "Complete your company profile"}</p><div className="mt-5 grid grid-cols-2 gap-3"><Metric value={activeRequirements} label="Active roles"/><Metric value={candidates} label="Candidates"/></div><div className="mt-5 flex flex-wrap gap-4 text-sm font-bold"><Link href="/employers/company" className="inline-flex items-center gap-2">Company profile <ArrowRight size={15}/></Link><Link href="/employers/billing" className="inline-flex items-center gap-2 text-violet-200"><CreditCard size={15}/>{coreActive ? "Plan active" : "Plans & billing"}</Link></div></div>
      </div>
    </section>
    <section><p className="text-xs font-black uppercase tracking-[.2em] text-violet-700">Recruitment command centre</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em] text-zinc-950 sm:text-5xl">Everything your hiring team needs.</h2><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{hiringTools.map(({icon:Icon,title,text,href,cta})=><article key={title} className="group rounded-[2.25rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-950 text-white"><Icon size={22}/></span><h3 className="mt-6 text-2xl font-bold tracking-[-.03em] text-zinc-950">{title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">{text}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-950">{cta}<ArrowRight className="transition group-hover:translate-x-1" size={16}/></Link></article>)}</div></section>
  </div>;
}

function Metric({value,label}:{value:number;label:string}){return <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-zinc-300">{label}</p></div>}
