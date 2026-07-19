import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CreditCard,
  FileText,
  ReceiptText,
  RotateCcw,
  WalletCards,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getResumeTemplate } from "@/lib/resume-templates";
import { BillingProfileCard } from "@/components/payments/billing-profile-card";

type Filter = "all" | "paid" | "pending" | "refunded" | "failed";

export default async function BillingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/account/billing");

  const requested = (await searchParams).status;
  const active: Filter = ["paid", "pending", "refunded", "failed"].includes(
    requested ?? "",
  )
    ? (requested as Filter)
    : "all";
  const { data: billingProfile } = await supabase.from("buyer_billing_profiles").select("billing_name,address_line,city,state,pincode,gstin").eq("user_id",user.id).maybeSingle();
  const { data: attempts } = await supabase
    .from("payment_attempts")
    .select(
      "id,target_type,target_id,local_order_id,amount,currency,status,gateway_payment_id,created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const orderIds = [
    ...new Set(
      (attempts ?? [])
        .map((attempt) => attempt.local_order_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const [{ data: orders }, { data: refunds }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("marketplace_orders")
          .select("id,status,service_title,marketplace_services(title)")
          .in("id", orderIds)
      : Promise.resolve({ data: [] }),
    orderIds.length
      ? supabase
          .from("marketplace_refund_requests")
          .select("order_id,status,amount,requested_at")
          .eq("customer_id", user.id)
          .in("order_id", orderIds)
          .order("requested_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));
  const refundMap = new Map<string, { order_id: string; status: string; amount: number | null; requested_at: string }>();
  for (const refund of refunds ?? []) {
    if (!refundMap.has(refund.order_id)) refundMap.set(refund.order_id, refund);
  }
  const matches = (status: string) => {
    if (active === "all") return true;
    if (active === "paid") return status === "captured";
    if (active === "pending") return ["created", "authorized"].includes(status);
    return status === active;
  };
  const visible = (attempts ?? []).filter((attempt) => matches(attempt.status));
  const paidTotal = (attempts ?? [])
    .filter((attempt) => ["captured", "refunded"].includes(attempt.status))
    .reduce((sum, attempt) => sum + Number(attempt.amount), 0);
  const receiptCount = (attempts ?? []).filter((attempt) =>
    ["captured", "refunded"].includes(attempt.status),
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f4f1] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative">
            <WalletCards size={28} />
            <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">
              Account finance
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              Billing & purchases.
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-400">
              Track service payments, premium CV purchases, receipts and refunds from one secure place.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Recorded payments" value={String(attempts?.length ?? 0)} icon={<CreditCard size={18} />} />
          <Metric label="Payment value" value={money(paidTotal)} icon={<WalletCards size={18} />} />
          <Metric label="Available receipts" value={String(receiptCount)} icon={<ReceiptText size={18} />} />
        </section>

        <div className="mt-7"><BillingProfileCard profile={billingProfile}/></div>

        <nav className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
          {(["all", "paid", "pending", "refunded", "failed"] as Filter[]).map(
            (filter) => (
              <Link
                key={filter}
                href={filter === "all" ? "/account/billing" : `/account/billing?status=${filter}`}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold capitalize transition ${
                  active === filter ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {filter}
              </Link>
            ),
          )}
        </nav>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-6 sm:p-7">
            <h2 className="text-2xl font-semibold">Transaction history</h2>
            <p className="mt-1 text-sm text-zinc-500">Newest transactions appear first.</p>
          </div>
          {visible.length ? (
            <div className="divide-y divide-zinc-100">
              {visible.map((attempt) => {
                const order = attempt.local_order_id
                  ? orderMap.get(attempt.local_order_id)
                  : null;
                const relation = order
                  ? Array.isArray(order.marketplace_services)
                    ? order.marketplace_services[0]
                    : order.marketplace_services
                  : null;
                const title =
                  attempt.target_type === "resume_download"
                    ? `${getResumeTemplate(attempt.target_id).name} CV Template`
                    : relation?.title || order?.service_title || "JobiVerse service";
                const refund = attempt.local_order_id
                  ? refundMap.get(attempt.local_order_id)
                  : null;
                return (
                  <article key={attempt.id} className="p-6 transition hover:bg-zinc-50 sm:p-7">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-100">
                          {attempt.target_type === "resume_download" ? (
                            <FileText size={20} />
                          ) : (
                            <CreditCard size={20} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{title}</h3>
                          <p className="mt-1 text-xs text-zinc-500">
                            {new Date(attempt.created_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          {refund && (
                            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                              <RotateCcw size={12} /> Refund {refund.status.replaceAll("_", " ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                        <div className="text-right">
                          <p className="font-bold">{money(attempt.amount)}</p>
                          <Status status={attempt.status} />
                        </div>
                        {["captured", "refunded"].includes(attempt.status) ? (
                          <Link
                            href={`/payments/receipts/${attempt.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-xs font-semibold text-white"
                          >
                            Receipt <ArrowRight size={13} />
                          </Link>
                        ) : attempt.local_order_id ? (
                          <Link
                            href={`/marketplace/orders/${attempt.local_order_id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-xs font-semibold"
                          >
                            View <ArrowRight size={13} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center">
              <ReceiptText className="mx-auto text-zinc-300" size={42} />
              <h3 className="mt-5 text-xl font-semibold">No matching transactions</h3>
              <p className="mt-2 text-sm text-zinc-500">Payments will appear here automatically.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2 text-zinc-400">{icon}<p className="text-xs font-bold uppercase tracking-wider">{label}</p></div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const style = status === "captured"
    ? "text-emerald-700"
    : status === "refunded"
      ? "text-blue-700"
      : status === "failed"
        ? "text-red-700"
        : "text-amber-700";
  return <p className={`mt-1 text-[10px] font-bold uppercase ${style}`}>{status === "captured" ? "Paid" : status.replaceAll("_", " ")}</p>;
}

function money(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
