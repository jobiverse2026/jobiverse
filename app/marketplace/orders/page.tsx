import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, HandCoins, PackageOpen } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CounterOfferActions } from "@/components/marketplace/counter-offer-actions";
import { OrderStatusBadge } from "@/components/marketplace/order-status-badge";
import { filterOrders, OrderFilterTabs } from "@/components/marketplace/order-filter-tabs";

export default async function CustomerOrdersPage({ searchParams }: { searchParams: Promise<{ created?: string; status?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/marketplace/orders");
  const [{ data: rawOrders }, { data: loadedOffers }] = await Promise.all([
    supabase.from("marketplace_orders").select("id,amount,status,requirements,created_at,marketplace_services(title,delivery_days)").eq("customer_id", user.id).order("created_at", { ascending: false }),
    supabase.from("marketplace_offers").select("id,customer_offer,counter_customer_amount,status,message,created_at,marketplace_services(title)").eq("customer_id", user.id).order("created_at", { ascending: false }),
  ]);
  const orderIds = (rawOrders ?? []).map((order) => order.id);
  const [{ data: activeDisputes }, { data: unreadUpdates }] = await Promise.all([orderIds.length ? supabase.from("marketplace_disputes").select("order_id").in("order_id", orderIds).in("status", ["open", "reviewing"]) : Promise.resolve({ data: [] }),orderIds.length ? supabase.from("notifications").select("reference_id").eq("user_id",user.id).in("reference_id",orderIds).is("read_at",null) : Promise.resolve({ data: [] })]);
  const disputedOrderIds = new Set((activeDisputes ?? []).map((item) => item.order_id));
  const updatedOrderIds = new Set((unreadUpdates ?? []).map((item) => item.reference_id));
  const allOrders = (rawOrders ?? []).map((order) => ({ ...order, isDisputed: disputedOrderIds.has(order.id) }));
  const { created, status = "all" } = await searchParams;
  const offers = status === "all" ? loadedOffers : [];
  const orders = filterOrders(allOrders, status);
  const hasActivity = Boolean(orders.length || offers?.length);

  return <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl">
    {created === "1" && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Order created successfully. Payment is pending.</div>}
    <section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">JobiVerse Marketplace</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">My orders.</h1><p className="mt-4 text-zinc-400">Track negotiations, payments, bookings and service delivery in one place.</p></section>
    {!!allOrders.length && <OrderFilterTabs basePath="/marketplace/orders" active={status} orders={allOrders}/>} 
    {!hasActivity ? <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7"><div className="py-16 text-center"><PackageOpen className="mx-auto text-zinc-300" size={44}/><h2 className="mt-5 text-xl font-semibold">No orders yet</h2><p className="mt-2 text-sm text-zinc-500">Book or negotiate a creator service to see it here.</p><Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Explore services <ArrowRight size={16}/></Link></div></section> : <>
      {offers?.length ? <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7"><div className="mb-5 flex items-center gap-3"><HandCoins/><div><h2 className="text-2xl font-semibold">Negotiated services</h2><p className="text-sm text-zinc-500">Creator responses and agreed prices</p></div></div><div className="space-y-3">{offers.map((offer) => {
        const service = Array.isArray(offer.marketplace_services) ? offer.marketplace_services[0] : offer.marketplace_services;
        return <article key={offer.id} className={`rounded-2xl border p-5 ${offer.status === "accepted" ? "border-emerald-200 bg-emerald-50/60" : "border-zinc-100 bg-zinc-50"}`}><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold">{service?.title ?? "Creator service"}</h3><p className="mt-2 text-sm text-zinc-500">Your negotiated amount: INR {Number(offer.customer_offer).toLocaleString("en-IN")}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${offer.status === "accepted" ? "bg-emerald-600 text-white" : "bg-white text-zinc-600"}`}>{offer.status}</span></div>{offer.status === "accepted" && <><div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-700"><BadgeCheck size={19}/>Accepted at INR {Number(offer.customer_offer).toLocaleString("en-IN")}</div><Link href={`/marketplace/checkout?offer=${offer.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Avail Service <ArrowRight size={16}/></Link></>}{offer.status === "countered" && offer.counter_customer_amount && <CounterOfferActions offerId={offer.id} amount={Number(offer.counter_customer_amount)}/>} {offer.message && <p className="mt-4 text-sm text-zinc-600">{offer.message}</p>}</article>;
      })}</div></section> : null}
      {orders?.length ? <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="mb-5 text-2xl font-semibold">Active orders</h2><div className="space-y-3">{orders.map((order) => { const service = Array.isArray(order.marketplace_services) ? order.marketplace_services[0] : order.marketplace_services; return <article key={order.id} className={`rounded-2xl border p-5 transition ${updatedOrderIds.has(order.id)?"border-violet-400 bg-violet-50 shadow-lg ring-2 ring-violet-200":order.status==="completed"?"border-emerald-200 bg-emerald-50/60":"border-zinc-100 bg-zinc-50"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div>{updatedOrderIds.has(order.id)&&<span className="mb-2 inline-flex rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">New update</span>}<h3 className="font-semibold">{service?.title ?? "Marketplace service"}</h3><p className="mt-2 text-sm text-zinc-500">Created {new Date(order.created_at).toLocaleDateString("en-IN")} | INR {Number(order.amount).toLocaleString("en-IN")}</p></div><OrderStatusBadge status={order.status}/></div><p className="mt-4 text-sm leading-6 text-zinc-600">{order.requirements}</p><Link href={`/marketplace/orders/${order.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Open order workspace <ArrowRight size={15}/></Link></article>; })}</div></section> : null}
    </>}
  </div></main>;
}






