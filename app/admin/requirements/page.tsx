import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin, UsersRound } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const knownStatuses = ["Open", "Assigned", "In Progress", "On Hold", "Closed", "Cancelled"];

export default async function RequirementsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; queue?: string }> }) {
  await requireRole(["admin"]);
  const { q = "", status = "all", queue = "all" } = await searchParams;
  const [{ data: requirements, error }, { data: companies }, { data: recruiters }] = await Promise.all([
    adminSupabase.from("requirements").select("id,company_id,assigned_recruiter,job_title,department,experience,vacancies,location,priority,status,hiring_team_requested,is_public,created_at").order("created_at", { ascending: false }).limit(300),
    adminSupabase.from("companies").select("id,company_name,location"),
    adminSupabase.from("users").select("id,full_name,email").eq("role", "recruiter"),
  ]);
  if (error) throw new Error(error.message);

  const companyMap = new Map((companies ?? []).map((company) => [company.id, company]));
  const recruiterMap = new Map((recruiters ?? []).map((recruiter) => [recruiter.id, recruiter.full_name || recruiter.email]));
  const normalized = q.trim().toLowerCase();
  const rows = (requirements ?? []).filter((requirement) => {
    const company = companyMap.get(requirement.company_id);
    const matchesQueue = queue === "jobiverse" ? requirement.hiring_team_requested : true;
    return matchesQueue && (status === "all" || requirement.status === status) && (!normalized || [requirement.job_title, requirement.department, requirement.location, company?.company_name].some((value) => value?.toLowerCase().includes(normalized)));
  });
  const statusOptions = [...new Set([...(requirements ?? []).map((item) => item.status), ...knownStatuses])];

  return <div className="space-y-8">
    <section className="rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-10"><BriefcaseBusiness/><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Recruitment operations</p><h1 className="mt-3 text-4xl font-bold">Hiring Requirements</h1><p className="mt-3 text-zinc-400">Review every employer mandate, hiring channel, assignment and status from one live directory.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Requirements" value={(requirements??[]).length}/><Metric label="Open / active" value={(requirements??[]).filter((item)=>!["Closed","Cancelled","On Hold"].includes(item.status)).length}/><MetricLink label="Assigned to JobiVerse" value={(requirements??[]).filter((item)=>item.hiring_team_requested).length} href="/admin/requirements?queue=jobiverse" active={queue==="jobiverse"}/><Metric label="Published jobs" value={(requirements??[]).filter((item)=>item.is_public).length}/></section>
    {queue==="jobiverse"&&<div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-800"><div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2"><UsersRound size={17}/>Showing requirements assigned to JobiVerse Hiring Team.</span><Link href="/admin/requirements" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-violet-800">Show all</Link></div></div>}
    <form className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_220px_180px_auto]"><input name="q" defaultValue={q} placeholder="Search role, company, department or location" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500"/><select name="status" defaultValue={status} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4"><option value="all">All statuses</option>{statusOptions.map((item)=><option key={item} value={item}>{item}</option>)}</select><select name="queue" defaultValue={queue} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4"><option value="all">All queues</option><option value="jobiverse">JobiVerse only</option></select><button className="cursor-pointer rounded-xl bg-zinc-950 px-6 font-semibold text-white">Apply filters</button></form>
    <section className="grid gap-4">{rows.length?rows.map((requirement)=>{const company=companyMap.get(requirement.company_id);return <article key={requirement.id} className={`rounded-3xl border bg-white p-6 ${requirement.hiring_team_requested?"border-violet-200 shadow-[0_18px_55px_-38px_rgba(109,40,217,.55)]":"border-zinc-200"}`}><div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Status status={requirement.status}/><span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase text-zinc-600">{requirement.priority}</span>{requirement.hiring_team_requested&&<span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase text-violet-700">JobiVerse hiring team</span>}{requirement.is_public&&<span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">Jobs portal live</span>}</div><h2 className="mt-3 text-xl font-bold">{requirement.job_title}</h2><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500"><span className="flex items-center gap-2"><Building2 size={14}/>{company?.company_name||"Company unavailable"}</span><span className="flex items-center gap-2"><MapPin size={14}/>{requirement.location||company?.location||"Location not provided"}</span></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[620px]"><Small label="Experience" value={requirement.experience||"-"}/><Small label="Vacancies" value={String(requirement.vacancies)}/><Small label="Department" value={requirement.department||"-"}/><Small label="Recruiter" value={requirement.assigned_recruiter?recruiterMap.get(requirement.assigned_recruiter)||"Assigned":requirement.hiring_team_requested?"Team queue":"Unassigned"}/></div></div><div className="mt-5 flex justify-end border-t border-zinc-100 pt-5"><Link href={`/admin/requirements/${requirement.id}`} className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">View requirement<ArrowRight size={14}/></Link></div></article>}):<p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-500">No requirements match these filters.</p>}</section>
  </div>;
}

function Metric({label,value}:{label:string;value:number}){return <article className="rounded-3xl border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>}
function MetricLink({label,value,href,active}:{label:string;value:number;href:string;active:boolean}){return <Link href={href} className={`rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${active?"border-violet-300 bg-violet-50":"border-zinc-200 bg-white"}`}><p className={`text-sm ${active?"text-violet-700":"text-zinc-500"}`}>{label}</p><div className="mt-2 flex items-end justify-between"><p className="text-3xl font-bold">{value}</p><ArrowRight size={17} className={active?"text-violet-700":"text-zinc-400"}/></div></Link>}
function Small({label,value}:{label:string;value:string}){return <div className="min-w-0 rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase text-zinc-400">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div>}
function Status({status}:{status:string}){const tone=status==="Closed"?"bg-emerald-100 text-emerald-700":status==="Cancelled"?"bg-red-100 text-red-700":status==="On Hold"?"bg-amber-100 text-amber-700":"bg-blue-100 text-blue-700";return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${tone}`}>{status}</span>}
