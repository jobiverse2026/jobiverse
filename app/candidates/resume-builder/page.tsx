import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import EditableResumeBuilder from "@/components/candidate/EditableResumeBuilder";

export default async function ResumeBuilderPage({ searchParams }: { searchParams: Promise<{ template?: string; download?: string }> }) {
  const { supabase, user, profile: userProfile } = await requireRole(["candidate"]);
  const { data: profile } = await supabase.from("candidate_profiles").select("headline, phone, current_location, bio, primary_skills, current_company, total_experience").eq("user_id", user.id).maybeSingle();
  const { template = "modern", download } = await searchParams;
  const { data: purchase } = await supabase.from("resume_purchases").select("id").eq("user_id", user.id).eq("template_id", template).maybeSingle();
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-[1500px]"><div className="print:hidden"><Link href="/candidates/resume" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700"><ArrowLeft size={16} /> Resume Studio</Link><div className="my-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Free CV Builder</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Create. Edit. Make it yours.</h1><p className="mt-3 text-zinc-500">No AI usage, no API cost-just a polished editable resume.</p></div></div><EditableResumeBuilder initial={{ ...profile, full_name: userProfile.full_name, email: userProfile.email }} defaultTemplate={template} unlocked={!!purchase} autoDownload={!!purchase&&download==="1"} /></div></main>;
}
