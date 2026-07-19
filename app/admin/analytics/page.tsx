import { BarChart3, BriefcaseBusiness, CalendarCheck, Clock3, Target, Trophy, UserRoundCheck, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminAnalyticsPage(){
  const{supabase}=await requireRole(["admin"]);
  const[{data:requirements},{data:candidates},{data:interviews},{data:placements},{data:companies},{data:recruiters}]=await Promise.all([
    supabase.from("requirements").select("id,company_id,assigned_recruiter,status,created_at"),
    supabase.from("candidates").select("id,requirement_id,recruiter_id,status,created_at"),
    supabase.from("interviews").select("id,candidate_id,requirement_id,status,created_at,interview_date"),
    supabase.from("placements").select("id,candidate_id,requirement_id,status,created_at,joining_date"),
    supabase.from("companies").select("id,industry"),
    supabase.from("users").select("id,full_name").eq("role","recruiter"),
  ]);
  const reqs=requirements??[];const people=candidates??[];const meetings=interviews??[];const hires=placements??[];
  const active=reqs.filter(item=>!["closed","cancelled"].includes(normalize(item.status))).length;
  const interviewed=new Set(meetings.map(item=>item.candidate_id)).size;
  const offered=new Set(hires.filter(item=>["offered","accepted","joined","completed"].includes(normalize(item.status))).map(item=>item.candidate_id)).size;
  const joined=hires.filter(item=>["joined","completed"].includes(normalize(item.status))).length;
  const filledRequirementIds=new Set(hires.filter(item=>["joined","completed"].includes(normalize(item.status))).map(item=>item.requirement_id));
  const timeToHire=reqs.filter(req=>filledRequirementIds.has(req.id)).map(req=>{const placement=hires.filter(item=>item.requirement_id===req.id&&["joined","completed"].includes(normalize(item.status))).sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())[0];return placement?Math.max(0,Math.round((new Date(placement.created_at).getTime()-new Date(req.created_at).getTime())/86400000)):0;});
  const averageTime=timeToHire.length?Math.round(timeToHire.reduce((sum,value)=>sum+value,0)/timeToHire.length):0;
  const metrics=[
    ["Active requirements",active,"Live hiring demand",BriefcaseBusiness],
    ["Candidates in system",people.length,"Real submitted profiles",UsersRound],
    ["Interview conversion",percent(interviewed,people.length),`${interviewed} candidates interviewed`,CalendarCheck],
    ["Offer conversion",percent(offered,people.length),`${offered} candidates offered`,Target],
    ["Successful joins",joined,"Joined or completed placements",UserRoundCheck],
    ["Average time-to-hire",`${averageTime} days`,`${timeToHire.length} completed requirements`,Clock3],
  ] as const;
  const pipeline=groupCounts(people.map(item=>item.status));
  const companyIndustries=new Map((companies??[]).map(company=>[company.id,company.industry||"Unspecified"]));
  const industries=sortedCounts(reqs.map(req=>companyIndustries.get(req.company_id)??"Unspecified")).slice(0,7);
  const recruiterNames=new Map((recruiters??[]).map(recruiter=>[recruiter.id,recruiter.full_name]));
  const recruiterCandidates=sortedCounts(people.map(person=>recruiterNames.get(person.recruiter_id)??"Unassigned")).slice(0,7);
  const months=lastMonths(6);const trend=months.map(month=>({label:month.label,requirements:reqs.filter(item=>monthKey(item.created_at)===month.key).length,candidates:people.filter(item=>monthKey(item.created_at)===month.key).length,placements:hires.filter(item=>monthKey(item.created_at)===month.key).length}));
  const maxTrend=Math.max(1,...trend.flatMap(item=>[item.requirements,item.candidates,item.placements]));
  return <div className="space-y-8"><section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-9 text-white sm:p-12"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10"/><BarChart3/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Live recruitment intelligence</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Hiring Analytics.</h1><p className="mt-4 max-w-3xl text-zinc-400">Real operational metrics calculated directly from requirements, candidates, interviews, offers and placements.</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map(([label,value,detail,Icon])=><article key={label} className="rounded-3xl border border-zinc-200 bg-white p-6"><Icon className="text-zinc-400"/><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-400">{detail}</p></article>)}</section><section className="rounded-[2rem] border border-zinc-200 bg-white p-7 sm:p-9"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Six-month movement</p><h2 className="mt-2 text-2xl font-bold">Hiring activity trend</h2></div><div className="mt-8 grid h-72 grid-cols-6 items-end gap-3 sm:gap-6">{trend.map(month=><div key={month.label} className="flex h-full flex-col justify-end"><div className="flex flex-1 items-end justify-center gap-1"><TrendBar value={month.requirements} max={maxTrend} tone="bg-zinc-950"/><TrendBar value={month.candidates} max={maxTrend} tone="bg-violet-500"/><TrendBar value={month.placements} max={maxTrend} tone="bg-emerald-500"/></div><p className="mt-3 text-center text-[10px] font-bold uppercase text-zinc-400">{month.label}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-5 border-t border-zinc-100 pt-4 text-xs text-zinc-500"><Legend tone="bg-zinc-950" text="Requirements"/><Legend tone="bg-violet-500" text="Candidates"/><Legend tone="bg-emerald-500" text="Placements"/></div></section><div className="grid gap-6 xl:grid-cols-3"><Breakdown title="Candidate pipeline" items={pipeline}/><Breakdown title="Hiring by industry" items={industries}/><Breakdown title="Recruiter contribution" items={recruiterCandidates} icon/></div><section className="rounded-[2rem] bg-gradient-to-br from-zinc-950 to-zinc-800 p-8 text-white"><div className="flex items-center gap-3"><Trophy className="text-amber-300"/><h2 className="text-2xl font-bold">Executive snapshot</h2></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Insight label="Requirement fill rate" value={percent(filledRequirementIds.size,reqs.length)}/><Insight label="Interview-to-offer" value={percent(offered,interviewed)}/><Insight label="Offer-to-join" value={percent(joined,offered)}/></div></section></div>;
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}
function percent(value:number,total:number){return total?`${Math.round(value/total*100)}%`:"0%"}
function sortedCounts(values:string[]){return Object.entries(groupCounts(values)).sort((a,b)=>b[1]-a[1])}
function groupCounts(values:string[]){return values.reduce<Record<string,number>>((result,value)=>{const label=value||"Unspecified";result[label]=(result[label]??0)+1;return result},{})}
function monthKey(value:string){const date=new Date(value);return `${date.getFullYear()}-${date.getMonth()}`}
function lastMonths(count:number){return Array.from({length:count},(_,index)=>{const date=new Date();date.setDate(1);date.setMonth(date.getMonth()-(count-1-index));return{key:`${date.getFullYear()}-${date.getMonth()}`,label:date.toLocaleDateString("en-IN",{month:"short"})}})}
function TrendBar({value,max,tone}:{value:number;max:number;tone:string}){return <div title={String(value)} className={`w-3 rounded-t-full ${tone}`} style={{height:`${Math.max(value?10:2,value/max*100)}%`}}/>}
function Legend({tone,text}:{tone:string;text:string}){return <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${tone}`}/>{text}</span>}
function Breakdown({title,items,icon=false}:{title:string;items:Record<string,number>|[string,number][];icon?:boolean}){const rows=Array.isArray(items)?items:Object.entries(items).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...rows.map(([,value])=>value));return <section className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-xl font-bold">{title}</h2><div className="mt-6 space-y-4">{rows.length?rows.map(([label,value])=><div key={label}><div className="flex justify-between gap-3 text-xs"><span className="truncate font-semibold capitalize">{icon&&"• "}{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-zinc-950" style={{width:`${value/max*100}%`}}/></div></div>):<p className="text-sm text-zinc-500">No data yet.</p>}</div></section>}
function Insight({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>}
