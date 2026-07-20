import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const nudgeMap = {
  apply: {
    eyebrow: "JobiVerse Personal",
    title: "Need guidance to move ahead in your career?",
    text: "Talk to JobiVerse directly for career direction, role positioning and practical next steps before you apply.",
    href: "/consultations",
    cta: "Book JobiVerse guidance",
  },
  resume: {
    eyebrow: "JobiVerse Personal",
    title: "Want your CV to match this role better?",
    text: "Get JobiVerse support to improve your resume, cover note and profile positioning before employers review it.",
    href: "/consultations",
    cta: "Get JobiVerse CV support",
  },
  interview: {
    eyebrow: "JobiVerse Personal",
    title: "Going for an interview?",
    text: "Book JobiVerse interview tips, mock practice or role-specific preparation before the round.",
    href: "/consultations",
    cta: "Book interview tips",
  },
  offer: {
    eyebrow: "JobiVerse Personal",
    title: "Offer stage? Make the right move.",
    text: "Talk to JobiVerse about compensation, joining decisions and next-step negotiation before you accept.",
    href: "/consultations",
    cta: "Book offer guidance",
  },
} as const;

type NudgeType = keyof typeof nudgeMap;

export function CareerServiceNudge({
  type = "apply",
  compact = false,
}: {
  type?: NudgeType;
  compact?: boolean;
}) {
  const nudge = nudgeMap[type];

  return (
    <aside className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">{nudge.eyebrow}</p>
          <h3 className={`${compact ? "mt-1 text-base" : "mt-2 text-lg"} font-semibold tracking-[-.02em] text-zinc-950`}>{nudge.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{nudge.text}</p>
          <Link href={nudge.href} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">
            {nudge.cta} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
