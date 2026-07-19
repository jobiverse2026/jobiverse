"use client";

import { useState, useTransition } from "react";
import { Globe2, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { setRequirementPublished } from "@/actions/job-publishing";
import { updateRequirementStatus } from "@/actions/requirements";

const statuses = ["Open", "Sourcing", "Interview", "Offer", "Joined", "Closed", "On Hold", "Cancelled"];

type Props = {
  requirement: {
    id: string;
    status: string | null;
    is_public?: boolean | null;
    hiring_team_requested?: boolean | null;
  };
};

export default function RequirementControls({ requirement }: Props) {
  const [published, setPublished] = useState(Boolean(requirement.is_public));
  const [status, setStatus] = useState(requirement.status || "Open");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showSuccess(text: string) {
    setError(null);
    setMessage(text);
  }

  function showError(err: unknown) {
    setMessage(null);
    setError(err instanceof Error ? err.message : "Unable to update requirement.");
  }

  function togglePublishing() {
    const next = !published;
    startTransition(async () => {
      try {
        await setRequirementPublished(requirement.id, next);
        setPublished(next);
        showSuccess(next ? "Job published to JobiVerse Jobs Portal." : "Job removed from candidate marketplace.");
      } catch (err) {
        showError(err);
      }
    });
  }

  function changeStatus(nextStatus: string) {
    startTransition(async () => {
      try {
        const result = await updateRequirementStatus(requirement.id, nextStatus);
        if (!result.success) {
          setStatus(status);
          setMessage(null);
          setError(result.error || "Unable to update status.");
          return;
        }
        setStatus(nextStatus);
        showSuccess(`Requirement status updated to ${nextStatus}.`);
      } catch (err) {
        setStatus(status);
        showError(err);
      }
    });
  }

  return (
    <section className="rounded-[2.25rem] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,.45)]">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Employer controls</p>
          <h2 className="mt-1 text-xl font-semibold">Manage this requirement</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Control candidate marketplace visibility and your requirement workflow status.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className={`rounded-2xl border p-5 ${published ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-zinc-50"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Globe2 size={19} className={published ? "text-emerald-700" : "text-zinc-500"} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Candidate marketplace</p>
                <h3 className="mt-1 font-semibold">{published ? "Published for candidates" : "Private requirement"}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {published ? "Candidates can discover and apply for this role." : "Only your team and JobiVerse can access this role."}
                </p>
                <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold leading-5 text-zinc-700">
                  Note: For candidates applying directly through the JobiVerse Jobs Portal and joining, a 3% one-time placement fee on Annual CTC applies.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={togglePublishing}
              disabled={isPending}
              className="cursor-pointer rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving..." : published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck size={19} className="text-zinc-600" />
            <div className="w-full">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Requirement status</p>
              <select
                value={status}
                onChange={(event) => changeStatus(event.target.value)}
                disabled={isPending}
                className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none focus:border-zinc-950 disabled:opacity-50"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  );
}
