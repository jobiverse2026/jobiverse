import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Crown,
  LockKeyhole,
  Search,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";

type Entitlements = {
  coreSubscriptionActive: boolean;
  corePlanName: string | null;
  talentSearchActive: boolean;
  teamSeatsActive: boolean;
};

const coreTools = [
  {
    title: "Submitted Candidates",
    description: "View JobiVerse and recruiter-submitted profiles, statuses, interviews and offers.",
    href: "/employers/candidates",
    icon: UsersRound,
  },
  {
    title: "Team Seats",
    description: "Invite employer users and recruiters with controlled company access.",
    href: "/employers/team",
    icon: Users,
  },
  {
    title: "Advanced Reports",
    description: "Download hiring funnels, requirement performance and recruiter quality reports.",
    href: "/employers/reports",
    icon: BarChart3,
  },
  {
    title: "Hiring Intelligence",
    description: "Monitor hiring health, candidate movement and requirement fulfilment in one view.",
    href: "/employers/dashboard#hiring-intelligence",
    icon: ShieldCheck,
  },
];

export default function SubscriptionToolsSection({ entitlements }: { entitlements: Entitlements }) {
  const coreActive = entitlements.coreSubscriptionActive;

  return (
    <section className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-6 text-white shadow-2xl sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-36 right-24 h-72 w-72 rounded-full bg-white/[.04] blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-300">
            <Crown size={15} /> Subscription workspace
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            {coreActive ? `${entitlements.corePlanName ?? "Employer plan"} is active.` : "Unlock your complete hiring operating system."}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
            Free hiring stays available for job posting and direct applicants. The tools below activate with the relevant employer subscription or approved add-on.
          </p>
        </div>
        <span className={`w-fit rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.16em] ${coreActive ? "bg-emerald-300 text-emerald-950" : "bg-white text-zinc-950"}`}>
          {coreActive ? "Core plan active" : "Upgrade to unlock"}
        </span>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {coreTools.map(({ title, description, href, icon: Icon }) => {
          const unlocked = title === "Team Seats" ? entitlements.teamSeatsActive : coreActive;
          return (
            <Link
              key={title}
              href={unlocked ? href : "/plans?audience=employer"}
              className="group flex min-h-60 flex-col rounded-[2rem] border border-white/10 bg-white/[.06] p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[.1]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950"><Icon size={21} /></span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${unlocked ? "bg-emerald-300 text-emerald-950" : "bg-black/30 text-zinc-300"}`}>
                  {!unlocked && <LockKeyhole size={12} />} {unlocked ? "Included" : "Locked"}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                {unlocked ? "Open tool" : "View plans"} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}

        <Link
          href={entitlements.talentSearchActive ? "/employers/talent-search" : "/plans?audience=employer"}
          className="group flex min-h-60 flex-col rounded-[2rem] border border-amber-300/25 bg-gradient-to-br from-amber-300/15 to-white/[.04] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-amber-200/50"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-200 text-amber-950"><Search size={21} /></span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${entitlements.talentSearchActive ? "bg-emerald-300 text-emerald-950" : "bg-amber-200 text-amber-950"}`}>
              {!entitlements.talentSearchActive && <LockKeyhole size={12} />} {entitlements.talentSearchActive ? "Active" : "Add-on"}
            </span>
          </div>
          <h3 className="mt-7 text-xl font-semibold">Talent Search</h3>
          <p className="mt-3 flex-1 text-sm leading-6 text-zinc-300">Search consent-based Open to Work profiles with role, skill, location and salary filters.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-100">
            {entitlements.talentSearchActive ? "Search talent" : "Request access"} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <div className="relative mt-6 grid gap-4 rounded-[2rem] border border-white/10 bg-black/20 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Employer subscriptions</p>
          <h3 className="mt-2 text-2xl font-semibold">Need seats, reports and structured hiring collaboration?</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Compare Starter, Growth and Enterprise plans. Job posting remains free even if you do not upgrade.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/choose-your-world/employers#employer-plans" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-zinc-950">
            Compare plans <ArrowRight size={15} />
          </Link>
          <Link href="/plans?audience=employer" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[.06] px-5 py-3.5 text-sm font-bold text-white">
            Manage subscription
          </Link>
        </div>
      </div>
    </section>
  );
}
