import { redirect } from "next/navigation";
import { Clock3, HandCoins, MessageSquareText, Send } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { respondToOffer } from "./actions";

export default async function CreatorOffersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/creator?next=/earn-with-jobiverse/dashboard/offers");
  const { data: offers } = await supabase
    .from("marketplace_offers")
    .select("id,creator_earning,counter_creator_earning,status,message,expires_at,created_at,marketplace_services(title,price)")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl">
    <section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><HandCoins/><h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Negotiations.</h1><p className="mt-4 max-w-2xl text-zinc-400">Review customer requests and respond based on the exact net earning you would receive.</p></section>
    <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7">{offers?.length ? <div className="space-y-4">{offers.map((offer) => {
      const service = Array.isArray(offer.marketplace_services) ? offer.marketplace_services[0] : offer.marketplace_services;
      const active = offer.status === "pending" && new Date(offer.expires_at) > new Date();
      return <article key={offer.id} className="rounded-[1.75rem] border border-zinc-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-zinc-400">{service?.title ?? "Creator service"}</p><h2 className="mt-2 text-xl font-semibold">You set this service at ₹{Number(service?.price ?? 0).toLocaleString("en-IN")}</h2><p className="mt-2 text-sm text-zinc-500">However, the customer wants the service at a net earning of ₹{Number(offer.creator_earning).toLocaleString("en-IN")} for you.</p></div><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold uppercase text-zinc-600">{active ? "Action required" : offer.status}</span></div>
        {offer.message && <div className="mt-5 flex max-w-2xl gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600"><MessageSquareText className="shrink-0" size={17}/>{offer.message}</div>}
        <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400"><Clock3 size={14}/>Expires {new Date(offer.expires_at).toLocaleString("en-IN")}</p>
        {active && <div className="mt-6 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-[auto_auto_minmax(260px,1fr)]"><form action={respondToOffer}><input type="hidden" name="offerId" value={offer.id}/><button name="decision" value="accepted" className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Accept</button></form><form action={respondToOffer}><input type="hidden" name="offerId" value={offer.id}/><button name="decision" value="rejected" className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100">Reject</button></form><form action={respondToOffer} className="flex gap-2"><input type="hidden" name="offerId" value={offer.id}/><input name="creatorNet" type="number" min="75" required className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 text-sm" placeholder="Your counter earning (₹)"/><button name="decision" value="countered" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Send size={15}/>Counter</button></form></div>}
        {offer.status === "countered" && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Counter sent | You earn ₹{Number(offer.counter_creator_earning).toLocaleString("en-IN")} if accepted.</p>}
      </article>;
    })}</div> : <div className="py-16 text-center"><HandCoins className="mx-auto text-zinc-300" size={42}/><h2 className="mt-5 text-xl font-semibold">No negotiations yet</h2><p className="mt-2 text-sm text-zinc-500">Customer negotiations will appear here.</p></div>}</section>
  </div></main>;
}


