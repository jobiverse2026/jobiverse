const statusStyles: Record<string, string> = {
  pending_payment: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-violet-200 bg-violet-50 text-violet-700",
  revision_requested: "border-orange-200 bg-orange-50 text-orange-700",
  delivered: "border-cyan-200 bg-cyan-50 text-cyan-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  refunded: "border-zinc-300 bg-zinc-100 text-zinc-600",
};

export function OrderStatusBadge({ status, dark = false }: { status: string; dark?: boolean }) {
  const style = dark && status === "completed" ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300" : dark ? "border-white/10 bg-white/10 text-white" : (statusStyles[status] ?? "border-zinc-200 bg-white text-zinc-600");
  return <span className={`h-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${style}`}>{status.replaceAll("_", " ")}</span>;
}
