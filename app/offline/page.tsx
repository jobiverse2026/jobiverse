import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export const metadata = { title: "You are offline" };

export default function OfflinePage() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f5f3] px-5 py-24"><section className="w-full max-w-xl rounded-[2.5rem] border border-zinc-200 bg-white p-8 text-center shadow-xl sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-950 text-white"><WifiOff size={28}/></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Connection unavailable</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">JobiVerse will reconnect shortly.</h1><p className="mt-4 text-sm leading-7 text-zinc-500">Check your internet connection and try again. For privacy, account pages and hiring data are not stored offline.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white"><RefreshCw size={16}/>Try again</Link><Link href="/" className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold">Home</Link></div></section></main>;
}

