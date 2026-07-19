"use client";

import { useState } from "react";
import { updatePlacementBilling } from "@/actions/admin-billing";

export default function BillingEditor({ placement }: { placement: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setLoading(true); setMessage(null);
    try { await updatePlacementBilling({ placementId: placement.id, invoiceNumber: form.get("invoice_number"), invoiceDate: form.get("invoice_date"), paymentDueDate: form.get("due_date"), paymentStatus: form.get("payment_status") }); setMessage("Billing updated."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Update failed."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-2"><input name="invoice_number" defaultValue={placement.invoice_number ?? ""} placeholder="Invoice number" className="h-11 rounded-xl border px-3 text-sm" /><select name="payment_status" defaultValue={placement.payment_status} className="h-11 rounded-xl border px-3 text-sm"><option value="not_invoiced">Not invoiced</option><option value="invoiced">Invoiced</option><option value="partially_paid">Partially paid</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option></select><label className="text-xs text-zinc-500">Invoice date<input name="invoice_date" type="date" defaultValue={placement.invoice_date ?? ""} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" /></label><label className="text-xs text-zinc-500">Payment due<input name="due_date" type="date" defaultValue={placement.payment_due_date ?? ""} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" /></label>{message && <p className="text-sm text-emerald-600 sm:col-span-2">{message}</p>}<button disabled={loading} className="rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-5 py-3 text-sm font-semibold text-white sm:col-span-2 disabled:opacity-50">{loading ? "Saving..." : "Save Billing"}</button></form>;
}
