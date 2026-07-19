"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createJobiVerseNegotiation, createJobiVerseOrder, type JobiVerseBookingState } from "./actions";

export function JobiVerseOrderForm({ category }: { category: string }) {
  const [state, action, pending] = useActionState(createJobiVerseOrder, {} as JobiVerseBookingState);
  return (
    <form action={action} className="mt-7">
      <input type="hidden" name="category" value={category} />
      <textarea name="requirements" required minLength={20} maxLength={3000} className="min-h-36 w-full rounded-2xl border border-zinc-200 p-4 outline-none focus:border-zinc-950" placeholder="Share your requirements, scope and preferred timeline." />
      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="mt-4 w-full rounded-2xl bg-zinc-950 px-5 py-4 font-semibold text-white">
        {pending ? "Creating order..." : "Continue to payment"}
      </button>
    </form>
  );
}

export function JobiVerseNegotiationForm({ category, serviceHref }: { category: string; serviceHref: string }) {
  const [state, action, pending] = useActionState(createJobiVerseNegotiation, {} as JobiVerseBookingState);

  if (state.success) {
    return (
      <div className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-800">{state.success}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href={serviceHref} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900">
            <ArrowLeft size={16} />
            Back to service
          </Link>
          <Link href="/marketplace/orders" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">
            My Orders
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-7 space-y-4">
      <input type="hidden" name="category" value={category} />
      <input name="amount" type="number" min="100" required className="h-14 w-full rounded-2xl border border-zinc-200 px-4" placeholder="Your negotiated amount (INR)" />
      <textarea name="requirements" maxLength={1000} className="min-h-28 w-full rounded-2xl border border-zinc-200 p-4" placeholder="Add scope or commercial details (optional)." />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-2xl border border-zinc-950 px-5 py-4 font-semibold">
        {pending ? "Sending..." : "Send negotiation"}
      </button>
    </form>
  );
}
