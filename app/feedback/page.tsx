import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Headphones, Lightbulb, MessageSquareText } from "lucide-react";

import { submitFeedback } from "./actions";
import { requireRole } from "@/lib/auth/authorization";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const [params, access] = await Promise.all([
    searchParams,
    requireRole(["candidate", "employer", "recruiter", "creator", "admin"]).catch(() => null),
  ]);
  if (!access) redirect("/login/candidate?next=%2Ffeedback");

  const { submitted } = params;
  const { supabase, user } = access;
  const { data: history } = await supabase.from("user_feedback").select("id,category,area,subject,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8);
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl">
    <section className="overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_85%_12%,rgba(255,255,255,.18),transparent_22rem),linear-gradient(135deg,#09090b,#3f3f46)] p-8 text-white sm:p-12"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em]"><MessageSquareText size={15}/>Feedback centre</span><h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Help us make your universe better.</h1><p className="mt-5 max-w-2xl leading-7 text-zinc-300">Report an issue, suggest a feature or request a service. Every submission becomes a trackable JobiVerse ticket.</p></section>
    {submitted === "1" && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-semibold text-emerald-800"><CheckCircle2/>Feedback submitted successfully. Our team can now track it.</div>}
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
      <form action={submitFeedback} className="rounded-[2.25rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-9"><h2 className="text-2xl font-bold">Create a feedback ticket</h2><div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Feedback type"><select name="category" required className={input}><option value="issue">Report an issue</option><option value="feature">Suggest a feature</option><option value="service_request">Request a service</option><option value="experience">Share experience</option></select></Field>
        <Field label="Platform area"><select name="area" required className={input}><option>Jobs & applications</option><option>Candidate workspace</option><option>Employer workspace</option><option>Recruiter workspace</option><option>Creator marketplace</option><option>Payments & billing</option><option>Messages & notifications</option><option>Website & navigation</option><option>Other</option></select></Field>
        <div className="sm:col-span-2"><Field label="Subject"><input name="subject" required minLength={3} maxLength={140} className={input} placeholder="Briefly describe what you need"/></Field></div>
        <div className="sm:col-span-2"><Field label="Complete details"><textarea name="details" required minLength={10} maxLength={4000} rows={7} className={input} placeholder="What happened, what did you expect, or what should JobiVerse add?"/></Field></div>
        <Field label="Experience rating (optional)"><select name="rating" className={input}><option value="">Not rated</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></Field>
        <Field label="Related page (optional)"><input name="pageUrl" className={input} placeholder="/jobs or complete URL"/></Field>
      </div><button className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-zinc-950 px-7 py-4 font-bold text-white">Submit feedback <Lightbulb size={17}/></button></form>
      <aside className="space-y-5"><section className="rounded-[2rem] bg-zinc-950 p-7 text-white"><Headphones/><h2 className="mt-5 text-xl font-bold">Need a conversation?</h2><p className="mt-3 text-sm leading-6 text-zinc-400">For order, account or sensitive support, use the private JobiVerse support chat.</p><Link href="/messages/support" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950">Open support chat</Link></section><section className="rounded-[2rem] border border-zinc-200 bg-white p-6"><h2 className="font-bold">Your recent tickets</h2><div className="mt-4 space-y-3">{history?.length ? history.map(item=><div key={item.id} className="rounded-xl bg-zinc-50 p-4"><p className="font-semibold">{item.subject}</p><p className="mt-1 text-xs text-zinc-500">{item.area} · {item.status.replaceAll("_", " ")}</p></div>) : <p className="text-sm text-zinc-500">No feedback tickets yet.</p>}</div></section></aside>
    </div>
  </div></main>;
}

const input = "mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition focus:border-zinc-500 focus:bg-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-sm font-semibold text-zinc-700">{label}{children}</label>; }
