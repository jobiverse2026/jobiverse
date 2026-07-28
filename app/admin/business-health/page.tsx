import Link from "next/link";
import { Activity, ArrowRight, BriefcaseBusiness, CreditCard, MailWarning, MessageSquareText, Sparkles, Users } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function BusinessHealthPage() {
  await requireRole(["admin"]);
  const now = Date.now();
  const sevenDays = new Date(now - 7 * 86400000).toISOString();
  const fourteenDays = new Date(now - 14 * 86400000).toISOString();
  const thirtyDays = new Date(now - 30 * 86400000).toISOString();
  const [users, profiles, applications, publicJobs, staleRoles, activeOrders, payments, failedPayments, feedback, support, emailFailures, nudges] = await Promise.all([
    count("users", q=>q.gte("created_at", sevenDays)),
    count("candidate_profiles", q=>q.gte("profile_completion", 60)),
    count("candidate_applications", q=>q.gte("applied_at", sevenDays)),
    count("requirements", q=>q.eq("is_public", true).not("status", "in", '("Closed","Cancelled","Filled")')),
    count("requirements", q=>q.eq("is_public", true).not("status", "in", '("Closed","Cancelled","Filled")').lte("created_at", fourteenDays)),
    count("marketplace_orders", q=>q.in("status", ["paid","in_progress","delivered","revision_requested"])),
    adminSupabase.from("payment_attempts").select("amount").eq("status", "captured").gte("created_at", thirtyDays),
    count("payment_attempts", q=>q.eq("status", "failed").gte("created_at", sevenDays)),
    count("user_feedback", q=>q.in("status", ["new","reviewing","planned"])),
    adminSupabase.from("support_conversations").select("unread_for_admin"),
    count("transactional_email_outbox", q=>q.eq("status", "failed")),
    count("lifecycle_automation_log", q=>q.gte("created_at", sevenDays)),
  ]);
  const revenue = (payments.data ?? []).reduce((sum, item:any)=>sum + Number(item.amount ?? 0), 0);
  const unreadSupport = (support.data ?? []).reduce((sum, item:any)=>sum + Number(item.unread_for_admin ?? 0), 0);
  const attention = staleRoles + failedPayments + feedback + unreadSupport + emailFailures;
  const cards = [
    {label:"New members · 7d",value:users,note:"Across all platform roles",icon:Users},
    {label:"Applications · 7d",value:applications,note:"Candidate demand activity",icon:BriefcaseBusiness},
    {label:"Captured revenue · 30d",value:money.format(revenue),note:"Successful gateway payments",icon:CreditCard},
    {label:"Lifecycle nudges · 7d",value:nudges,note:"Deduplicated retention actions",icon:Sparkles},
  ];
  const queues = [
    {label:"Stale public roles",value:staleRoles,href:"/admin/free-hiring",note:"Open for 14+ days"},
    {label:"Open feedback",value:feedback,href:"/admin/feedback",note:"New, reviewing or planned"},
    {label:"Unread support",value:unreadSupport,href:"/admin/support",note:"Waiting for JobiVerse"},
    {label:"Failed payments",value:failedPayments,href:"/admin/finance",note:"Failed during last 7 days"},
    {label:"Failed emails",value:emailFailures,href:"/admin/email-delivery",note:"Delivery action required"},
  ];
  return <div className="space-y-8"><section className="overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,.24),transparent_24rem),linear-gradient(135deg,#09090b,#27272a)] p-8 text-white"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Business health</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Know what needs attention.</h1><p className="mt-4 max-w-3xl leading-7 text-zinc-300">One operating view for acquisition, activation, jobs, commerce, retention and support.</p></div><div className={`rounded-3xl px-7 py-5 ${attention?"bg-amber-400 text-amber-950":"bg-emerald-400 text-emerald-950"}`}><p className="text-xs font-bold uppercase tracking-wider">Attention signals</p><p className="mt-2 text-5xl font-bold">{attention}</p></div></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,note,icon:Icon})=><article key={label} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={20}/></span><p className="mt-6 text-3xl font-bold">{value}</p><h2 className="mt-2 font-semibold">{label}</h2><p className="mt-1 text-sm text-zinc-500">{note}</p></article>)}</section>
    <section className="grid gap-6 xl:grid-cols-[1fr_380px]"><div className="rounded-[2.25rem] border border-zinc-200 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Platform funnel</p><h2 className="mt-2 text-3xl font-bold">Activation signals</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{[["Candidate profiles ready",profiles,"60%+ completion"],["Live public jobs",publicJobs,"Direct employer roles"],["Active service orders",activeOrders,"Paid through revision"],["New applications",applications,"Last seven days"]].map(([label,value,note])=><div key={String(label)} className="rounded-2xl bg-zinc-50 p-5"><p className="text-3xl font-bold">{value}</p><p className="mt-2 font-semibold">{label}</p><p className="mt-1 text-xs text-zinc-500">{note}</p></div>)}</div></div><aside className="rounded-[2.25rem] bg-zinc-950 p-7 text-white"><div className="flex items-center gap-3"><Activity className="text-emerald-300"/><h2 className="text-2xl font-bold">Action queue</h2></div><div className="mt-5 space-y-3">{queues.map(item=><Link key={item.label} href={item.href} className="flex items-center justify-between gap-4 rounded-2xl bg-white/[.07] p-4 hover:bg-white/[.12]"><div><p className="font-semibold">{item.label}</p><p className="mt-1 text-xs text-zinc-400">{item.note}</p></div><span className={`grid h-9 min-w-9 place-items-center rounded-full font-bold ${item.value?"bg-amber-400 text-amber-950":"bg-white/10 text-zinc-400"}`}>{item.value}</span></Link>)}</div></aside></section>
    <section className="flex flex-col justify-between gap-5 rounded-[2rem] border border-violet-200 bg-violet-50 p-7 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2 font-bold text-violet-900"><MessageSquareText size={18}/>Voice of user</div><p className="mt-2 text-sm text-violet-800">Review product feedback alongside support conversations before planning the next release.</p></div><Link href="/admin/feedback" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white">Open feedback<ArrowRight size={16}/></Link></section>
  </div>;
}

async function count(table:string, apply:(query:any)=>any){const query=adminSupabase.from(table).select("id",{count:"exact",head:true});const {count}=await apply(query);return count??0}

