"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { trackEvent } from "@/lib/analytics/client";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
    trackEvent("application_error", { error_digest: error.digest ?? "client" });
  }, [error]);
  return <main className="grid min-h-[80vh] place-items-center bg-[#f5f5f3] px-5 py-32"><section className="w-full max-w-2xl rounded-[2.5rem] border border-zinc-200 bg-white p-8 text-center shadow-xl sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertTriangle/></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Temporary interruption</p><h1 className="mt-3 text-4xl font-bold">Something went off orbit.</h1><p className="mx-auto mt-4 max-w-lg text-zinc-500">Your data is safe. Retry the page, or return home and continue from there.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={() => unstable_retry()} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 font-semibold text-white"><RotateCcw size={17}/>Try again</button><Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 font-semibold"><Home size={17}/>Home</Link></div>{error.digest&&<p className="mt-6 text-xs text-zinc-400">Support reference: {error.digest}</p>}</section></main>;
}