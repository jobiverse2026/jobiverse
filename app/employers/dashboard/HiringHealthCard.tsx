import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

function tone(score: number) {
  if (score >= 75) return "text-emerald-300";
  if (score >= 45) return "text-amber-300";
  return "text-red-300";
}

export default function HiringHealthCard({ score, activeRequirements, candidates, interviews, positionsClosed }: { score: number; activeRequirements: number; candidates: number; interviews: number; positionsClosed: number }) {
  const signals = [
    ["Requirement coverage", activeRequirements ? `${candidates} profiles across ${activeRequirements} active roles` : "No active roles yet", CheckCircle2],
    ["Interview movement", `${interviews} scheduled interviews`, Clock3],
    ["Closure progress", `${positionsClosed} positions closed`, ShieldCheck],
  ] as const;

  return (
    <section className="overflow-hidden rounded-[2.5rem] bg-zinc-950 p-7 text-white shadow-2xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <BarChart3 />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Employer hiring health</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Hiring Health Score</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">A practical signal for funnel health, based on active requirements, submitted profiles, interview movement and closures.</p>
        </div>
        <div className="text-right">
          <p className={`text-6xl font-black tracking-[-.06em] ${tone(score)}`}>{score}%</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Live score</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {signals.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <Icon size={17} className="text-zinc-400" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-200">{value}</p>
          </div>
        ))}
      </div>
      <Link href="/employers/reports" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950">
        Open detailed reports <ArrowRight size={15} />
      </Link>
    </section>
  );
}
