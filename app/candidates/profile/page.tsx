import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import ProfessionalProfileForm from "@/components/candidate/ProfessionalProfileForm";

export default async function CandidateProfilePage() {
  const { supabase, user } = await requireRole(["candidate"]);
  const { data: profile } = await supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle();
  const { data: signedResume } = profile?.resume_path ? await supabase.storage.from("candidate-resumes").createSignedUrl(profile.resume_path, 3600) : { data: null };
  const profileWithResume = profile ? { ...profile, resume_url: signedResume?.signedUrl ?? null } : null;
  return <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_88%_22%,rgba(99,102,241,.11),transparent_24%)]" /><div className="relative mx-auto max-w-6xl"><Link href="/candidates/dashboard" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700"><ArrowLeft size={16} /> Talent Dashboard</Link><section className="my-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12"><div className="flex items-end justify-between gap-8"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Professional identity</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Build a profile<br /><span className="text-zinc-400">worth discovering.</span></h1><p className="mt-5 max-w-2xl text-zinc-300">Your profile powers applications, recruiter discovery and future JobiVerse AI career tools.</p></div><UserRound className="hidden text-zinc-500 sm:block" size={70} /></div></section><ProfessionalProfileForm profile={profileWithResume} /></div></main>;
}
