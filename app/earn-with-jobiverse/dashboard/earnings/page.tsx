import Link from "next/link";
import { ArrowLeft, CircleDollarSign, Clock3, Download, Landmark, WalletCards } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { requestPayout } from "./actions";

export default async function CreatorEarningsPage() {
  const { supabase, user } = await requireRole(["candidate", "creator"]);
  const [{ data: orders }, { data: requests }] = await Promise.all([
    supabase.from("marketplace_orders").select("id,creator_earning,status,payout_status,payout_eligible_at,created_at,service_title,marketplace_services(title)").eq("provider_id", user.id).order("created_at", { ascending: false }),
    supabase.from("creator_payout_requests").select("id,amount,status,payment_reference,admin_note,requested_at,processed_at").eq("creator_id", user.id).order("requested_at", { ascending: false }),
  ]);
  const rows = orders ?? [];
  // Server-render time is intentional for payout eligibility calculations.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const lifetime = rows.filter(order => order.status === "completed").reduce((sum, order) => sum + Number(order.creator_earning ?? 0), 0);
  const available = rows.filter(order => order.status === "completed" && order.payout_status === "eligible" && order.payout_eligible_at && new Date(order.payout_eligible_at).getTime() <= now).reduce((sum, order) => sum + Number(order.creator_earning ?? 0), 0);
  const clearing = rows.filter(order => ["paid", "in_progress", "delivered", "revision_requested"].includes(order.status) || (order.payout_status === "eligible" && !!order.payout_eligible_at && new Date(order.payout_eligible_at).getTime() > now)).reduce((sum, order) => sum + Number(order.creator_earning ?? 0), 0);
  const paid = rows.filter(order => order.payout_status === "paid").reduce((sum, order) => sum + Number(order.creator_earning ?? 0), 0);

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl"><Link href="/earn-with-jobiverse/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/> Creator dashboard</Link><section className="mt-8 rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Creator finance</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Earnings & payouts.</h1><p className="mt-4 max-w-2xl text-zinc-400">Every figure comes from your real paid orders. JobiVerse customer pricing remains separate from your net earning.</p></section>
  <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CircleDollarSign} label="Lifetime earned" value={money(lifetime)}/><Metric icon={WalletCards} label="Available for payout" value={money(available)}/><Metric icon={Clock3} label="In progress / clearing" value={money(clearing)}/><Metric icon={Landmark} label="Paid to you" value={money(paid)}/></section>
  <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">Withdraw available earnings</h2><p className="mt-2 text-sm text-zinc-500">Completed orders become withdrawable after their protection period ends.</p><Link href="/earn-with-jobiverse/dashboard/payout-profile" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"><Landmark size={16}/>Manage Payout Account</Link></div><form action={requestPayout}><button disabled={available <= 0} className="cursor-pointer rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500">Request payout | {money(available)}</button></form></div></section>
  <section className="mt-7 grid gap-6 xl:grid-cols-2"><div className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-2xl font-semibold">Earning ledger</h2><div className="mt-6 space-y-3">{rows.length ? rows.map(order => { const service=Array.isArray(order.marketplace_services)?order.marketplace_services[0]:order.marketplace_services; return <article key={order.id} className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-5"><div><p className="font-semibold">{service?.title ?? order.service_title ?? "Service order"}</p><p className="mt-1 text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString("en-IN")} | {order.status.replaceAll("_", " ")} | Payout {order.payout_status.replaceAll("_", " ")}</p>{order.status==="completed"&&order.payout_status==="eligible"&&order.payout_eligible_at&&<p className="mt-2 text-xs font-semibold text-amber-700">{new Date(order.payout_eligible_at).getTime()<=now?"Available now - request payout above":`Protection period ends ${new Date(order.payout_eligible_at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}`}</p>}</div><p className="font-semibold">{money(order.creator_earning)}</p></article> }) : <Empty text="Your first paid order will appear here."/>}</div></div>
  <div className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-2xl font-semibold">Payout requests</h2><div className="mt-6 space-y-3">{requests?.length ? requests.map(request => <article key={request.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{money(request.amount)}</p><p className="mt-1 text-xs text-zinc-500">Requested {new Date(request.requested_at).toLocaleDateString("en-IN")}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${request.status === "paid" ? "bg-emerald-100 text-emerald-700" : request.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{request.status}</span></div>{request.payment_reference && <p className="mt-3 text-xs text-zinc-500">Reference: {request.payment_reference}</p>}{request.admin_note && <p className="mt-3 rounded-xl bg-white p-3 text-sm text-zinc-600">{request.admin_note}</p>}<a href={`/api/creator/payouts/${request.id}/statement`} download className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold transition hover:bg-zinc-950 hover:text-white"><Download size={14}/>Download statement</a></article>) : <Empty text="No payout requests yet."/>}</div></div></section></div></main>;
}

function money(value:number|string|null){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value)||0)}
function Metric({icon:Icon,label,value}:{icon:React.ElementType;label:string;value:string}){return <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-6"><Icon className="text-zinc-400"/><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></article>}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">{text}</p>}













