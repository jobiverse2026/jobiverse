import { BadgeCheck, Sparkles } from "lucide-react";

export function JobMatchBadge({
  score,
  recommended,
  compact = false,
}: {
  score: number;
  recommended?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${recommended ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"} ${compact ? "px-3 py-1 text-[10px]" : "px-4 py-2 text-xs"} font-bold uppercase`}>
      {recommended ? <BadgeCheck size={compact ? 13 : 15} /> : <Sparkles size={compact ? 13 : 15} />}
      {score}% match {recommended ? "Recommended" : ""}
    </div>
  );
}
