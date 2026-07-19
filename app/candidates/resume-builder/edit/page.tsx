import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import WordStyleResumeEditor from "@/components/candidate/WordStyleResumeEditor";
import type { ResumeContent } from "@/components/candidate/ResumeDocument";

export default async function ResumeDocumentEditorPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { supabase, user, profile: account } = await requireRole(["candidate"]); const { template = "jv-1-1-1" } = await searchParams;
  const { data: profile } = await supabase.from("candidate_profiles").select("headline, phone, current_location, bio, primary_skills, current_company").eq("user_id", user.id).maybeSingle();
  const content: ResumeContent = { name: account.full_name ?? "Your Name", title: profile?.headline ?? "Professional Headline", email: account.email ?? "email@example.com", phone: profile?.phone ?? "+91 00000 00000", location: profile?.current_location ?? "Mumbai, India", summary: profile?.bio ?? "Write a compelling professional summary.", skills: profile?.primary_skills ?? "Communication, Problem Solving, Leadership", experience: profile?.current_company ? `${profile.headline ?? "Professional"} - ${profile.current_company}\nDescribe responsibilities and measurable achievements.` : "Role - Company\nDescribe responsibilities and measurable achievements.", education: "Degree - University\nGraduation year and achievements", projects: "Project or Achievement\nExplain your contribution and result.", certifications: "Professional Certification - Issuing Organization", languages: "English - Professional\nHindi - Native" };
  return <main className="min-h-screen bg-[#f5f5f3] px-4 pb-20 pt-32 sm:px-7"><div className="mx-auto max-w-[1600px]"><Link href={`/candidates/resume-builder?template=${template}`} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium"><ArrowLeft size={16}/> Back to CV Builder</Link><div className="my-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">JobiVerse Document Editor</p><h1 className="mt-2 text-4xl font-semibold">Edit every detail, your way.</h1></div><WordStyleResumeEditor templateId={template} data={content}/></div></main>;
}
