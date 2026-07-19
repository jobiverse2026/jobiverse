import { respondToCounterOffer } from "@/app/marketplace/orders/actions";

export function CounterOfferActions({ offerId, amount }: { offerId: string; amount: number }) {
  return <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-800">Creator counter price: ₹{amount.toLocaleString("en-IN")}</p><div className="mt-4 flex flex-wrap gap-2"><form action={respondToCounterOffer}><input type="hidden" name="offerId" value={offerId}/><button name="decision" value="accept" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Accept & Continue to Payment</button></form><form action={respondToCounterOffer}><input type="hidden" name="offerId" value={offerId}/><button name="decision" value="reject" className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Reject</button></form></div></div>;
}
