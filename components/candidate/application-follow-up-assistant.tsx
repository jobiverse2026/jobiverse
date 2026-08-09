"use client";

import { useEffect, useState } from "react";
import { Check, Clipboard, Clock3 } from "lucide-react";

export function ApplicationFollowUpAssistant({ jobTitle, company, appliedAt, status }: { jobTitle: string; company: string; appliedAt: string; status: string }) {
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState(0);
  useEffect(() => { const timer = window.setTimeout(() => setDays(Math.max(0, Math.floor((Date.now() - new Date(appliedAt).getTime()) / 86400000))), 0); return () => window.clearTimeout(timer); }, [appliedAt]);
  const active = /applied|submitted|review|response|screen/i.test(status);
  if (!active) return null;
  const ready = days >= 5;
  const text = `Hello ${company} hiring team,\n\nI am following up on my application for the ${jobTitle} position. I remain interested in the opportunity and would be happy to share any additional information that may help with your review.\n\nThank you for your time.`;
  async function copy() { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
  return <div className={`mt-4 rounded-2xl border p-4 ${ready ? "border-violet-200 bg-violet-50" : "border-zinc-200 bg-white"}`}><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700"><Clock3 size={14}/>Follow-up assistant</p><p className="mt-2 text-sm leading-6 text-zinc-600">{ready ? `${days} days since applying—this is a reasonable time for one polite follow-up.` : `Wait ${5 - days} more day${5 - days === 1 ? "" : "s"} before following up.`}</p>{ready&&<button type="button" onClick={copy} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white">{copied?<Check size={14}/>:<Clipboard size={14}/>} {copied?"Copied":"Copy professional message"}</button>}</div>;
}
