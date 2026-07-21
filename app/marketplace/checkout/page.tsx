import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

import { BillingProfileCard } from "@/components/payments/billing-profile-card";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import {
  amountWithPaymentProcessing,
  paymentProcessingFeeFor,
} from "@/lib/payments/processing-fee";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutSearchParams = {
  offer?: string;
  order?: string;
  returnTo?: string;
};

export default async function MarketplaceCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const { offer: offerId, order: orderId, returnTo } = await searchParams;
  if (!offerId && !orderId) redirect("/marketplace/orders");

  const safeReturnTo =
    returnTo?.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/marketplace/orders";
  const isConsultationReturn = safeReturnTo.startsWith("/consultations/");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const checkoutQuery = offerId ? `offer=${offerId}` : `order=${orderId}`;
  const next = `/marketplace/checkout?${checkoutQuery}${
    isConsultationReturn
      ? `&returnTo=${encodeURIComponent(safeReturnTo)}`
      : ""
  }`;
  if (!user) redirect(`/login/candidate?next=${encodeURIComponent(next)}`);

  const { data: billingProfile } = await supabase
    .from("buyer_billing_profiles")
    .select("billing_name,address_line,city,state,pincode,gstin")
    .eq("user_id", user.id)
    .maybeSingle();

  let title = "JobiVerse service";
  let description = "Complete payment to activate this service.";
  let amount = 0;
  let targetType: "marketplace_offer" | "marketplace_order" =
    "marketplace_order";
  let targetId = "";
  let eyebrow = "Complete your booking";

  if (orderId) {
    const { data: order } = await supabase
      .from("marketplace_orders")
      .select(
        "id,amount,status,service_title,marketplace_services(title,description)",
      )
      .eq("id", orderId)
      .eq("customer_id", user.id)
      .maybeSingle();
    if (!order || order.status !== "pending_payment") {
      redirect(order ? `/marketplace/orders/${order.id}` : "/marketplace/orders");
    }
    const service = Array.isArray(order.marketplace_services)
      ? order.marketplace_services[0]
      : order.marketplace_services;
    title = service?.title ?? order.service_title ?? title;
    description = service?.description ?? description;
    amount = Number(order.amount);
    targetId = order.id;
  } else if (offerId) {
    const { data: offer } = await supabase
      .from("marketplace_offers")
      .select("id,customer_offer,status,marketplace_services(title,description)")
      .eq("id", offerId)
      .eq("customer_id", user.id)
      .maybeSingle();
    if (!offer || offer.status !== "accepted") redirect("/marketplace/orders");
    const service = Array.isArray(offer.marketplace_services)
      ? offer.marketplace_services[0]
      : offer.marketplace_services;
    title = service?.title ?? "Creator service";
    description = service?.description ?? description;
    amount = Number(offer.customer_offer);
    targetType = "marketplace_offer";
    targetId = offer.id;
    eyebrow = "Accepted negotiation";
  }

  const processingFee = paymentProcessingFeeFor(amount);
  const payableAmount = amountWithPaymentProcessing(amount);

  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={safeReturnTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"
        >
          <ArrowLeft size={16} />
          {isConsultationReturn ? "Back to consultation" : "Back to My Orders"}
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
            <p className="mt-4 leading-7 text-zinc-400">{description}</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-zinc-400">Final payable amount</p>
              <p className="mt-2 text-4xl font-semibold">
                INR {payableAmount.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Includes service amount and payment processing recovery.
              </p>
            </div>
          </section>
          <aside className="h-fit rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <LockKeyhole />
              <div>
                <p className="font-semibold">Secure payment</p>
                <p className="text-xs text-zinc-500">
                  Amount payable INR {payableAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="my-6 h-px bg-zinc-200" />
            <div className="space-y-3 rounded-2xl bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Service amount</span>
                <span className="font-semibold">INR {amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Payment processing recovery</span>
                <span className="font-semibold">INR {processingFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-zinc-200 pt-3">
                <span className="font-semibold">Total payable</span>
                <span className="font-bold">INR {payableAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="my-6 h-px bg-zinc-200" />
            <p className="text-sm leading-6 text-zinc-500">
              Your order activates only after Razorpay signature verification.
            </p>
            {billingProfile ? (
              <div className="mt-6">
                <RazorpayPaymentButton
                  targetType={targetType}
                  targetId={targetId}
                  label={`Pay INR ${payableAmount.toLocaleString("en-IN")}`}
                />
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Save your billing profile below to enable payment.
              </p>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <ShieldCheck size={15} /> Protected server-side verification
            </p>
          </aside>
        </div>
        <div className="mt-6">
          <BillingProfileCard profile={billingProfile} />
        </div>
      </div>
    </main>
  );
}
