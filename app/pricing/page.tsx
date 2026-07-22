import Link from "next/link";
import { ArrowRight, WalletCards } from "lucide-react";
import { PricingExplorer } from "@/components/pricing/PricingExplorer";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-zinc-950">
      <section className="px-5 pb-10 pt-36 sm:px-8">
        <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,.18),transparent_24rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] p-8 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:p-12 lg:p-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200">
            <WalletCards size={15} /> JobiVerse pricing
          </span>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-.06em] sm:text-7xl">
                Clear pricing for every side of the JobiVerse.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Employers get hiring control. Professionals and students get career support. Creators earn through services and templates. AI stays Coming Soon until we activate it after revenue starts.
              </p>
            </div>
            <div className="rounded-[2.25rem] border border-white/10 bg-white/[.07] p-6">
              <p className="text-sm font-semibold text-white">How to read this page</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Open one section at a time. Every important service, subscription, add-on, success fee and creator earning charge is listed without making the page unnecessarily huge.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/plans" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950">
                  Request a plan <ArrowRight size={16} />
                </Link>
                <Link href="/marketplace" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white">
                  Explore services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingExplorer />
    </main>
  );
}
