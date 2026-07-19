"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createMarketplaceOrder, type BookingState } from "./actions";

export function BookingForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(createMarketplaceOrder, {} as BookingState);
  return <form action={action}><input type="hidden" name="listingId" value={listingId}/><label className="mt-8 block text-sm font-semibold">Requirements<textarea name="requirements" required minLength={20} maxLength={3000} className="mt-2 min-h-44 w-full resize-y rounded-2xl border border-zinc-200 p-4 outline-none focus:border-zinc-950" placeholder="Share your goals, current situation, preferred timeline and any specific expectations."/></label>{state.error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{state.error}</p>}<button disabled={pending} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white disabled:opacity-60">{pending ? <><LoaderCircle className="animate-spin" size={18}/>Creating order...</> : <>Continue booking <ArrowRight size={18}/></>}</button></form>;
}
