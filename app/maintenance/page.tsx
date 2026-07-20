import Link from "next/link";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/common/logo";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f3] px-5 py-8 text-zinc-950 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[3rem] border border-zinc-200 bg-white p-8 shadow-[0_40px_120px_-60px_rgba(0,0,0,.45)] sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-zinc-200" />
          <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-zinc-100 blur-3xl" />

          <div className="relative">
            <Logo />

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">
                  <Clock size={15} />
                  Platform upgrade in progress
                </p>
                <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-.06em] sm:text-7xl">
                  JobiVerse is getting sharper.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
                  We are refining the hiring, candidate, creator and employer workspaces before opening the platform again. Your data stays safe while we complete the upgrade.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:jobiverse@outlook.com"
                    className="inline-flex rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                  >
                    Contact JobiVerse
                  </a>
                  <Link
                    href="/"
                    className="inline-flex rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Check again later
                  </Link>
                </div>
              </div>

              <div className="rounded-[2.25rem] bg-zinc-950 p-6 text-white shadow-2xl">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                  <Sparkles />
                </div>
                <h2 className="mt-8 text-2xl font-semibold">What we are polishing</h2>
                <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
                  <p className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />Employer hiring controls and company reports.</p>
                  <p className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />Candidate applications and JobiVerse Card visibility.</p>
                  <p className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />Creator services, payments, messages and notifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
