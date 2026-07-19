import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ServiceForm } from "./service-form";

export default async function NewMarketplaceServicePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/creator?next=/earn-with-jobiverse/dashboard/services/new");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["candidate", "creator"].includes(profile.role)) redirect("/login/creator?error=creator_required");

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/earn-with-jobiverse/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/> Creator dashboard</Link><section className="my-8 overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-zinc-400"><BadgeCheck size={14}/> Automatic publishing</div><h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Create your service.</h1><p className="mt-4 max-w-2xl leading-7 text-zinc-400">Turn your expertise into a clear, bookable offering. It will appear in the relevant JobiVerse marketplace section immediately.</p></section><ServiceForm/></div></main>;
}
