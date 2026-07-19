"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

import { scheduleEmployerInterview } from "@/actions/interviews";

export default function InterviewScheduler({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setMessage(null);

    const form = new FormData(formElement);
    const hour12 = Number(form.get("interview_hour"));
    const minute = String(form.get("interview_minute"));
    const meridiem = String(form.get("interview_meridiem"));
    const hour24 = meridiem === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
    const interviewDate = `${form.get("interview_day")}T${String(hour24).padStart(2, "0")}:${minute}`;
    try {
      await scheduleEmployerInterview({
        candidateId,
        interviewRound: form.get("interview_round"),
        interviewDate,
        interviewMode: form.get("interview_mode"),
        meetingLink: form.get("meeting_link"),
        interviewerName: form.get("interviewer_name"),
      });
      formElement.reset();
      setMessage("Interview scheduled successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to schedule interview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_30px_80px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><CalendarPlus size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Next action</p><h2 className="text-xl font-semibold">Schedule interview</h2></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-zinc-700">Interview round<input name="interview_round" required placeholder="Technical Round 1" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500" /></label>
        <label className="text-sm font-medium text-zinc-700">Interview date<input name="interview_day" type="date" required className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500" /></label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-zinc-700">Interview time</legend><div className="mt-2 grid grid-cols-3 gap-3"><select name="interview_hour" aria-label="Hour" defaultValue="10" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none">{Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour} value={hour}>{hour.toString().padStart(2, "0")}</option>)}</select><select name="interview_minute" aria-label="Minute" defaultValue="00" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none">{["00", "15", "30", "45"].map((minute) => <option key={minute} value={minute}>{minute}</option>)}</select><select name="interview_meridiem" aria-label="AM or PM" defaultValue="AM" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none"><option value="AM">AM</option><option value="PM">PM</option></select></div></fieldset>
        <label className="text-sm font-medium text-zinc-700">Mode<select name="interview_mode" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none"><option>Video</option><option>In Person</option><option>Phone</option></select></label>
        <label className="text-sm font-medium text-zinc-700">Interviewer<input name="interviewer_name" placeholder="Name or panel" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none" /></label>
        <label className="text-sm font-medium text-zinc-700 sm:col-span-2">Meeting link<input name="meeting_link" type="text" inputMode="url" placeholder="meet.google.com/abc-defg-hij" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none" /></label>
      </div>
      {message && <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-4 font-semibold text-white shadow-lg disabled:opacity-50">{loading ? "Scheduling..." : "Schedule Interview"}</button>
    </form>
  );
}
