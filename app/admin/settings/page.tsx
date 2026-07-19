import { CheckCircle2, ExternalLink, Rocket, ShieldAlert } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { getLaunchReadiness } from "@/lib/launch-readiness";

const manualChecks = [
  "Complete the production Supabase Auth URL, OAuth, CAPTCHA and rate-limit checklist.",
  "Complete Razorpay KYC and register the public payment/refund webhook URL.",
  "Confirm GST rates and SAC mapping with a Chartered Accountant.",
  "Obtain final review of Terms, Privacy, Refund and Cancellation policies.",
  "Connect the production domain, monitoring, backups and recovery alerts.",
];

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);
  const readiness = getLaunchReadiness();
  const percentage = Math.round((readiness.ready / readiness.total) * 100);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-9 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <Rocket />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Production control</p>
        <h1 className="mt-3 text-4xl font-bold">Launch Readiness Center</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">A safe configuration audit that reports whether required secrets exist without displaying their values.</p>
        <div className="mt-8 max-w-xl">
          <div className="flex justify-between text-xs font-semibold"><span>{readiness.ready} of {readiness.total} automated checks ready</span><span>{percentage}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${percentage}%` }} /></div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {readiness.groups.map((group) => (
          <article key={group.title} className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h2 className="text-xl font-bold">{group.title}</h2>
            <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">{group.description}</p>
            <div className="mt-6 space-y-3">
              {group.items.map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? "border-emerald-100 bg-emerald-50/50" : "border-amber-200 bg-amber-50/60"}`}>
                  <div className="flex items-center gap-2">{item.ready ? <CheckCircle2 size={17} className="text-emerald-600" /> : <ShieldAlert size={17} className="text-amber-700" />}<p className="font-semibold">{item.label}</p></div>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7">
        <div className="flex items-start gap-4"><div className="rounded-2xl bg-zinc-950 p-3 text-white"><ExternalLink size={20} /></div><div><h2 className="text-2xl font-bold">Manual production approvals</h2><p className="mt-1 text-sm text-zinc-500">These checks cannot be safely inferred from environment variables and require owner or professional confirmation.</p></div></div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {manualChecks.map((check) => <div key={check} className="flex gap-3 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" /><span>{check}</span></div>)}
        </div>
      </section>
    </div>
  );
}
