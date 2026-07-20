import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export function BeforeApplyChecklist({
  hasResume,
  phone,
  expectedCtc,
  noticePeriod,
  availability,
  primarySkills,
}: {
  hasResume: boolean;
  phone?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  availability?: string;
  primarySkills?: string;
}) {
  const items = [
    ["CV uploaded", hasResume],
    ["Phone number added", Boolean(phone)],
    ["Expected CTC added", Boolean(expectedCtc)],
    ["Notice period added", Boolean(noticePeriod)],
    ["Interview availability ready", Boolean(availability)],
    ["Top skills added", Boolean(primarySkills)],
  ] as const;
  const ready = items.filter(([, done]) => done).length;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Before you apply</p>
          <h3 className="mt-1 font-semibold text-zinc-950">Readiness checklist</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-700">{ready}/{items.length} ready</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map(([label, done]) => (
          <p key={label} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-semibold text-zinc-600">
            {done ? <CheckCircle2 className="text-emerald-600" size={15} /> : <Circle className="text-zinc-300" size={15} />}
            {label}
          </p>
        ))}
      </div>
      {ready < items.length && (
        <Link href="/candidates/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950">
          Improve profile first <ArrowRight size={14} />
        </Link>
      )}
    </section>
  );
}
