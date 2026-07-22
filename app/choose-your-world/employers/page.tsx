import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, BarChart3, BriefcaseBusiness, Building2, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";

const benefits = [
  { title: "Controlled employer workspace", text: "Master employer access, restricted employer users and recruiter seats under one company.", icon: Building2 },
  { title: "Requirement operations", text: "Create roles, publish to the jobs portal, assign recruiters and track candidate flow.", icon: BriefcaseBusiness },
  { title: "Candidate pipeline visibility", text: "External applicants, recruiter-submitted candidates and JobiVerse-submitted profiles in one view.", icon: UsersRound },
  { title: "Hiring reports", text: "Recruiter performance, requirement status, candidate counts, interview movement and downloadable reports.", icon: BarChart3 },
  { title: "Talent Search add-on", text: "Locked paid access to Open to Work JobiVerse profiles after admin approval.", icon: LockKeyhole },
  { title: "Hiring protection", text: "Protected candidate introductions and clear commercial terms for portal and JobiVerse-assisted hiring.", icon: ShieldCheck },
];

const plans = [
  {
    name: "Employer Starter",
    price: "₹2,999/month",
    note: "For small teams starting structured hiring.",
    items: ["1 master employer", "2 employer seats", "2 recruiter seats", "5 active requirements", "Jobs portal posting", "Basic tracking and reports"],
  },
  {
    name: "Employer Growth",
    price: "₹7,999/month",
    note: "For SMEs with regular hiring volume.",
    items: ["1 master employer", "5 employer seats", "10 recruiter seats", "20 active requirements", "Interview calendar", "Recruiter performance reports"],
    featured: true,
  },
  {
    name: "Employer Enterprise",
    price: "Custom",
    note: "For larger hiring teams and custom workflows.",
    items: ["Custom seats", "Bulk hiring dashboard", "Dedicated JobiVerse account manager", "Custom reports", "SLA and custom terms", "Volume commercials"],
  },
];

const addons = [
  { name: "Extra employer seat", price: "₹2,000/year/seat" },
  { name: "Extra recruiter seat", price: "₹1,000/year/seat" },
  { name: "Talent Search Access", price: "₹1,999/month" },
  { name: "Featured job posting", price: "₹499–₹1,999/role" },
];

const hiringTerms = [
  { name: "JobiVerse hiring team", price: "Negotiable / standard 5%", text: "For roles actively sourced, screened and coordinated by JobiVerse." },
  { name: "Direct Jobs Portal joining", price: "3% of annual CTC", text: "If a candidate applies directly through the JobiVerse Jobs Portal and joins." },
  { name: "Candidate referral", price: "1% of annual salary", text: "Only if the referred candidate joins successfully." },
];

export default function EmployerWorldPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        <Link href="/choose-your-world" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600">
          <ArrowRight className="rotate-180" size={16} /> Choose another world
        </Link>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[3rem] bg-zinc-950 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.72)] sm:p-14 lg:p-16">
            <Building2 className="h-10 w-10" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Employer World</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[.96] tracking-[-.055em] sm:text-6xl">
              A hiring workspace built for companies, teams and accountable recruitment.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
              Employer access is not open signup. JobiVerse activates company workspaces, assigns the master employer and controls seats so hiring data stays protected.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">
                Contact JobiVerse for access <ArrowRight size={17} />
              </Link>
              <Link href="/login/employer" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white">
                Employer login
              </Link>
            </div>
          </div>

          <aside className="rounded-[3rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
            <BadgeIndianRupee className="h-9 w-9" />
            <h2 className="mt-7 text-3xl font-bold tracking-[-.04em]">Employer-only pricing summary</h2>
            <p className="mt-4 leading-7 text-zinc-600">This page shows only employer portal pricing, employer add-ons and hiring commercial terms.</p>
            <div className="mt-7 space-y-3">
              {addons.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="text-sm font-black">{item.price}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                <Icon size={21} />
              </span>
              <h2 className="mt-6 text-xl font-bold tracking-[-.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Workspace plans</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-5xl">Choose the company access level.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className={`rounded-[2.25rem] border p-7 shadow-sm ${plan.featured ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"}`}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-zinc-400" : "text-zinc-500"}`}>{plan.note}</p>
                <p className="mt-7 text-4xl font-black tracking-[-.04em]">{plan.price}</p>
                <div className="mt-7 space-y-3">
                  {plan.items.map((item) => (
                    <p key={item} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${plan.featured ? "bg-white/10 text-zinc-300" : "bg-zinc-50 text-zinc-600"}`}>{item}</p>
                  ))}
                </div>
                <Link href="/contact" className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold ${plan.featured ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>
                  Request activation <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2.75rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Hiring commercials</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-zinc-950">Placement and hiring terms.</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {hiringTerms.map((term) => (
              <article key={term.name} className="rounded-[2rem] bg-zinc-50 p-6">
                <h3 className="text-xl font-bold">{term.name}</h3>
                <p className="mt-3 text-2xl font-black">{term.price}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-600">{term.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
