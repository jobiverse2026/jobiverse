import RequirementForm from "@/components/employer/requirements/RequirementForm";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function NewRequirementPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,.95),transparent_28%),radial-gradient(circle_at_88%_24%,rgba(161,161,170,.18),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.035] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl">
        <Link href="/employers/dashboard" className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition hover:-translate-x-1 hover:border-black/20">
          <ArrowLeft size={16} /> Back to workspace
        </Link>

        <section className="mb-10 grid gap-8 overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.65)] md:grid-cols-[1fr_auto] md:p-12">
          <div className="max-w-3xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-zinc-200 backdrop-blur-xl">
              <Sparkles size={14} /> Free job posting
            </span>
            <h1 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl md:text-6xl">Post a role free.<br /><span className="text-zinc-400">Pay after a successful hire.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">Publish the opportunity to JobiVerse talent with no upfront posting fee. If a direct applicant successfully joins, the one-time employer success fee is 3% of annual CTC.</p>
          </div>
          <div className="hidden h-36 w-36 place-items-center self-center rounded-full border border-white/15 bg-white/5 md:grid">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-white/10"><BriefcaseBusiness size={34} /></div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
          <RequirementForm />
          <aside className="space-y-5 xl:sticky xl:top-32 xl:self-start">
            <div className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">How your requirement works</p>
              <div className="mt-6 space-y-5">
                {["Publish your job for free", "Receive direct JobiVerse applicants", "Pay 3% only after a successful joining"].map((step, index) => (
                  <div key={step} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs text-white">{index + 1}</span><p className="pt-1 text-sm font-medium text-zinc-700">{step}</p></div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-black/5 bg-zinc-200/70 p-6">
              <ShieldCheck className="mb-4 text-zinc-800" />
              <p className="font-semibold text-zinc-950">Confidential by design</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Your hiring brief stays within your authorized JobiVerse workspace.</p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 p-6 text-white shadow-[0_28px_80px_-35px_rgba(30,64,175,.8)]">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />
              <div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-blue-100"><Sparkles size={13}/>Strategic hiring partnership</span><h3 className="mt-5 text-2xl font-semibold tracking-tight">Partner with JobiVerse Hiring Team</h3><p className="mt-3 text-sm leading-6 text-zinc-300">Build an ongoing recruitment partnership for multiple roles, recurring hiring plans and growing teams. JobiVerse works as an extension of your hiring function with coordinated delivery across requirements.</p><div className="mt-5 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-200">Partnership commercials</p><p className="mt-2 text-sm font-semibold">Negotiable</p><p className="mt-1 text-xs leading-5 text-zinc-400">Commercial terms are structured around hiring volume, role mix, complexity and expected partnership scope.</p></div><div className="mt-5 space-y-3 border-t border-white/10 pt-5">{["Multi-role hiring support", "Dedicated recruitment coordination", "Active and passive talent sourcing", "Screening, interviews and joining support"].map((benefit)=><p key={benefit} className="flex items-center gap-2 text-xs font-medium text-zinc-200"><CheckCircle2 className="shrink-0 text-blue-300" size={15}/>{benefit}</p>)}</div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
