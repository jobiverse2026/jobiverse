import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FileDown,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { BillingProfileCard } from "@/components/payments/billing-profile-card";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { requireRole } from "@/lib/auth/authorization";
import {
  amountWithPaymentProcessing,
  paymentProcessingFeeFor,
} from "@/lib/payments/processing-fee";
import { getResumeTemplate } from "@/lib/resume-templates";

export default async function ResumeCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { supabase, user } = await requireRole(["candidate"]);
  const [{ data: billingProfile }, { template = "jv-1-1-1" }] =
    await Promise.all([
      supabase
        .from("buyer_billing_profiles")
        .select("billing_name,address_line,city,state,pincode,gstin")
        .eq("user_id", user.id)
        .maybeSingle(),
      searchParams,
    ]);
  const design = getResumeTemplate(template);
  const price = design.price;
  const processingFee = paymentProcessingFeeFor(price);
  const payableAmount = amountWithPaymentProcessing(price);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/candidates/resume-builder?template=${design.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to CV Builder
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-2xl sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">
              Premium CV Download
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Your CV is ready.
            </h1>
            <p className="mt-3 text-zinc-400">
              Complete secure payment to unlock the final high-quality PDF.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-zinc-400">Selected template</p>
              <p className="mt-1 text-xl font-semibold">{design.name}</p>
            </div>
            <div className="mt-8 space-y-4 text-sm">
              {[
                "High-quality PDF export",
                "Exact colours and layout retained",
                "All edited content included",
                "Download access after verified payment",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
                    <Check size={15} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-xl sm:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Amount payable</p>
                <p className="mt-1 text-4xl font-semibold">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100">
                <FileDown />
              </div>
            </div>
            <div className="mt-5 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">CV template</span>
                <span className="font-semibold">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Payment processing recovery
                </span>
                <span className="font-semibold">
                  ₹{processingFee.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="my-7 h-px bg-zinc-200" />
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              <LockKeyhole className="mt-0.5 shrink-0" size={18} />
              <p>PDF unlocks only after secure server-side payment verification.</p>
            </div>
            {billingProfile ? (
              <div className="mt-6">
                <RazorpayPaymentButton
                  targetType="resume_download"
                  targetId={design.id}
                  label={`Pay ₹${payableAmount.toLocaleString(
                    "en-IN",
                  )} & Unlock PDF`}
                />
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Save your billing profile below to enable payment.
              </p>
            )}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <ShieldCheck size={15} />
              Payment verification protected
            </div>
          </section>
        </div>
        <div className="mt-6">
          <BillingProfileCard profile={billingProfile} />
        </div>
      </div>
    </main>
  );
}

