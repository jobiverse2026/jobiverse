import Link from "next/link";
import { ArrowUpRight, BadgeIndianRupee, BriefcaseBusiness, Building2, CheckCircle2, UserRoundSearch } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import FeeStatusControls from "./FeeStatusControls";

export const dynamic = "force-dynamic";

const tabs = [
  ["overview", "Overview"],
  ["employers", "Free Employers"],
  ["jobs", "Published Jobs"],
  ["applications", "Direct Applicants"],
  ["fees", "3% Success Fees"],
] as const;
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

function one<T>(value: T | T[] | null | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function FreeHiringAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireRole(["admin"]);
  const requestedTab = (await searchParams).tab ?? "overview";
  const tab = tabs.some(([key]) => key === requestedTab) ? requestedTab : "overview";

  const [companyResult, jobResult, applicationResult] = await Promise.all([
    adminSupabase.from("companies").select("id,owner_id,company_name,industry,city,state,is_verified,created_at").order("created_at", { ascending: false }),
    adminSupabase.from("requirements").select("id,company_id,employer_id,job_title,status,vacancies,location,work_mode,is_public,published_at,created_at,companies(company_name)").eq("is_public", true).order("published_at", { ascending: false }),
    adminSupabase.from("candidate_applications").select("id,requirement_id,applicant_name,applicant_email,status,applied_at,hired_annual_ctc,joining_date,success_fee_percentage,success_fee_amount,success_fee_status,requirements(job_title,employer_id,companies(company_name))").order("applied_at", { ascending: false }),
  ]);
  if (companyResult.error) throw new Error(companyResult.error.message);
  if (jobResult.error) throw new Error(jobResult.error.message);
  if (applicationResult.error) throw new Error(applicationResult.error.message);

  const companies = companyResult.data ?? [];
  const jobs = jobResult.data ?? [];
  const applications = applicationResult.data ?? [];
  const ownerIds = companies.map((company) => company.owner_id).filter(Boolean);
  const { data: owners } = ownerIds.length ? await adminSupabase.from("users").select("id,full_name,email,created_at").in("id", ownerIds) : { data: [] } as any;
  const ownerMap = new Map((owners ?? []).map((owner: any) => [owner.id, owner]));
  const applicationsByRequirement = new Map<string, number>();
  applications.forEach((application: any) => applicationsByRequirement.set(application.requirement_id, (applicationsByRequirement.get(application.requirement_id) ?? 0) + 1));
  const feeRows = applications.filter((application: any) => application.success_fee_status !== "not_due" || application.status === "Hired");
  const feesDue = feeRows.filter((application: any) => ["due", "invoiced"].includes(application.success_fee_status));
  const dueAmount = feesDue.reduce((sum: number, application: any) => sum + Number(application.success_fee_amount ?? 0), 0);

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-800 p-8 text-white shadow-2xl sm:p-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-emerald-300/15" />
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Free hiring command centre</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Free job supply. Revenue after successful hiring.</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">Monitor public employer workspaces, free job listings, direct candidates and the one-time 3% annual-CTC success fee that becomes due only after joining.</p>
    </section>

    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">{tabs.map(([key, label]) => <Link key={key} href={`/admin/free-hiring?tab=${key}`} className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold ${tab === key ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{label}</Link>)}</nav>

    {(tab === "overview" || tab === "employers") && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Building2} label="Employer workspaces" value={companies.length} note="Company profiles created" />
      <Metric icon={BriefcaseBusiness} label="Free jobs live" value={jobs.length} note="Published to talent" />
      <Metric icon={UserRoundSearch} label="Direct applicants" value={applications.length} note="Jobs Portal applications" />
      <Metric icon={BadgeIndianRupee} label="Fee due / invoiced" value={money.format(dueAmount)} note={`${feesDue.length} successful direct hires`} />
    </section>}

    {tab === "overview" && <section className="grid gap-5 lg:grid-cols-3">
      <Summary title="Free employer journey" items={["Employer signs up and creates company profile", "Job is published for ₹0 upfront", "Talent applies directly", "Employer tracks interview and offer", "3% fee is recorded only after joining"]} />
      <Summary title="Included free" items={["Company workspace", "Public job posting", "Direct applicant pipeline", "Interview scheduling", "Hiring status tracking"]} />
      <Summary title="Paid separately" items={["Talent Search access", "Employer and recruiter seats", "Premium hiring services", "Managed JobiVerse sourcing", "Featured and marketplace services"]} />
    </section>}

    {tab === "employers" && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{companies.map((company: any) => { const owner: any = ownerMap.get(company.owner_id); return <article key={company.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Building2 /></span><span className={`rounded-full px-3 py-1 text-xs font-bold ${company.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{company.is_verified ? "Verified" : "Free workspace"}</span></div><h2 className="mt-5 text-xl font-semibold">{company.company_name}</h2><p className="mt-2 text-sm text-zinc-500">{owner?.full_name || "Employer"} · {owner?.email || "Email unavailable"}</p><p className="mt-1 text-sm text-zinc-500">{[company.industry, company.city, company.state].filter(Boolean).join(" · ") || "Company details pending"}</p><Link href="/admin/companies" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Open company control <ArrowUpRight size={15} /></Link></article>; })}</section>}

    {tab === "jobs" && <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-zinc-950 text-white"><tr><Th>Role</Th><Th>Company</Th><Th>Status</Th><Th>Vacancies</Th><Th>Direct applicants</Th><Th>Published</Th><Th>Action</Th></tr></thead><tbody>{jobs.map((job: any) => <tr key={job.id} className="border-t border-zinc-100"><Td><strong>{job.job_title}</strong><p className="mt-1 text-xs text-zinc-500">{[job.location, job.work_mode].filter(Boolean).join(" · ")}</p></Td><Td>{one<any>(job.companies)?.company_name || "Company"}</Td><Td><Status value={job.status} /></Td><Td>{job.vacancies ?? 1}</Td><Td>{applicationsByRequirement.get(job.id) ?? 0}</Td><Td>{job.published_at ? date.format(new Date(job.published_at)) : "-"}</Td><Td><Link href={`/candidates/jobs/${job.id}`} target="_blank" className="font-bold underline">View live</Link></Td></tr>)}</tbody></table></div></section>}

    {tab === "applications" && <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-zinc-950 text-white"><tr><Th>Applicant</Th><Th>Role</Th><Th>Company</Th><Th>Status</Th><Th>Applied</Th><Th>Action</Th></tr></thead><tbody>{applications.map((application: any) => { const requirement = one<any>(application.requirements); return <tr key={application.id} className="border-t border-zinc-100"><Td><strong>{application.applicant_name || "Applicant"}</strong><p className="mt-1 text-xs text-zinc-500">{application.applicant_email}</p></Td><Td>{requirement?.job_title || "Role"}</Td><Td>{one<any>(requirement?.companies)?.company_name || "Company"}</Td><Td><Status value={application.status} /></Td><Td>{date.format(new Date(application.applied_at))}</Td><Td><Link href={`/admin/candidates?source=external&q=${encodeURIComponent(application.applicant_email || application.applicant_name || "")}`} className="font-bold underline">Open candidate</Link></Td></tr>; })}</tbody></table></div></section>}

    {tab === "fees" && <section className="space-y-4">{feeRows.length ? feeRows.map((application: any) => { const requirement = one<any>(application.requirements); return <article key={application.id} className="grid gap-5 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold">{application.applicant_name || "Direct hire"}</h2><Status value={application.success_fee_status} /></div><p className="mt-2 text-sm text-zinc-500">{requirement?.job_title || "Role"} · {one<any>(requirement?.companies)?.company_name || "Company"}</p><div className="mt-4 flex flex-wrap gap-3 text-sm"><strong>Annual CTC: {application.hired_annual_ctc ? money.format(application.hired_annual_ctc) : "Pending"}</strong><strong>JobiVerse fee: {application.success_fee_amount ? money.format(application.success_fee_amount) : "3% after CTC confirmation"}</strong><span>Joining: {application.joining_date ? date.format(new Date(`${application.joining_date}T00:00:00`)) : "Pending"}</span></div></div><FeeStatusControls applicationId={application.id} currentStatus={application.success_fee_status} /></article>; }) : <Empty text="No successful direct-hire fees recorded yet." />}</section>}
  </div>;
}

function Metric({ icon: Icon, label, value, note }: { icon: any; label: string; value: string | number; note: string }) { return <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={20} /></span><CheckCircle2 className="text-emerald-600" size={18} /></div><p className="mt-5 text-3xl font-bold">{value}</p><h2 className="mt-2 font-semibold">{label}</h2><p className="mt-1 text-xs text-zinc-500">{note}</p></article>; }
function Summary({ title, items }: { title: string; items: string[] }) { return <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.map((item) => <p key={item} className="flex gap-3 text-sm leading-6 text-zinc-600"><CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={15} />{item}</p>)}</div></article>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="px-5 py-4 text-xs uppercase tracking-wider">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-5 py-4 align-top">{children}</td>; }
function Status({ value }: { value: string }) { const positive = ["Hired", "paid"].includes(value); return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${positive ? "bg-emerald-100 text-emerald-700" : value === "waived" ? "bg-zinc-100 text-zinc-600" : "bg-amber-100 text-amber-700"}`}>{String(value).replaceAll("_", " ")}</span>; }
function Empty({ text }: { text: string }) { return <p className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">{text}</p>; }
