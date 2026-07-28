import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw, ServerOff } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { searchJoobleJobs, type PartnerJobSearch } from "@/lib/jobs/jooble";
import { searchAdzunaJobs, searchArbeitnowJobs, searchHimalayasJobs, searchJobicyJobs, searchMuseJobs, searchRemotiveJobs } from "@/lib/jobs/partner-sources";

export const dynamic = "force-dynamic";

export default async function JobSourceHealthPage() {
  await requireRole(["admin"]);
  const [{count:directCount},checks]=await Promise.all([
    adminSupabase.from("requirements").select("id",{count:"exact",head:true}).eq("is_public",true).not("status","in",'("Closed","Cancelled")'),
    runChecks(),
  ]);
  const snapshots=[{source_name:"JobiVerse Direct",status:"healthy",response_ms:0,reported_jobs:directCount??0,error_message:null,checked_at:new Date().toISOString()},...checks.map((check)=>({source_name:check.name,status:check.status,response_ms:check.responseMs,reported_jobs:check.totalCount,error_message:check.error??null,checked_at:new Date().toISOString()}))];
  await adminSupabase.from("job_source_health_snapshots").insert(snapshots);
  const healthy=snapshots.filter((item)=>item.status==="healthy").length;
  const total=snapshots.reduce((sum,item)=>sum+Number(item.reported_jobs),0);
  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-9 text-white sm:p-12"><Activity/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Jobs network operations</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Source Health.</h1><p className="mt-4 max-w-3xl text-zinc-400">Live diagnostic checks for every opportunity provider. Reload this page to run a fresh check; no public source credentials are exposed.</p></section>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Healthy sources" value={`${healthy}/${snapshots.length}`} icon={CheckCircle2}/><Metric label="Provider-reported jobs" value={total.toLocaleString("en-IN")} icon={Database}/><Metric label="Checked" value={new Intl.DateTimeFormat("en-IN",{timeStyle:"short",timeZone:"Asia/Kolkata"}).format(new Date())} icon={Clock3}/></section>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{snapshots.map((source)=>{const healthy=source.status==="healthy";const configured=source.status!=="not_configured";return <article key={source.source_name} className={`rounded-[2rem] border bg-white p-6 ${healthy?"border-emerald-200":configured?"border-amber-200":"border-zinc-200"}`}><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${healthy?"bg-emerald-100 text-emerald-700":configured?"bg-amber-100 text-amber-700":"bg-zinc-100 text-zinc-500"}`}>{healthy?<CheckCircle2 size={19}/>:configured?<AlertTriangle size={19}/>:<ServerOff size={19}/>}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${healthy?"bg-emerald-50 text-emerald-700":configured?"bg-amber-50 text-amber-700":"bg-zinc-100 text-zinc-500"}`}>{source.status.replace("_"," ")}</span></div><h2 className="mt-5 text-xl font-bold">{source.source_name}</h2><div className="mt-4 grid grid-cols-2 gap-2"><Small label="Reported jobs" value={Number(source.reported_jobs).toLocaleString("en-IN")}/><Small label="Response" value={source.response_ms?`${source.response_ms} ms`:"Internal"}/></div>{source.error_message&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">{source.error_message}</p>}</article>})}</section>
    <a href="/admin/job-sources" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 font-semibold text-white"><RefreshCw size={16}/>Run checks again</a>
  </div>;
}

async function runChecks(){
  const sources:[string,Promise<PartnerJobSearch>][]=[
    ["Jooble",searchJoobleJobs({location:"India",page:1,resultsPerPage:1})],
    ["Adzuna",searchAdzunaJobs({location:"India",page:1,resultsPerPage:1})],
    ["Remotive",searchRemotiveJobs({location:"India",page:1,resultsPerPage:1})],
    ["Arbeitnow",searchArbeitnowJobs({location:"India",page:1,resultsPerPage:1})],
    ["Jobicy",searchJobicyJobs({location:"India",page:1,resultsPerPage:1})],
    ["Himalayas",searchHimalayasJobs({location:"India",page:1,resultsPerPage:1})],
    ["The Muse",searchMuseJobs({location:"India",page:1,resultsPerPage:1})],
  ];
  return Promise.all(sources.map(async([name,request])=>{const started=Date.now();const result=await withDeadline(request);return{name,responseMs:Date.now()-started,totalCount:result.totalCount,error:result.error,status:!result.configured?"not_configured":result.error?"degraded":"healthy"} as const;}));
}
async function withDeadline(request:Promise<PartnerJobSearch>){return Promise.race([request,new Promise<PartnerJobSearch>((resolve)=>setTimeout(()=>resolve({configured:true,totalCount:0,jobs:[],error:"Health check timed out."}),4500))])}
function Metric({label,value,icon:Icon}:{label:string;value:string;icon:typeof Activity}){return <article className="rounded-3xl border border-zinc-200 bg-white p-6"><Icon className="text-zinc-400"/><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>}
function Small({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>}
