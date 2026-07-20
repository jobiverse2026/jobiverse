"use client";

import { useState, useTransition } from "react";
import { Globe2, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { requestJobiVerseHiringTeam, setRequirementPublished } from "@/actions/job-publishing";
import { assignRequirementRecruiters, updateRequirementStatus } from "@/actions/requirements";

const statuses = ["Open", "Sourcing", "Interview", "Offer", "Joined", "Closed", "On Hold", "Cancelled"];

type Props = {
  requirement: {
    id: string;
    status: string | null;
    assigned_recruiter?: string | null;
    is_public?: boolean | null;
    hiring_team_requested?: boolean | null;
  };
  recruiters?: { id: string; name: string; email: string }[];
  assignedRecruiterIds?: string[];
};

export default function RequirementControls({ requirement, recruiters = [], assignedRecruiterIds = [] }: Props) {
  const [published, setPublished] = useState(Boolean(requirement.is_public));
  const [jobiVerseAssigned, setJobiVerseAssigned] = useState(Boolean(requirement.hiring_team_requested));
  const [status, setStatus] = useState(requirement.status || "Open");
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>(assignedRecruiterIds.length ? assignedRecruiterIds : requirement.assigned_recruiter ? [requirement.assigned_recruiter] : []);
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

  function assignToJobiVerse() {
    startTransition(async () => {
      try {
        await requestJobiVerseHiringTeam(requirement.id);
        setJobiVerseAssigned(true);
        showSuccess("Requirement assigned to JobiVerse Hiring Team. Our team has been notified.");
      } catch (err) {
        showError(err);
      }
    });
  }

  function toggleRecruiter(recruiterId: string) {
    setSelectedRecruiters((current) => current.includes(recruiterId) ? current.filter((id) => id !== recruiterId) : [...current, recruiterId]);
  }

  function saveRecruiters() {
    const previous = selectedRecruiters;
    startTransition(async () => {
      try {
        const result = await assignRequirementRecruiters(requirement.id, selectedRecruiters);
        if (!result.success) {
          setSelectedRecruiters(previous);
          setMessage(null);
          setError(result.error || "Unable to assign recruiter.");
          return;
        }
        showSuccess(selectedRecruiters.length ? `Requirement assigned to ${selectedRecruiters.length} recruiter${selectedRecruiters.length === 1 ? "" : "s"}.` : "Recruiter assignment removed.");
      } catch (err) {
        setSelectedRecruiters(previous);
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

        <div className={`rounded-2xl border p-5 ${jobiVerseAssigned ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-zinc-50"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <ShieldCheck size={19} className={jobiVerseAssigned ? "text-amber-700" : "text-zinc-600"} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">JobiVerse Hiring Team</p>
                <h3 className="mt-1 font-semibold">{jobiVerseAssigned ? "Assigned to JobiVerse" : "Assign this role to JobiVerse"}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {jobiVerseAssigned
                    ? "JobiVerse can now source, screen and submit candidates for this requirement."
                    : "Request JobiVerse support for sourcing, screening, interview coordination and active hiring follow-up."}
                </p>
                <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold leading-5 text-zinc-700">
                  Commercials for JobiVerse Hiring Team support are negotiable as per role complexity, volume and partnership scope.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={assignToJobiVerse}
              disabled={isPending || jobiVerseAssigned}
              className="cursor-pointer rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {jobiVerseAssigned ? "Assigned" : isPending ? "Saving..." : "Assign"}
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

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck size={19} className="text-zinc-600" />
            <div className="w-full">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Company recruiter assignment</p>
              <h3 className="mt-1 font-semibold">Assign this requirement to a recruiter</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Master employers can assign to any active company recruiter. Invited employers can assign to recruiters allotted to their workspace.
              </p>
              <div className="mt-4 space-y-2">
                {recruiters.map((recruiter) => (
                  <label key={recruiter.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${selectedRecruiters.includes(recruiter.id) ? "border-zinc-950 bg-white shadow-sm" : "border-zinc-200 bg-white/70 hover:border-zinc-400"}`}>
                    <span>
                      <span className="block text-sm font-semibold text-zinc-900">{recruiter.name}</span>
                      <span className="block text-xs text-zinc-500">{recruiter.email}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedRecruiters.includes(recruiter.id)}
                      onChange={() => toggleRecruiter(recruiter.id)}
                      className="h-5 w-5 accent-zinc-950"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={saveRecruiters}
                disabled={isPending}
                className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Saving..." : `Save ${selectedRecruiters.length} recruiter${selectedRecruiters.length === 1 ? "" : "s"}`}
              </button>
              {!recruiters.length && (
                <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-500">
                  No active recruiters are available yet. Add recruiter access from Team Management first.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  );
}
