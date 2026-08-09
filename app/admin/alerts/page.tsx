import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing, CreditCard, MailWarning, MessageSquareWarning, PackageCheck, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function AdminAlertsPage() {
  await requireRole(["admin"]);
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();
  const hourAgo = new Date(now - 3600000).toISOString();
  const [failedPayments, failedEmails, support, stuckOrders, recentSignups, openReports] = await Promise.all([
    count("payment_attempts", (q) => q.eq("status", "failed").gte("created_at", weekAgo)),
    count("transactional_email_outbox", (q) => q.eq("status", "failed")),
    adminSupabase.from("support_conversations").select("unread_for_admin"),
    count("marketplace_orders", (q) => q.in("status", ["paid", "in_progress", "revision_requested"]).lte("updated_at", twoDaysAgo)),
    count("users", (q) => q.gte("created_at", hourAgo)),
    count("job_reports", (q) => q.in("status", ["open", "reviewing"])),
  ]);
  const unreadSupport = (support.data ?? []).reduce((sum, item) => sum + Number(item.unread_for_admin ?? 0), 0);
  const alerts = [
    { title: "Failed payments", value: failedPayments, detail: "Last 7 days", href: "/admin/finance", icon: CreditCard, high: true },
    { title: "Failed emails", value: failedEmails, detail: "Needs delivery action", href: "/admin/email-delivery", icon: MailWarning, high: true },
    { title: "Unread support", value: unreadSupport, detail: "Waiting for admin response", href: "/admin/support", icon: MessageSquareWarning, high: false },
    { title: "Stuck service orders", value: stuckOrders, detail: "No movement for 48+ hours", href: "/admin/marketplace", icon: PackageCheck, high: false },
    { title: "Open safety reports", value: openReports, detail: "Open or under review", href: "/admin/trust-safety", icon: ShieldAlert, high: true },
    { title: "Signup spike", value: recentSignups >= 20 ? recentSignups : 0, detail: `${recentSignups} registrations in the last hour`, href: "/admin/registration-tracker", icon: BellRing, high: false },
  ];
  const total = alerts.reduce((sum, item) => sum + item.value, 0);
  return <div className="space-y-8"><section className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 p-9 text-white sm:p-12"><AlertTriangle/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-red-300">Operational early warning</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Admin Alert Center</h1><p className="mt-4 max-w-3xl text-zinc-300">Live signals for payments, email delivery, support, marketplace delays, trust and unusual registration activity.</p><div className={`mt-7 inline-flex rounded-2xl px-5 py-3 font-bold ${total ? "bg-amber-400 text-amber-950" : "bg-emerald-400 text-emerald-950"}`}>{total ? `${total} attention signals` : "No active signals"}</div></section><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{alerts.map(({title,value,detail,href,icon:Icon,high})=><Link key={title} href={href} className={`group rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${value && high ? "border-red-200 bg-red-50" : value ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}><div className="flex items-center justify-between"><Icon className={value ? "text-red-600" : "text-zinc-400"}/><span className={`rounded-full px-3 py-1 text-xs font-bold ${value ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-500"}`}>{value}</span></div><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{detail}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">Open queue <ArrowRight size={13}/></span></Link>)}</section></div>;
}

async function count(table: string, apply: (query: any) => any) {
  const { count: value, error } = await apply(adminSupabase.from(table).select("id", { count: "exact", head: true }));
  if (error && !["PGRST205", "42P01", "42703"].includes(error.code)) throw new Error(error.message);
  return value ?? 0;
}
