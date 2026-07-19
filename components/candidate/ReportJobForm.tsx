"use client";

import { useActionState } from "react";
import { Flag, LoaderCircle } from "lucide-react";

import { reportJob, type JobReportState } from "@/app/candidates/jobs/report-actions";

const initial: JobReportState = {};

export function ReportJobForm({ requirementId }: { requirementId: string }) {
  const [state, action, pending] = useActionState(reportJob, initial);
  return <details className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50"><summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-zinc-500"><Flag size={13}/>Report this opportunity</summary><form action={action} className="space-y-3 border-t border-zinc-200 p-4"><input type="hidden" name="requirementId" value={requirementId}/><select name="reason" required defaultValue="" className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="" disabled>Select concern</option><option value="fee_request">Someone requested a candidate fee</option><option value="misleading">Misleading job information</option><option value="expired">Role appears expired</option><option value="discrimination">Discriminatory content or conduct</option><option value="suspicious_contact">Suspicious contact or impersonation</option><option value="other">Other safety concern</option></select><textarea name="details" required minLength={10} maxLength={1000} placeholder="Explain what happened without sharing passwords or banking credentials" className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm"/>{state.error&&<p role="alert" className="text-xs font-semibold text-red-600">{state.error}</p>}{state.success&&<p role="status" className="text-xs font-semibold text-emerald-700">{state.success}</p>}<button disabled={pending} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending?<LoaderCircle className="animate-spin" size={15}/>:<Flag size={15}/>}Submit private report</button></form></details>;
}
