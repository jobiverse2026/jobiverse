import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  Crown,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
  Store,
  UsersRound,
  WalletCards,
} from "lucide-react";

const employerPlans = [
  {
    name: "Starter Hiring",
    price: "Free to start",
    note: "For first conversations and basic requirement sharing.",
    features: ["Submit hiring requirements", "JobiVerse team callback", "Basic employer workspace", "Manual hiring support"],
    cta: "Start as employer",
    href: "/signup?role=employer",
  },
  {
    name: "Growth Hiring",
    price: "Seats from ₹1,000/year",
    note: "For teams needing seats, reports and structured hiring access.",
    featured: true,
    features: ["Employer seats: ₹2,000/year/seat", "Recruiter seats: ₹1,000/year/seat", "Reports and export access", "Candidate pipeline tracking"],
    cta: "Request plan",
    href: "/plans",
  },
  {
    name: "Enterprise / Consulting",
    price: "Custom",
    note: "For higher-volume hiring, ATS/CRM support and managed recruitment.",
    features: ["Custom seats and workflows", "JobiVerse hiring team support", "Negotiable success fee", "Company-level analytics"],
    cta: "Talk to JobiVerse",
    href: "/contact",
  },
];

const candidateRevenue = [
  ["Premium CV templates", "Editable designs, owned CV library and paid downloads.", "From ₹50"],
  ["Resume & profile services", "Expert resume writing, review, LinkedIn and portfolio help.", "From ₹149"],
  ["Interview & career guidance", "Mock interviews, career roadmaps and salary prep.", "From ₹299"],
  ["JobiVerse Card upgrades", "Verification and featured profile options for better trust.", "Coming soon"],
];

const creatorRevenue = [
  ["Service sales", "Creators set their base earning; JobiVerse adds platform margin for customers."],
  ["CV template downloads", "Creators can upload original editable templates and earn on every sale."],
  ["Featured placement", "Below ₹1,000 service price: 50% featured fee. Higher services use tiered featured pricing."],
  ["Verified creator badge", "Optional trust layer for expert profiles and services."],
];

const monetizationCards = [
  {
    title: "Talent Search Access",
    text: "Employers and approved recruiters can discover open-to-work candidates after paid access is approved.",
    icon: Search,
  },
  {
    title: "Job Posting & Featured Roles",
    text: "Published roles remain visible, with future boosts for urgent or featured hiring.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Creator Marketplace",
    text: "Career experts, resume writers, mentors and template creators can earn through JobiVerse.",
    icon: Store,
  },
  {
    title: "Campus & Events",
    text: "Paid workshops, campus partnerships, hiring drives and employability programmes.",
    icon: GraduationCap,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-zinc-950">
      <section className="px-5 pb-12 pt-36 sm:px-8">
        <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,.18),transparent_24rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] p-8 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200">
                <WalletCards size={15} /> JobiVerse pricing
              </span>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-.06em] sm:text-7xl">
                Multiple revenue streams. One hiring universe.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Keep core discovery accessible, then monetize premium hiring access, career services, creator offerings, templates, verification and consulting.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/plans" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-zinc-950">
                  Request a plan <ArrowRight size={18} />
                </Link>
                <Link href="/marketplace" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-semibold">
                  Explore services
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {monetizationCards.map(({ title, text, icon: Icon }) => (
                <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[.07] p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950"><Icon size={21} /></span>
                  <h2 className="mt-6 text-xl font-semibold">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Employer plans</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Companies pay when they need speed, access and control.</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {employerPlans.map((plan) => (
              <article key={plan.name} className={`rounded-[2.5rem] border bg-white p-7 shadow-sm ${plan.featured ? "border-zinc-950 shadow-2xl" : "border-zinc-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${plan.featured ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"}`}>
                    {plan.featured ? <Crown size={21} /> : <Building2 size={21} />}
                  </span>
                  {plan.featured && <span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-bold uppercase text-white">Suggested</span>}
                </div>
                <h3 className="mt-7 text-2xl font-bold">{plan.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{plan.note}</p>
                <p className="mt-7 text-4xl font-semibold tracking-[-.04em]">{plan.price}</p>
                <div className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex gap-2 text-sm text-zinc-600"><Check className="shrink-0 text-emerald-600" size={17} />{feature}</p>
                  ))}
                </div>
                <Link href={plan.href} className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold ${plan.featured ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"}`}>
                  {plan.cta} <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-6 lg:grid-cols-2">
          <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10">
            <FileText />
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Candidate monetization</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Career upgrades stay optional.</h2>
            <div className="mt-8 space-y-3">
              {candidateRevenue.map(([title, text, price]) => (
                <div key={title} className="flex flex-col justify-between gap-3 rounded-2xl bg-zinc-50 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{text}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-700">{price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-zinc-950 p-7 text-white sm:p-10">
            <Sparkles />
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Creator economy</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Experts earn. JobiVerse earns with them.</h2>
            <div className="mt-8 space-y-3">
              {creatorRevenue.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[.05] p-5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/earn-with-jobiverse" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-zinc-950">
              Become a creator <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 pt-10 sm:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-5 lg:grid-cols-3">
          <article className="rounded-[2.5rem] border border-zinc-200 bg-white p-8">
            <BadgeCheck />
            <h2 className="mt-5 text-2xl font-bold">Success fees</h2>
            <p className="mt-3 leading-7 text-zinc-600">Direct Jobs Portal joining can be tracked at 3% one-time placement fee. Candidate referral fee is 1% of annual salary only if the referred candidate joins. JobiVerse-managed hiring remains negotiable or as per commercial agreement.</p>
          </article>
          <article className="rounded-[2.5rem] border border-zinc-200 bg-white p-8">
            <UsersRound />
            <h2 className="mt-5 text-2xl font-bold">Seat-based access</h2>
            <p className="mt-3 leading-7 text-zinc-600">Employer seats are ₹2,000/year/seat and recruiter seats are ₹1,000/year/seat. Admin assigns master employer access and seat limits.</p>
          </article>
          <article className="rounded-[2.5rem] border border-zinc-200 bg-white p-8">
            <BriefcaseBusiness />
            <h2 className="mt-5 text-2xl font-bold">Premium unlocks</h2>
            <p className="mt-3 leading-7 text-zinc-600">Talent Search Access is ₹1,999/month. Featured creator services are charged separately for 30-day premium placement.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
