import Link from "next/link";
import { ArrowLeft, Bookmark, BriefcaseBusiness, CalendarDays, ExternalLink, Globe2, MapPin, Sparkles } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { SaveJobButton } from "@/components/candidate/SaveJobButton";
import { applicationHealth, jobiverseApplicationFeedback } from "@/lib/candidate/intelligence";
import { CareerServiceNudge } from "@/components/candidate/CareerServiceNudge";
import { updateTrackedApplication } from "@/app/jobs/track/actions";
import { ApplicationFollowUpAssistant } from "@/components/candidate/application-follow-up-assistant";
import { ApplicationWithdrawal } from "@/components/candidate/application-withdrawal";

type SearchParams = Promise<{ tracked?: string; updated?: string }>;

export default async function CandidateCareerActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const { supabase, user } = await requireRole(["candidate"]);
  const [{ data: applications }, { data: savedJobs }, trackedResult] = await Promise.all([
    supabase
      .from("candidate_applications")
      .select("id,status,applied_at,updated_at,requirement_id,requirements(job_title,location,work_mode,status,companies(company_name))")
      .eq("candidate_user_id", user.id)
      .order("applied_at", { ascending: false }),
    supabase
      .from("candidate_saved_jobs")
      .select("id,requirement_id,created_at,requirements(job_title,location,work_mode,status,is_public,companies(company_name))")
      .eq("candidate_user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("candidate_tracked_applications").select("id,provider,job_title,company_name,location,apply_url,status,applied_at,updated_at,notes").eq("candidate_user_id", user.id).order("updated_at", { ascending: false }),
  ]);
  const trackerUnavailable = trackedResult.error && ["42P01", "PGRST205"].includes(trackedResult.error.code);
  const trackedApplications = trackerUnavailable ? [] : trackedResult.data ?? [];
  if (trackedResult.error && !trackerUnavailable) throw new Error(trackedResult.error.message);
  const totalApplications = (applications?.length ?? 0) + trackedApplications.length;
  const boardItems = [
    ...(applications ?? []).map((application) => {
      const job = Array.isArray(application.requirements) ? application.requirements[0] : application.requirements;
      return { id: application.id, title: job?.job_title ?? "Opportunity", company: job?.companies?.[0]?.company_name ?? "Company", status: application.status };
    }),
    ...trackedApplications.map((application) => ({ id: application.id, title: application.job_title, company: application.company_name || application.provider || "Partner role", status: application.status })),
  ];
  const pipeline = applicationPipeline(boardItems);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/candidates/dashboard" className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm">
          <ArrowLeft size={16} />Dashboard
        </Link>
        {query.tracked === "1" && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">Application added to your career activity.</div>}
        {query.updated === "1" && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">Application stage updated successfully.</div>}
        <section className="relative my-8 overflow-hidden rounded-[2.5rem] bg-zinc-950 p-9 text-white sm:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <BriefcaseBusiness />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Application health tracker</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Career activity.</h1>
          <p className="mt-4 text-zinc-300">Track JobiVerse applications and opportunities applied on partner websites in one private career timeline.</p>
        </section>

        <section className="mb-7 rounded-[2rem] border border-zinc-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">Application tracker board</p><h2 className="mt-2 text-2xl font-bold">Every opportunity, one clear next step.</h2></div><Link href="/jobs" className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white">Explore jobs</Link></div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {pipeline.map((column) => <div key={column.label} className={`rounded-2xl border p-4 ${column.tone}`}><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wider">{column.label}</p><span className="grid h-7 min-w-7 place-items-center rounded-full bg-white/80 px-2 text-xs font-bold">{column.items.length}</span></div><div className="mt-4 space-y-2">{column.items.slice(0,3).map((item) => <div key={`${column.label}-${item.id}`} className="rounded-xl bg-white/80 p-3"><p className="line-clamp-1 text-xs font-bold">{item.title}</p><p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">{item.company}</p></div>)}{!column.items.length && <p className="py-4 text-center text-xs text-zinc-400">No activity yet</p>}{column.items.length > 3 && <p className="text-center text-[11px] font-semibold text-zinc-500">+{column.items.length - 3} more</p>}</div></div>)}
          </div>
        </section>

        <div className="grid gap-7 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Application history</p>
                <h2 className="mt-2 text-2xl font-bold">{totalApplications} applications</h2>
              </div>
              <BriefcaseBusiness className="text-zinc-400" />
            </div>
            <div className="mt-6 space-y-3">
              {applications?.length ? applications.map((application) => {
                const job = Array.isArray(application.requirements) ? application.requirements[0] : application.requirements;
                const health = applicationHealth(application.status);
                const feedback = jobiverseApplicationFeedback(application.status, job?.job_title);
                return (
                  <article key={application.id} className="rounded-2xl bg-zinc-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">{job?.companies?.[0]?.company_name ?? "Confidential company"}</p>
                        <h3 className="mt-1 font-bold">{job?.job_title ?? "Opportunity"}</h3>
                      </div>
                      <Status status={application.status} />
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <MapPin size={13} />{job?.location ?? "India"} | {job?.work_mode ?? "Flexible"}
                    </p>
                    <ApplicationTracker stages={health.stages} activeIndex={health.activeIndex} closed={health.closed} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/hiring/applications/${application.id}`} className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white">Messages & offer</Link>
                      <Link href={`/candidates/interview-prep?application=${application.id}`} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800">Prepare for interview</Link>
                    </div>
                    <JobiVerseFeedback feedback={feedback} />
                    <ApplicationFollowUpAssistant jobTitle={job?.job_title ?? "Opportunity"} company={job?.companies?.[0]?.company_name ?? "the company"} appliedAt={application.applied_at} status={application.status} />
                    {!/withdraw|reject|hired|joined|accept/i.test(application.status)&&<ApplicationWithdrawal applicationId={application.id}/>}
                    <CareerServiceNudge type={nudgeTypeForStatus(application.status)} compact />
                    <p className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                      <CalendarDays size={12} />Applied {new Date(application.applied_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  </article>
                );
              }) : null}
              {trackedApplications.map((application) => <article key={application.id} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-1 text-xs font-semibold text-violet-700"><Globe2 size={13}/>{application.provider || "Partner source"}</p><h3 className="mt-1 font-bold">{application.job_title}</h3><p className="mt-1 text-xs text-zinc-500">{application.company_name || "Company not disclosed"}</p></div><Status status={application.status}/></div>
                <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500"><MapPin size={13}/>{application.location || "Location not specified"}</p>
                <form action={updateTrackedApplication} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><input type="hidden" name="id" value={application.id}/><select name="status" defaultValue={application.status} className="h-11 rounded-xl border border-violet-200 bg-white px-3 text-sm"><option>Saved</option><option>Applied</option><option>Response awaited</option><option>Interview</option><option>Offer</option><option>Rejected</option><option>Withdrawn</option><option>Joined</option></select><button className="cursor-pointer rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white">Update stage</button></form>
                <CareerServiceNudge type={nudgeTypeForStatus(application.status)} compact />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4"><span className="text-[11px] text-zinc-400">Tracked {new Date(application.applied_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>{application.apply_url&&<a href={application.apply_url} target="_blank" rel="nofollow sponsored noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700">Original listing <ExternalLink size={12}/></a>}</div>
              </article>)}
              {!totalApplications && <Empty title="No applications yet" text="Explore direct and partner opportunities, then track every application here." />}
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Saved opportunities</p>
                <h2 className="mt-2 text-2xl font-bold">{savedJobs?.length ?? 0} saved jobs</h2>
              </div>
              <Bookmark className="text-zinc-400" />
            </div>
            <div className="mt-6 space-y-3">
              {savedJobs?.length ? savedJobs.map((saved) => {
                const job = Array.isArray(saved.requirements) ? saved.requirements[0] : saved.requirements;
                const available = Boolean(job?.is_public) && !["Closed", "Cancelled"].includes(job?.status ?? "");
                return (
                  <article key={saved.id} className="rounded-2xl bg-zinc-50 p-5">
                    <p className="text-xs text-zinc-500">{job?.companies?.[0]?.company_name ?? "Confidential company"}</p>
                    <h3 className="mt-1 font-bold">{job?.job_title ?? "Opportunity"}</h3>
                    <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <MapPin size={13} />{job?.location ?? "India"} | {job?.work_mode ?? "Flexible"}
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                      {available ? <Link href="/candidates/jobs" className="rounded-xl bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white">View & apply</Link> : <span className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">No longer accepting applications</span>}
                      <SaveJobButton requirementId={saved.requirement_id} saved />
                    </div>
                  </article>
                );
              }) : <Empty title="No saved jobs" text="Use Save job while browsing opportunities." />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Status({ status }: { status: string }) {
  const tone = status === "Offered" ? "bg-emerald-100 text-emerald-700" : status === "Rejected" ? "bg-red-100 text-red-700" : status === "Interview" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${status === "Interview" ? "jv-interview-urgent " : ""}${tone}`}>{status}</span>;
}

function Empty({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-zinc-500">{text}</p></div>;
}

function ApplicationTracker({ stages, activeIndex, closed }: { stages: string[]; activeIndex: number; closed: boolean }) {
  return <div className="mt-4"><div className="flex gap-1">{stages.map((stage, index) => <span key={stage} className={`h-1.5 flex-1 rounded-full ${closed ? "bg-red-200" : index <= activeIndex ? "bg-zinc-950" : "bg-zinc-200"}`} />)}</div><div className="mt-2 flex flex-wrap gap-2">{stages.map((stage, index) => <span key={stage} className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${closed ? "bg-red-50 text-red-600" : index === activeIndex ? "bg-zinc-950 text-white" : "bg-white text-zinc-400"}`}>{stage}</span>)}</div>{closed && <p className="mt-2 text-xs font-semibold text-red-600">This application is closed.</p>}</div>;
}

function JobiVerseFeedback({ feedback }: { feedback: ReturnType<typeof jobiverseApplicationFeedback> }) {
  const tone = feedback.tone === "red" ? "border-red-100 bg-red-50 text-red-700" : feedback.tone === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : feedback.tone === "violet" ? "border-violet-100 bg-violet-50 text-violet-700" : feedback.tone === "amber" ? "border-amber-100 bg-amber-50 text-amber-700" : "border-blue-100 bg-blue-50 text-blue-700";
  return (
    <div className={`mt-4 rounded-2xl border p-4 ${tone}`}>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em]"><Sparkles size={13} /> {feedback.title}</p>
      <p className="mt-2 text-sm leading-6">{feedback.message}</p>
      <p className="mt-2 text-xs font-semibold opacity-80">{feedback.action}</p>
    </div>
  );
}

function nudgeTypeForStatus(status: string) {
  const value = status.toLowerCase();
  if (value.includes("interview")) return "interview";
  if (value.includes("offer") || value.includes("selected") || value.includes("hired")) return "offer";
  if (value.includes("applied") || value.includes("review") || value.includes("submitted")) return "resume";
  return "apply";
}

type PipelineItem = { id: string; title: string; company: string; status: string };

function applicationPipeline(items: PipelineItem[]) {
  const groups = [
    { label: "Saved", match: (value: string) => value.includes("saved"), tone: "border-zinc-200 bg-zinc-50" },
    { label: "Applied", match: (value: string) => ["applied", "submitted", "review", "response", "screen"].some((stage) => value.includes(stage)), tone: "border-blue-100 bg-blue-50" },
    { label: "Interview", match: (value: string) => value.includes("interview"), tone: "border-violet-100 bg-violet-50" },
    { label: "Offer", match: (value: string) => ["offer", "selected", "joined", "hired"].some((stage) => value.includes(stage)), tone: "border-emerald-100 bg-emerald-50" },
    { label: "Closed", match: (value: string) => ["reject", "withdraw", "closed", "cancel"].some((stage) => value.includes(stage)), tone: "border-red-100 bg-red-50" },
  ];
  return groups.map((group) => ({ ...group, items: items.filter((item) => group.match(item.status.toLowerCase())) }));
}
