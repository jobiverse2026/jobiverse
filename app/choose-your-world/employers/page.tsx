import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const benefits = [
  { title: "Free employer workspace", text: "Create your company profile, publish roles and manage direct applicants without an upfront subscription.", access: "Free", icon: Building2 },
  { title: "Free Jobs Portal posting", text: "Post roles for ₹0 upfront, reach JobiVerse talent and pay only after a successful direct hire.", access: "Free", icon: BriefcaseBusiness },
  { title: "Submitted candidate workspace", text: "Unlock recruiter-submitted and JobiVerse-submitted profiles with clear source attribution and workflow controls.", access: "Subscription", icon: UsersRound },
  { title: "Hiring reports", text: "Unlock requirement status, candidate counts, interviews, outcomes and recruiter performance reporting.", access: "Subscription", icon: BarChart3 },
  { title: "Talent Search add-on", text: "Optional paid access to Open to Work JobiVerse profiles after payment and admin approval.", access: "Paid add-on", icon: LockKeyhole },
  { title: "Hiring protection", text: "Protected candidate introductions and transparent commercial terms for portal and assisted hiring.", access: "JobiVerse", icon: ShieldCheck },
];

const plans = [
  {
    name: "Free Hiring",
    price: "₹0 upfront",
    note: "For every company that wants to start hiring now.",
    items: ["Company workspace", "Free public job posting", "Direct applicant pipeline", "Interview scheduling", "Hiring status tracking", "3% of annual CTC only after a direct applicant joins"],
  },
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
  { name: "Free public job posting", price: "₹0 upfront" },
  { name: "Extra employer seat", price: "₹2,000/year/seat" },
  { name: "Extra recruiter seat", price: "₹1,000/year/seat" },
  { name: "Talent Search Access", price: "₹1,999/month" },
  { name: "Featured job posting", price: "₹499–₹1,999/role" },
];

const hiringTerms = [
  { name: "JobiVerse hiring team", price: "Negotiable / standard 5%", text: "For roles actively sourced, screened and coordinated by JobiVerse." },
  { name: "Direct Jobs Portal joining", price: "3% of annual CTC", text: "Due only if a candidate applies directly through the JobiVerse Jobs Portal and successfully joins." },
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
            <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Employer World · Free to start</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[.96] tracking-[-.055em] sm:text-6xl">
              Post jobs free. Build your hiring pipeline before buying a subscription.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
              Create a free employer account, publish roles for ₹0 upfront and manage direct applicants in one protected workspace. If a Jobs Portal applicant joins, JobiVerse charges a one-time 3% of annual CTC success fee.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup?role=employer" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">
                Post a job free <ArrowRight size={17} />
              </Link>
              <Link href="/login/employer" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white">
                Employer login
              </Link>
            </div>
          </div>

          <aside className="rounded-[3rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
            <BadgeIndianRupee className="h-9 w-9" />
            <h2 className="mt-7 text-3xl font-bold tracking-[-.04em]">Start free. Upgrade when needed.</h2>
            <p className="mt-4 leading-7 text-zinc-600">Job posting and the direct applicant workflow are free upfront. Team seats, Talent Search and premium visibility remain optional paid upgrades.</p>
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
          {benefits.map(({ title, text, access, icon: Icon }) => (
            <article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21} /></span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${access === "Free" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"}`}>{access}</span>
              </div>
              <h2 className="mt-6 text-xl font-bold tracking-[-.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{text}</p>
            </article>
          ))}
        </section>

        <section id="employer-plans" className="mt-14 scroll-mt-32">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Workspace access</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-5xl">Begin free. Add operating power as you grow.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.name} className={`rounded-[2.25rem] border p-7 shadow-sm ${plan.featured ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"}`}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-zinc-400" : "text-zinc-500"}`}>{plan.note}</p>
                <p className="mt-7 text-4xl font-black tracking-[-.04em]">{plan.price}</p>
                <div className="mt-7 space-y-3">
                  {plan.items.map((item) => <p key={item} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${plan.featured ? "bg-white/10 text-zinc-300" : "bg-zinc-50 text-zinc-600"}`}>{item}</p>)}
                </div>
                <Link href={plan.name === "Free Hiring" ? "/signup?role=employer" : "/plans?audience=employer"} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold ${plan.featured ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>
                  {plan.name === "Free Hiring" ? "Create free account" : "Request activation"} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2.75rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Hiring commercials</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-zinc-950">Clear terms. No posting surprise.</h2>
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
