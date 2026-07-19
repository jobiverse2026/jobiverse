import { ReceiptIndianRupee } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import BillingEditor from "@/components/admin/billing/BillingEditor";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function AdminBillingPage() {
  const { supabase } = await requireRole(["admin"]);
  const { data: placements, error } = await supabase.from("placements").select("*, candidates(full_name), requirements(job_title, companies(company_name))").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const totalFees = (placements ?? []).reduce((sum, item) => sum + Number(item.placement_fee ?? 0), 0);
  const totalGst = (placements ?? []).reduce((sum, item) => sum + Number(item.gst_amount ?? 0), 0);
  const pending = (placements ?? []).filter((item) => !["paid", "cancelled"].includes(item.payment_status)).length;

  return <div className="space-y-8"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Finance control</p><h1 className="mt-2 text-4xl font-bold">Placement Billing</h1><p className="mt-3 text-zinc-500">Commercial terms, invoices and payment tracking from live placement data.</p></div><div className="grid gap-5 md:grid-cols-3"><Stat label="Placement fees" value={money.format(totalFees)} /><Stat label="GST payable" value={money.format(totalGst)} /><Stat label="Pending invoices" value={String(pending)} /></div>{!placements?.length ? <div className="rounded-3xl border border-dashed p-16 text-center text-zinc-500">No placements available for billing.</div> : <div className="grid gap-6 xl:grid-cols-2">{placements.map((placement) => <article key={placement.id} className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-zinc-500">{placement.requirements?.companies?.company_name ?? "Company"}</p><h2 className="mt-1 text-xl font-bold">{placement.candidates?.full_name}</h2><p className="mt-1 text-sm text-zinc-500">{placement.requirements?.job_title}</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize">{placement.payment_status.replaceAll("_", " ")}</span></div><div className="mt-6 grid grid-cols-3 gap-3"><Metric label="Fee" value={placement.placement_fee ? money.format(placement.placement_fee) : "Terms pending"} /><Metric label="GST 18%" value={placement.gst_amount ? money.format(placement.gst_amount) : "-"} /><Metric label="Total" value={placement.placement_fee ? money.format(Number(placement.placement_fee) + Number(placement.gst_amount ?? 0)) : "-"} /></div><BillingEditor placement={placement} /></article>)}</div>}</div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl border bg-white p-6"><ReceiptIndianRupee className="text-zinc-400" /><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-zinc-50 p-4"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
