import { Lightbulb, Sparkles } from "lucide-react";

export function JobInsightCard({
  reasons,
  missingSkills,
}: {
  reasons: string[];
  missingSkills?: string[];
}) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><Lightbulb size={19} /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Why this job?</p>
          <h2 className="text-2xl font-bold">Profile-based insights</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {reasons.map((reason) => (
          <p key={reason} className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-600">
            <Sparkles className="text-zinc-500" size={15} /> {reason}
          </p>
        ))}
      </div>
      {!!missingSkills?.length && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Skills to strengthen before applying: <strong>{missingSkills.join(", ")}</strong>
        </p>
      )}
    </section>
  );
}
