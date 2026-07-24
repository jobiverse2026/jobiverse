"use client";

import { useState } from "react";
import { BadgeIndianRupee, CalendarPlus } from "lucide-react";
import {
  markExternalApplicantHired,
  scheduleExternalApplicantInterview,
  updateExternalApplicationStatus,
} from "@/app/employers/external-applicants/actions";

export function ExternalApplicantWorkflow({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(status: string) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await updateExternalApplicationStatus(applicationId, status);
      setMessage(result.success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update status.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmHire(formData: FormData) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await markExternalApplicantHired({ applicationId, annualCtc: formData.get("annualCtc"), joiningDate: formData.get("joiningDate") });
      setMessage(result.success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to confirm this successful hire.");
    } finally {
      setBusy(false);
    }
  }

  async function schedule(formData: FormData) {
    setBusy(true);
    setMessage(null);
    const hour = Number(formData.get("hour"));
    const meridiem = String(formData.get("meridiem"));
    const hour24 = meridiem === "PM" ? (hour % 12) + 12 : hour % 12;
    try {
      const result = await scheduleExternalApplicantInterview({ applicationId, round: formData.get("round"), date: `${formData.get("day")}T${String(hour24).padStart(2, "0")}:${formData.get("minute")}`, mode: formData.get("mode"), meetingLink: formData.get("meetingLink"), interviewer: formData.get("interviewer") });
      setMessage(result.success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to schedule interview.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-5">
    <section className="rounded-[2rem] border bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current status</p>
      <h2 className="mt-2 text-2xl font-semibold">{currentStatus}</h2>
      <div className="mt-5 grid grid-cols-2 gap-2">{["Under Review", "Shortlisted", "Offered", "Rejected"].map((status) => <button type="button" disabled={busy || status === currentStatus} onClick={() => void change(status)} key={status} className="cursor-pointer rounded-xl border px-3 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40">{status}</button>)}</div>
    </section>

    {currentStatus !== "Hired" && <form action={confirmHire} className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
      <div className="flex items-center gap-3 text-emerald-950"><BadgeIndianRupee /><h2 className="text-xl font-semibold">Confirm successful direct hire</h2></div>
      <p className="mt-2 text-sm leading-6 text-emerald-800">Enter the final annual CTC and joining date. The agreed one-time JobiVerse success fee is 3% and becomes due only after this successful joining.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input name="annualCtc" type="number" min="1" step="1" required placeholder="Final annual CTC (INR)" className="h-12 rounded-xl border border-emerald-200 bg-white px-4" />
        <input name="joiningDate" type="date" required className="h-12 rounded-xl border border-emerald-200 bg-white px-4" />
      </div>
      <button disabled={busy} className="mt-4 w-full cursor-pointer rounded-xl bg-emerald-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Confirm Hire & Calculate 3% Fee"}</button>
    </form>}

    <form action={schedule} className="rounded-[2rem] border bg-white p-6">
      <div className="flex items-center gap-3"><CalendarPlus /><h2 className="text-xl font-semibold">Schedule interview</h2></div>
      <input name="round" required minLength={2} placeholder="Technical Round 1" className="mt-5 h-12 w-full rounded-xl border px-4" />
      <input name="day" type="date" required className="mt-3 h-12 w-full rounded-xl border px-4" />
      <div className="mt-3 grid grid-cols-3 gap-2"><select name="hour" defaultValue="10" className="h-12 rounded-xl border px-3">{Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour}>{hour}</option>)}</select><select name="minute" defaultValue="00" className="h-12 rounded-xl border px-3">{["00", "15", "30", "45"].map((minute) => <option key={minute}>{minute}</option>)}</select><select name="meridiem" defaultValue="AM" className="h-12 rounded-xl border px-3"><option>AM</option><option>PM</option></select></div>
      <select name="mode" className="mt-3 h-12 w-full rounded-xl border px-4"><option>Video</option><option>In Person</option><option>Phone</option></select>
      <input name="interviewer" placeholder="Interviewer or panel" className="mt-3 h-12 w-full rounded-xl border px-4" />
      <input name="meetingLink" placeholder="Meeting link (optional)" className="mt-3 h-12 w-full rounded-xl border px-4" />
      <button disabled={busy} className="mt-4 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Schedule interview"}</button>
    </form>
    {message && <p className={`rounded-xl p-4 text-sm font-semibold ${/success|moved|confirmed/i.test(message) ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
  </div>;
}
