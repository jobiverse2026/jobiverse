"use client";

import Link from "next/link";
import Script from "next/script";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

type Consent={analytics:boolean;updatedAt:string;version:1};
const storageKey="jobiverse-cookie-consent-v1";

export function ConsentManager(){
  const[consent,setConsent]=useState<Consent|null|undefined>(undefined);
  const[settings,setSettings]=useState(false);
  const[analytics,setAnalytics]=useState(false);
  const measurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(()=>{try{const saved=window.localStorage.getItem(storageKey);const parsed=saved?JSON.parse(saved) as Consent:null;setConsent(parsed);setAnalytics(Boolean(parsed?.analytics));}catch{setConsent(null)}},[]);
  function save(enabled:boolean){const value:Consent={analytics:enabled,updatedAt:new Date().toISOString(),version:1};window.localStorage.setItem(storageKey,JSON.stringify(value));setConsent(value);setAnalytics(enabled);setSettings(false)}
  if(consent===undefined)return null;

  return <>
    {consent?.analytics&&measurementId&&<><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive"/><Script id="jobiverse-consented-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}</Script></>}
    {!consent&&<div role="dialog" aria-modal="true" aria-label="Privacy choices" className="fixed inset-x-4 bottom-4 z-[1200] mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-[0_30px_100px_-30px_rgba(0,0,0,.8)] sm:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10"><Cookie/></span><div><h2 className="text-lg font-bold">Your privacy, your choice.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Essential storage keeps login and security working. Optional analytics stays off unless you approve it. Read our <Link href="/privacy-policy" className="font-semibold text-white underline">Privacy Policy</Link>.</p></div></div><div className="flex flex-wrap gap-2"><button onClick={()=>save(false)} className="cursor-pointer rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold">Essential only</button><button onClick={()=>setSettings(true)} className="cursor-pointer rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold">Customize</button><button onClick={()=>save(true)} className="cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950">Accept analytics</button></div></div></div>}
    {consent&&!settings&&<button type="button" onClick={()=>setSettings(true)} className="fixed bottom-4 left-4 z-[1100] grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-lg transition hover:text-zinc-950" aria-label="Cookie and analytics settings" title="Privacy settings"><ShieldCheck size={18}/></button>}
    {settings&&<div className="fixed inset-0 z-[1300] grid place-items-center bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Cookie settings"><section className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-bold"><Settings2 size={17}/>Privacy settings</div><h2 className="mt-3 text-2xl font-bold">Control optional analytics.</h2></div>{consent&&<button onClick={()=>setSettings(false)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-zinc-100" aria-label="Close settings"><X size={18}/></button>}</div><div className="mt-7 space-y-3"><div className="rounded-2xl border border-zinc-200 p-5"><div className="flex justify-between gap-4"><div><p className="font-bold">Essential</p><p className="mt-1 text-sm leading-6 text-zinc-500">Authentication, security and requested platform functions.</p></div><span className="h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Always on</span></div></div><label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-5"><div><p className="font-bold">Analytics</p><p className="mt-1 text-sm leading-6 text-zinc-500">Helps JobiVerse understand page usage and improve performance.</p></div><input type="checkbox" checked={analytics} onChange={event=>setAnalytics(event.target.checked)} className="h-5 w-5 accent-zinc-950"/></label></div><div className="mt-6 flex justify-end gap-3"><button onClick={()=>save(false)} className="cursor-pointer rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold">Essential only</button><button onClick={()=>save(analytics)} className="cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Save choices</button></div></section></div>}
  </>;
}
