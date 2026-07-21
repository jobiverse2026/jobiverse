import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Sparkles, Trophy } from "lucide-react";

import { BillingProfileCard } from "@/components/payments/billing-profile-card";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { requireRole } from "@/lib/auth/authorization";
import { customerPrice, featuredListingPrice } from "@/lib/marketplace/pricing";
import {
  amountWithPaymentProcessing,
  paymentProcessingFeeFor,
} from "@/lib/payments/processing-fee";

export default async function FeatureServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireRole(["candidate", "creator"]);
  const [{ data: service }, { data: billingProfile }] = await Promise.all([
    supabase
      .from("marketplace_services")
      .select(
        "id,title,short_description,price,status,is_featured,featured_until",
      )
      .eq("id", id)
      .eq("provider_id", user.id)
      .maybeSingle(),
    supabase
      .from("buyer_billing_profiles")
      .select("billing_name,address_line,city,state,pincode,gstin")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!service) notFound();

  const amount = featuredListingPrice(Number(service.price));
  const processingFee = paymentProcessingFeeFor(amount);
  const payableAmount = amountWithPaymentProcessing(amount);
  const activeFeatured =
    service.is_featured &&
    (!service.featured_until || new Date(service.featured_until) > new Date());

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/earn-with-jobiverse/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"
        >
          <ArrowLeft size={16} />
          Creator dashboard
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="relative overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
            <Sparkles className="relative z-10 text-violet-300" />
            <p className="relative z-10 mt-5 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
              Paid featured placement
            </p>
            <h1 className="relative z-10 mt-3 text-4xl font-semibold tracking-[-.04em]">
              Put this service in the featured section.
            </h1>
            <p className="relative z-10 mt-4 max-w-2xl text-zinc-400">
              Featured listings get premium placement in marketplace discovery
              for 30 days. Publishing remains free; featured placement is
              optional and paid.
            </p>
            <div className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-zinc-400">Selected service</p>
              <h2 className="mt-2 text-2xl font-semibold">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {service.short_description}
              </p>
            </div>
          </section>
          <aside className="h-fit rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-xl">
            <Trophy className="text-violet-600" />
            <h2 className="mt-5 text-2xl font-semibold">Feature for 30 days</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Your customer-facing service price stays separate. This fee only
              promotes your listing.
            </p>
            <div className="my-6 h-px bg-zinc-200" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Total payable</p>
                <p className="mt-1 text-4xl font-semibold">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                30 days
              </p>
            </div>
            <div className="mt-5 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
              <div className="flex justify-between gap-4">
                <span>Featured fee</span>
                <span className="font-semibold">
                  ₹{amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Payment processing recovery</span>
                <span className="font-semibold">
                  ₹{processingFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2">
                <span className="font-semibold">Payable now</span>
                <span className="font-bold">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
              Current customer price: ₹
              {customerPrice(Number(service.price)).toLocaleString("en-IN")}
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Rule: services below ₹1,000 pay 50% of creator price.
              Higher-value services use JobiVerse featured tiers.
            </p>
            {activeFeatured ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                <BadgeCheck className="mr-2 inline" size={17} />
                Already featured until{" "}
                {service.featured_until
                  ? new Date(service.featured_until).toLocaleDateString("en-IN")
                  : "active period"}
                .
              </div>
            ) : billingProfile ? (
              <div className="mt-6">
                <RazorpayPaymentButton
                  targetType="featured_listing"
                  targetId={service.id}
                  label={`Pay ₹${payableAmount.toLocaleString(
                    "en-IN",
                  )} & Feature`}
                />
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Save your billing profile below to enable payment.
              </p>
            )}
          </aside>
        </div>
        <div className="mt-6">
          <BillingProfileCard profile={billingProfile} />
        </div>
      </div>
    </main>
  );
}

