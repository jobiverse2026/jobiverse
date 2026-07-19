"use client";

import { useState } from "react";

import { updateInterviewOutcome } from "@/actions/interview-outcomes";

export default function InterviewOutcomeForm({ interviewId, candidateId }: { interviewId: string; candidateId: string }) {
  const [status, setStatus] = useState("completed");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    let rescheduledDate = "";

    if (status === "rescheduled") {
      const hour12 = Number(form.get("hour"));
      const minute = String(form.get("minute"));
      const meridiem = String(form.get("meridiem"));
      const hour24 = meridiem === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
      rescheduledDate = `${form.get("day")}T${String(hour24).padStart(2, "0")}:${minute}`;
    }

    setLoading(true);
    setMessage(null);
    try {
      await updateInterviewOutcome({ interviewId, candidateId, status, feedback: form.get("feedback"), rating: form.get("rating") || undefined, candidateStatus: form.get("candidate_status"), rescheduledDate });
      setMessage("Interview outcome updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update interview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-zinc-200 pt-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Update outcome</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select name="outcome_status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="completed">Completed</option><option value="rescheduled">Rescheduled</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select>
        <select name="candidate_status" className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="Interview">Keep in Interview</option><option value="Selected">Selected</option><option value="Rejected">Rejected</option></select>
        <select name="rating" defaultValue="" className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="">No rating</option>{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}</select>
      </div>
      {status === "rescheduled" && <div className="mt-3 grid grid-cols-4 gap-2"><input name="day" type="date" required className="col-span-4 h-11 rounded-xl border border-zinc-200 bg-white px-3 sm:col-span-1" /><select name="hour" defaultValue="10" className="h-11 rounded-xl border border-zinc-200 bg-white px-2">{Array.from({length:12},(_,i)=>i+1).map(hour=><option key={hour}>{hour}</option>)}</select><select name="minute" defaultValue="00" className="h-11 rounded-xl border border-zinc-200 bg-white px-2">{["00","15","30","45"].map(minute=><option key={minute}>{minute}</option>)}</select><select name="meridiem" className="h-11 rounded-xl border border-zinc-200 bg-white px-2"><option>AM</option><option>PM</option></select></div>}
      <textarea name="feedback" rows={3} placeholder="Interview feedback (internal and employer-visible)..." className="mt-3 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-500" />
      {message && <p className={`mt-3 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
      <button disabled={loading} className="mt-4 rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Updating..." : "Save Outcome"}</button>
    </form>
  );
}
