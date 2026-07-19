import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BellRing, Mail, ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { defaultNotificationPreferences, notificationCategories, type NotificationPreferences } from "@/lib/notifications/preferences";
import { saveNotificationPreferences } from "./actions";

const content = {
  jobs: ["Jobs & opportunities", "New roles, saved-job and job-alert updates."],
  recruitment: ["Recruitment journey", "Applications, candidate submissions, interviews and offers."],
  marketplace: ["Services & orders", "Negotiations, bookings, delivery, reviews and disputes."],
  payments: ["Payments & payouts", "Receipts, refunds, billing and creator payout updates."],
  messages: ["Messages & support", "Order conversations and JobiVerse Support replies."],
} as const;

export default async function NotificationPreferencesPage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
  const {saved}=await searchParams;
  const supabase=await createServerSupabaseClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/login/candidate?next=/account/notifications");
  const{data}=await supabase.from("notification_preferences").select("*").eq("user_id",user.id).maybeSingle();
  const preferences={...defaultNotificationPreferences,...(data??{})} as NotificationPreferences;
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/>Back to dashboard</Link><section className="relative mt-7 overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10"/><BellRing/><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Your communication controls</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Notification preferences.</h1><p className="mt-3 max-w-2xl text-zinc-400">Choose the updates you want from JobiVerse. Essential account security messages cannot be disabled.</p></section>{saved&&<div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Notification preferences saved successfully.</div>}<form action={saveNotificationPreferences} className="mt-7 space-y-5"><div className="grid gap-4">{notificationCategories.map(category=>{const[label,description]=content[category];return <article key={category} className="rounded-[2rem] border border-zinc-200 bg-white p-6 sm:p-7"><div className="grid gap-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><h2 className="font-bold text-zinc-950">{label}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div><Toggle name={`in_app_${category}`} label="In-app" icon={<BellRing size={15}/>} checked={preferences[`in_app_${category}`]}/><Toggle name={`email_${category}`} label="Email" icon={<Mail size={15}/>} checked={preferences[`email_${category}`]}/></div></article>})}</div><section className="rounded-[2rem] border border-zinc-200 bg-white p-6 sm:p-7"><Toggle name="marketing_email" label="JobiVerse product news and useful career content" icon={<Mail size={15}/>} checked={preferences.marketing_email}/><p className="mt-3 text-xs leading-5 text-zinc-400">Email selections are saved now and will activate after production SMTP is connected. Transactional security and legal messages may still be sent when required.</p></section><div className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-950 p-5 text-white"><p className="flex items-center gap-2 text-xs text-zinc-400"><ShieldCheck size={16}/>Privacy-first controls for your JobiVerse account.</p><button className="cursor-pointer rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950">Save preferences</button></div></form></div></main>;
}

function Toggle({name,label,icon,checked}:{name:string;label:string;icon:React.ReactNode;checked:boolean}){return <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold sm:min-w-36"><span className="flex items-center gap-2">{icon}{label}</span><input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-zinc-950"/></label>}
