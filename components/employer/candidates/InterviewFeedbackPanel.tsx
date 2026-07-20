"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";

import { updateInterviewOutcome } from "@/actions/interview-outcomes";
import { interviewFeedbackTemplates } from "@/lib/hiring/interview-feedback-templates";

export function InterviewFeedbackPanel({
  interviewId,
  candidateId,
  currentFeedback,
  currentRating,
}: {
  interviewId: string;
  candidateId: string;
  currentFeedback?: string | null;
  currentRating?: number | null;
}) {
  const [feedback, setFeedback] = useState(currentFeedback ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage(null);
    try {
      await updateInterviewOutcome({
        interviewId,
        candidateId,
        status: formData.get("status"),
        feedback,
        rating: formData.get("rating") || undefined,
        candidateStatus: formData.get("candidateStatus"),
        rescheduledDate: formData.get("rescheduledDate") || undefined,
      });
      setMessage("Interview feedback saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save interview feedback.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="mt-5 rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white">
          <MessageSquareText size={17} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">JobiVerse feedback templates</p>
          <h3 className="mt-1 font-semibold">Write structured interview feedback</h3>
        </div>
      </div>
      <select
        className="mt-4 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none"
        defaultValue=""
        onChange={(event) => {
          const template = interviewFeedbackTemplates.find((item) => item.key === event.target.value);
          if (template) setFeedback(template.body);
        }}
      >
        <option value="">Choose a feedback template</option>
        {interviewFeedbackTemplates.map((template) => (
          <option key={template.key} value={template.key}>
            {template.title} — {template.summary}
          </option>
        ))}
      </select>
      <textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        rows={7}
        placeholder="Add interview feedback, strengths, risks and recommendation..."
        className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 outline-none focus:border-zinc-500"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <select name="status" defaultValue="completed" className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm">
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="no_show">No show</option>
        </select>
        <select name="candidateStatus" defaultValue="Interview" className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm">
          <option value="Interview">Keep in interview</option>
          <option value="Selected">Select candidate</option>
          <option value="Rejected">Reject candidate</option>
        </select>
        <select name="rating" defaultValue={currentRating ?? ""} className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm">
          <option value="">Rating</option>
          {[1, 2, 3, 4, 5].map((rating) => (
            <option key={rating} value={rating}>
              {rating}/5
            </option>
          ))}
        </select>
      </div>
      <input name="rescheduledDate" type="datetime-local" className="mt-3 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" />
      {message && <p className={`mt-3 text-sm font-semibold ${message.includes("successfully") ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}
      <button disabled={busy} className="mt-4 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Saving..." : "Save feedback"}
      </button>
    </form>
  );
}
