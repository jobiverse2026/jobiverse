import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, BriefcaseBusiness, CheckCircle2 } from "lucide-react";

export default function FreeHiringCard() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900 p-7 text-white shadow-2xl sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-emerald-300/15" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-200"><BadgeIndianRupee size={15} /> Free hiring access</div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Post jobs free. Build your applicant pipeline now.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">No subscription is required to publish a role. A one-time employer success fee of 3% of annual CTC becomes payable only when a candidate who applied directly through the JobiVerse Jobs Portal successfully joins.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-emerald-100">
            {["Unlimited free job briefs", "Direct applicant tracking", "Interview workflow", "Pay only after joining"].map((benefit) => <span key={benefit} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CheckCircle2 size={14} />{benefit}</span>)}
          </div>
        </div>
        <Link href="/employers/requirements/new" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 font-bold text-zinc-950 shadow-xl transition hover:-translate-y-1">
          <BriefcaseBusiness size={19} /> Post a job free <ArrowRight className="transition group-hover:translate-x-1" size={17} />
        </Link>
      </div>
    </section>
  );
}
