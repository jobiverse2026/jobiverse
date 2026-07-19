"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { createServiceOffer, type OfferState } from "./actions";

export function OfferForm({
  listingId,
  listedPrice,
  serviceHref,
}: {
  listingId: string;
  listedPrice: number;
  serviceHref: string;
}) {
  const [amount, setAmount] = useState("");
  const [state, action, pending] = useActionState(createServiceOffer, {} as OfferState);
  const discount = useMemo(
    () => amount ? Math.max(0, Math.round((1 - Number(amount) / listedPrice) * 100)) : 0,
    [amount, listedPrice],
  );

  if (state.success) {
    return (
      <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-bold text-emerald-800">{state.success}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href={serviceHref} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900">
            <ArrowLeft size={16} />
            Back to service
          </Link>
          <Link href="/marketplace/orders" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">
            Open My Orders
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="listingId" value={listingId} />
      <label className="block text-sm font-semibold">
        Your negotiated amount (INR)
        <input
          name="amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min="100"
          max={listedPrice}
          required
          className="mt-2 h-14 w-full rounded-2xl border border-zinc-200 px-4 text-lg font-semibold outline-none focus:border-zinc-950"
          placeholder="Enter your amount"
        />
      </label>
      {amount && (
        <p className="rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600">
          Your amount is {discount}% below the listed customer price.
        </p>
      )}
      <label className="block text-sm font-semibold">
        Message to creator <span className="font-normal text-zinc-400">(optional)</span>
        <textarea name="message" maxLength={1000} className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-200 p-4 outline-none focus:border-zinc-950" placeholder="Explain your scope, budget or timeline." />
      </label>
      {state.error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{state.error}</p>}
      <button disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white disabled:opacity-60">
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" size={18} />
            Sending...
          </>
        ) : (
          <>
            Send negotiation
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
