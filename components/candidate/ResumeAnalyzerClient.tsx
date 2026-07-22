"use client";

import { useState } from "react";
import { BrainCircuit, Clock3, LoaderCircle, Sparkles } from "lucide-react";
import { analyzeCandidateResume } from "@/actions/resume-analysis";

export default function ResumeAnalyzerClient({ hasResume, enabled, hasCredit }: { hasResume: boolean; enabled: boolean; hasCredit: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setLoading(true); setMessage(null);
    try {
      await analyzeCandidateResume();
      setMessage("Analysis completed successfully. Refreshing your report...");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to analyze your resume.");
      setLoading(false);
    }
  }

  return <div className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_80px_-45px_rgba(0,0,0,.55)] sm:p-9">
    <div className="flex items-start gap-4"><div className="rounded-2xl bg-zinc-950 p-3 text-white"><BrainCircuit size={24} /></div><div><h2 className="text-xl font-semibold">AI Resume Intelligence</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Analyze your current CV for ATS readiness, clarity, impact and role alignment.</p></div></div>
    <button type="button" onClick={run} disabled={!enabled || !hasResume || !hasCredit || loading} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-45">{!enabled ? <Clock3 size={19} /> : loading ? <LoaderCircle className="animate-spin" size={19} /> : <Sparkles size={19} />}{!enabled ? "Coming Soon" : loading ? "Analyzing your CV..." : hasCredit ? "Run AI Analysis" : "Unlock AI Analysis"}</button>
    {!enabled && <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">AI analysis is being prepared for launch. Your resume and profile tools remain available.</p>}
    {enabled && !hasCredit && <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">Complete one-time payment below to unlock a Gemini-powered resume report.</p>}
    {enabled && !hasResume && <p className="mt-4 text-sm text-amber-700">Upload a PDF resume in your professional profile first.</p>}
    {message && <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
    <p className="mt-5 text-xs leading-5 text-zinc-400">Scores are AI estimates for guidance and do not guarantee acceptance by any ATS or employer.</p>
  </div>;
}
