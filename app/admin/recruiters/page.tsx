import { BriefcaseBusiness, Mail, Phone, UserCog } from "lucide-react";

import { updateRecruiterAccess } from "@/app/admin/directory-actions";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function AdminRecruitersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole(["admin"]);
  const { q = "" } = await searchParams;
  const [{ data: recruiters, error }, { data: requirements }, { data: candidates }] = await Promise.all([
    adminSupabase.from("users").select("id,full_name,email,phone,avatar_url,is_active,created_at").eq("role", "recruiter").order("created_at", { ascending: false }),
    adminSupabase.from("requirements").select("id,assigned_recruiter,status"),
    adminSupabase.from("candidates").select("id,recruiter_id,status"),
  ]);
  if (error) throw new Error(error.message);
  const normalized = q.trim().toLowerCase();
  const rows = (recruiters ?? []).filter((recruiter) => !normalized || [recruiter.full_name, recruiter.email, recruiter.phone].some((value) => value?.toLowerCase().includes(normalized)));
  const activeCount = (recruiters ?? []).filter((recruiter) => recruiter.is_active).length;

  return <div className="space-y-8"><section className="rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-10"><UserCog/><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Internal hiring team</p><h1 className="mt-3 text-4xl font-bold">Recruiter Management</h1><p className="mt-3 text-zinc-400">Monitor workload and control access for authorized recruitment team members.</p></section><section className="grid gap-4 sm:grid-cols-3"><Metric label="Recruiters" value={(recruiters ?? []).length}/><Metric label="Active access" value={activeCount}/><Metric label="Suspended" value={(recruiters ?? []).length-activeCount}/></section><form className="rounded-3xl border border-zinc-200 bg-white p-5"><label className="text-sm font-semibold">Search recruiters<input name="q" defaultValue={q} placeholder="Name, email or phone" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500"/></label></form><section className="grid gap-5 xl:grid-cols-2">{rows.length?rows.map((recruiter)=>{const assigned=(requirements??[]).filter((item)=>item.assigned_recruiter===recruiter.id);const activeRoles=assigned.filter((item)=>!["Closed","Cancelled","On Hold"].includes(item.status)).length;const submitted=(candidates??[]).filter((item)=>item.recruiter_id===recruiter.id);return <article key={recruiter.id} className={`rounded-3xl border bg-white p-6 ${recruiter.is_active?"border-zinc-200":"border-red-200"}`}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recruitment team</p><h2 className="mt-2 text-2xl font-bold">{recruiter.full_name||"Unnamed recruiter"}</h2><div className="mt-3 space-y-1 text-sm text-zinc-500"><p className="flex items-center gap-2"><Mail size={14}/>{recruiter.email}</p>{recruiter.phone&&<p className="flex items-center gap-2"><Phone size={14}/>{recruiter.phone}</p>}</div></div><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${recruiter.is_active?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{recruiter.is_active?"Active":"Suspended"}</span></div><div className="mt-5 grid grid-cols-3 gap-3"><Small label="Assigned roles" value={assigned.length}/><Small label="Active roles" value={activeRoles}/><Small label="Candidates" value={submitted.length}/></div><form action={updateRecruiterAccess} className="mt-5 border-t border-zinc-100 pt-5"><input type="hidden" name="recruiterId" value={recruiter.id}/><button name="active" value={recruiter.is_active?"false":"true"} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${recruiter.is_active?"bg-red-50 text-red-700":"bg-zinc-950 text-white"}`}><BriefcaseBusiness size={15}/>{recruiter.is_active?"Suspend access":"Restore access"}</button></form></article>}):<Empty text="No recruiters match this search."/>}</section></div>;
}

function Metric({label,value}:{label:string;value:number}){return <article className="rounded-3xl border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>}
function Small({label,value}:{label:string;value:number}){return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase text-zinc-400">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>}
function Empty({text}:{text:string}){return <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-500 xl:col-span-2">{text}</p>}
