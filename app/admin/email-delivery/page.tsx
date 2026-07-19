import { CheckCircle2, Mail, RotateCcw, ShieldAlert } from "lucide-react";

import { retryEmailDelivery } from "./actions";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

type DeliveryStatus = "queued" | "processing" | "sent" | "failed" | "skipped";

const statusStyle: Record<DeliveryStatus, string> = {
  queued: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-zinc-200 text-zinc-600",
};

export default async function AdminEmailDeliveryPage() {
  await requireRole(["admin"]);

  const { data: deliveries, error } = await adminSupabase
    .from("transactional_email_outbox")
    .select("id,recipient_email,category,subject,status,attempts,last_error,created_at,sent_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  const rows = deliveries ?? [];
  const counts = {
    queued: rows.filter((item) => item.status === "queued" || item.status === "processing").length,
    sent: rows.filter((item) => item.status === "sent").length,
    failed: rows.filter((item) => item.status === "failed").length,
    skipped: rows.filter((item) => item.status === "skipped").length,
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-9 text-white">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
        <Mail />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Transactional communication</p>
        <h1 className="mt-3 text-4xl font-bold">Email Delivery</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Monitor notification emails, identify provider failures and safely return failed deliveries to the queue.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Queued / processing" value={counts.queued} icon={<Mail size={20} />} />
        <Metric label="Sent" value={counts.sent} icon={<CheckCircle2 size={20} />} />
        <Metric label="Failed" value={counts.failed} icon={<ShieldAlert size={20} />} tone="danger" />
        <Metric label="Preferences skipped" value={counts.skipped} icon={<RotateCcw size={20} />} />
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7">
        <div>
          <h2 className="text-2xl font-bold">Latest deliveries</h2>
          <p className="mt-1 text-sm text-zinc-500">Showing the latest 100 queue records. Skipped means the user disabled that email category.</p>
        </div>
        <div className="mt-6 space-y-3">
          {rows.length ? rows.map((item) => (
            <article key={item.id} className={`rounded-2xl border p-5 ${item.status === "failed" ? "border-red-200 bg-red-50/50" : "border-zinc-100 bg-zinc-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.subject}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.recipient_email} | {item.category} | {new Date(item.created_at).toLocaleString("en-IN")}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusStyle[item.status as DeliveryStatus] ?? statusStyle.queued}`}>{item.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">Attempts: {item.attempts}{item.sent_at ? ` | Sent ${new Date(item.sent_at).toLocaleString("en-IN")}` : ""}</p>
                {item.status === "failed" && (
                  <form action={retryEmailDelivery}>
                    <input type="hidden" name="emailId" value={item.id} />
                    <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"><RotateCcw size={14} />Retry delivery</button>
                  </form>
                )}
              </div>
              {item.last_error && <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-5 text-red-700">{item.last_error}</p>}
            </article>
          )) : <p className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500">No transactional emails have entered the queue yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone?: "danger" }) {
  return <article className={`rounded-3xl border bg-white p-6 ${tone === "danger" && value > 0 ? "border-red-200" : "border-zinc-200"}`}><div className={tone === "danger" && value > 0 ? "text-red-600" : "text-zinc-400"}>{icon}</div><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>;
}
