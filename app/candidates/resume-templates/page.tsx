import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import ResumeTemplateCatalog from "@/components/candidate/ResumeTemplateCatalog";

export default async function ResumeTemplatesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { supabase, user } = await requireRole(["candidate"]);
  const { type } = await searchParams; const initialType = type === "photo" ? "Photo" : type === "multi" ? "Multi-Page" : type === "owned" ? "Owned CVs" : "All";
  const { data: purchases } = await supabase.from("resume_purchases").select("template_id").eq("user_id", user.id);
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-7xl"><Link href="/candidates/resume" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700"><ArrowLeft size={16} /> Resume Studio</Link><section className="mt-8 rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">JobiVerse Premium CV Collection</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">500 unique compositions.<br /><span className="text-zinc-400">Organized for every career.</span></h1><p className="mt-5 max-w-2xl text-zinc-300">Filter by career category, photo support and multi-page format. Each composition combines a unique header, body and visual treatment.</p></section><ResumeTemplateCatalog initialType={initialType} ownedTemplateIds={(purchases??[]).map(item=>item.template_id)} /></div></main>;
}
