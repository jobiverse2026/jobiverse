import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarClock, CheckCircle2, ShieldCheck, SlidersHorizontal, WalletCards } from "lucide-react";

import { computeConfidenceScore, confidenceTone, type CandidateIntelligenceProfile } from "@/lib/candidate/intelligence";

export function CareerIntelligencePanel({
  profile,
  verifiedItems = 0,
  applications = 0,
  savedJobs = 0,
  resumeVersions = 0,
}: {
  profile?: CandidateIntelligenceProfile | null;
  verifiedItems?: number;
  applications?: number;
  savedJobs?: number;
  resumeVersions?: number;
}) {
  const confidence = computeConfidenceScore(profile, verifiedItems);
  const tone = confidenceTone(confidence.score);
  const walletItems = [
    ["CV versions", resumeVersions],
    ["Applications", applications],
    ["Saved jobs", savedJobs],
    ["Verified proofs", verifiedItems],
  ] as const;

  return (
    <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><ShieldCheck size={19} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Confidence layer</p>
                <h2 className="text-2xl font-semibold">Hiring Confidence Score</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
              A readiness signal based on profile depth, CV, skills, availability and verified assets. It helps hiring teams trust your profile faster.
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black tracking-[-.05em]">{confidence.score}%</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${tone.className}`}>{tone.label}</span>
          </div>
        </div>
        <div className="mt-6 rounded-[1.5rem] border border-zinc-100 bg-zinc-50/70 p-5">
          <p className="text-sm font-bold text-zinc-900">To increase your confidence score, do the below:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(confidence.missing.length ? confidence.missing : ["Profile looks strong", "Keep availability updated"]).map((item) => (
            <p key={item} className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-semibold text-zinc-600 shadow-sm">
              <CheckCircle2 className="text-emerald-600" size={17} /> {item}
            </p>
          ))}
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] bg-zinc-950 p-7 text-white shadow-2xl">
        <WalletCards />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Career wallet</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Your career assets in one place.</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {walletItems.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
        <Link href="/candidates/resume" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950">
          Manage wallet <ArrowRight size={15} />
        </Link>
      </article>

      <article className="rounded-[2rem] border border-zinc-200 bg-white p-7 xl:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={CalendarClock} title="Interview availability" text={profile?.interview_availability || "Add preferred interview slots so employers can schedule faster."} />
          <Feature icon={SlidersHorizontal} title="Deal-breaker matching" text={profile?.deal_breakers || "Add minimum salary, work mode, location or shift non-negotiables."} />
          <Feature icon={BriefcaseBusiness} title="Application health" text="Every application now shows a clear stage tracker instead of becoming a black hole." />
        </div>
      </article>
    </section>
  );
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-5">
      <Icon className="text-zinc-500" size={20} />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}
