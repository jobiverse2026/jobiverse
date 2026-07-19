"use client";

import { useState } from "react";
import { BadgeIndianRupee } from "lucide-react";

import { managePlacement } from "@/actions/placements";

type Placement = { status: string; offered_ctc: number | null; joining_date: string | null; replacement_end_date: string | null };

export default function PlacementManager({ candidateId, placement }: { candidateId: string; placement?: Placement | null }) {
  const [status, setStatus] = useState(placement?.status ?? "offered");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);
    try {
      await managePlacement({ candidateId, status, offeredCtc: form.get("offered_ctc") || undefined, joiningDate: form.get("joining_date") || undefined });
      setMessage("Offer and placement status updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update placement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><BadgeIndianRupee size={22} /></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">04 | Offer & placement</p><h2 className="mt-1 text-2xl font-bold">Manage placement</h2></div></div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-zinc-700">Placement status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4"><option value="offered">Offer Released</option><option value="accepted">Offer Accepted</option><option value="joined">Joined</option><option value="declined">Offer Declined</option><option value="no_show">No Show</option><option value="replacement">Replacement</option><option value="completed">Placement Completed</option></select></label>
        <label className="text-sm font-medium text-zinc-700">Annual offered CTC (INR )<input name="offered_ctc" type="number" min="1" step="0.01" defaultValue={placement?.offered_ctc ?? ""} placeholder="1200000" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4" /></label>
        <label className="text-sm font-medium text-zinc-700">Joining date<input name="joining_date" type="date" defaultValue={placement?.joining_date ?? ""} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4" /></label>
      </div>
      {placement && <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Replacement coverage until</p><p className="mt-2 font-semibold text-zinc-900">{placement.replacement_end_date ? new Date(placement.replacement_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Starts after joining is confirmed"}</p></div>}
      {message && <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
      <button disabled={loading} className="mt-6 rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-3.5 font-semibold text-white disabled:opacity-50">{loading ? "Updating..." : placement ? "Update Placement" : "Create Offer"}</button>
    </form>
  );
}




