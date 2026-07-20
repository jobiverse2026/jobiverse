import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileCheck2, LockKeyhole, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const pillars = [
  {
    title: "Human hiring expertise",
    text: "JobiVerse does not behave like a simple job board. We combine requirement understanding, sourcing judgement and candidate communication.",
    icon: UsersRound,
  },
  {
    title: "Transparent candidate movement",
    text: "Employers, recruiters and talent get clearer stages, notes, interview movement and application health instead of silent black-box hiring.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Protected introductions",
    text: "JobiVerse-submitted candidates carry a protected hiring trail so commercial terms and hiring activity stay visible.",
    icon: LockKeyhole,
  },
  {
    title: "Career confidence layer",
    text: "Talent can improve their JobiVerse Card, profile completeness, confidence score and career score before applying.",
    icon: Sparkles,
  },
];

const trustSignals = [
  "Verified employer and creator workflows",
  "Role-based access for admin, employer, recruiter, candidate and creator portals",
  "Secure profile, resume and marketplace delivery flow",
  "GST-ready billing and receipt foundation",
  "Manual admin controls for approvals, payouts, refunds and launch operations",
  "AI-ready architecture with paid AI features kept controlled until billing is enabled",
];

export default function WhyJobiVersePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,.22),transparent_18rem),linear-gradient(135deg,#09090b,#27272a_60%,#52525b)] p-9 text-white shadow-[0_40px_120px_-60px_rgba(0,0,0,.75)] sm:p-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 left-12 h-64 w-64 rounded-full border border-white/[.06]" />
          <BadgeCheck />
          <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-zinc-400">Trust layer</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-.055em] sm:text-7xl">Why JobiVerse is built differently.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">A hiring universe for employers, professionals, students and creators — designed with real recruitment operations, career intelligence and commercial protection from day one.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/employers" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">For employers <ArrowRight size={16} /></Link>
            <Link href="/candidates" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-4 font-bold">For talent</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><pillar.icon size={20} /></span>
              <h2 className="mt-6 text-xl font-semibold">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{pillar.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <ShieldCheck className="text-zinc-500" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Public trust promise</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">Built for confidence before scale.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500">JobiVerse is launching as a premium recruitment and HR technology platform. Payments, AI, creator services and employer access are designed with admin controls so the business can scale without losing operational visibility.</p>
          </div>
          <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <FileCheck2 className="text-zinc-500" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-400">What is already designed in</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustSignals.map((signal) => (
                <p key={signal} className="rounded-2xl bg-zinc-50 p-4 text-sm font-medium leading-6 text-zinc-700">{signal}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
