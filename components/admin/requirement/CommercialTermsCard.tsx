"use client";

import { useState } from "react";
import { updateCommercialTerms } from "@/actions/admin-billing";

export default function CommercialTermsCard({ requirement }: { requirement: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setLoading(true); setMessage(null);
    try { await updateCommercialTerms({ requirementId: requirement.id, feePercentage: form.get("fee"), minimumFee: form.get("minimum"), replacementDays: form.get("replacement") }); setMessage("Commercial terms saved successfully."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save terms."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="rounded-3xl border border-zinc-200 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Commercial agreement</p><h2 className="mt-2 text-2xl font-bold">Recruitment terms</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><label className="text-sm font-medium">Fee percentage<input name="fee" type="number" min="0.01" max="100" step="0.01" required defaultValue={requirement.fee_percentage ?? ""} className="mt-2 h-12 w-full rounded-xl border px-4" /></label><label className="text-sm font-medium">Minimum fee (₹)<input name="minimum" type="number" min="0" step="0.01" required defaultValue={requirement.minimum_fee ?? 0} className="mt-2 h-12 w-full rounded-xl border px-4" /></label><label className="text-sm font-medium">Replacement days<input name="replacement" type="number" min="0" max="365" required defaultValue={requirement.replacement_days ?? 60} className="mt-2 h-12 w-full rounded-xl border px-4" /></label></div><p className="mt-4 text-sm text-zinc-500">GST is fixed at the statutory 18% and calculated automatically.</p>{message && <p className={`mt-3 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}<button disabled={loading} className="mt-5 rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Save Commercial Terms"}</button></form>;
}
