import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, ShieldCheck, Users } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { firstRelation } from "@/lib/relations";

export default async function AdminProtectionAuditPage() {
  await requireRole(["admin"]);

  const { data: introductions, error } = await adminSupabase
    .from("talent_introductions")
    .select("id,employer_id,requirement_id,candidate_id,application_id,source,commercial_terms,protection_starts_at,protection_ends_at,hiring_status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  const requirementIds = [...new Set((introductions ?? []).map((item) => item.requirement_id).filter(Boolean))];
  const candidateIds = [...new Set((introductions ?? []).map((item) => item.candidate_id).filter(Boolean))];
  const applicationIds = [...new Set((introductions ?? []).map((item) => item.application_id).filter(Boolean))];

  const [requirementsResult, candidatesResult, applicationsResult] = await Promise.all([
    requirementIds.length
      ? adminSupabase.from("requirements").select("id,job_title,status,companies(company_name)").in("id", requirementIds)
      : Promise.resolve({ data: [] as any[] }),
    candidateIds.length
      ? adminSupabase.from("candidates").select("id,full_name,email,status,recruiter_name,recruiter_email").in("id", candidateIds)
      : Promise.resolve({ data: [] as any[] }),
    applicationIds.length
      ? adminSupabase.from("candidate_applications").select("id,applicant_name,applicant_email,status").in("id", applicationIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const requirementMap = new Map((requirementsResult.data ?? []).map((item: any) => [item.id, item]));
  const candidateMap = new Map((candidatesResult.data ?? []).map((item: any) => [item.id, item]));
  const applicationMap = new Map((applicationsResult.data ?? []).map((item: any) => [item.id, item]));

  const jobiverseCount = (introductions ?? []).filter((item) => item.source === "jobiverse_hiring_team").length;
  const portalCount = (introductions ?? []).filter((item) => item.source === "jobs_portal").length;
  const activeCount = (introductions ?? []).filter((item) => new Date(item.protection_ends_at).getTime() >= Date.now()).length;

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.15),transparent_20rem),linear-gradient(135deg,#09090b,#18181b_55%,#3f3f46)] p-8 text-white shadow-2xl sm:p-12">
          <ShieldCheck className="text-zinc-300" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">JobiVerse legal protection layer</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Protection Audit.</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">Track every candidate introduction, source, commercial term and protection window so direct hiring leakage stays visible.</p>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <Metric title="Active protection records" value={activeCount} icon={ShieldCheck} />
          <Metric title="JobiVerse submissions" value={jobiverseCount} icon={Users} />
          <Metric title="Jobs portal applicants" value={portalCount} icon={BriefcaseBusiness} />
        </section>

        <section className="mt-7 rounded-[2rem] border bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Audit trail</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Introductions under watch</h2>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1100px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-[.14em] text-zinc-400">
                <tr>
                  <th className="px-4">Candidate</th>
                  <th className="px-4">Company / role</th>
                  <th className="px-4">Source</th>
                  <th className="px-4">Hiring status</th>
                  <th className="px-4">Protection until</th>
                  <th className="px-4">Terms</th>
                  <th className="px-4">Open</th>
                </tr>
              </thead>
              <tbody>
                {(introductions ?? []).map((intro) => {
                  const requirement = requirementMap.get(intro.requirement_id);
                  const company = firstRelation(requirement?.companies);
                  const candidate = intro.candidate_id ? candidateMap.get(intro.candidate_id) : null;
                  const application = intro.application_id ? applicationMap.get(intro.application_id) : null;
                  const name = candidate?.full_name ?? application?.applicant_name ?? "Candidate";
                  const email = candidate?.email ?? application?.applicant_email;
                  const status = candidate?.status ?? application?.status ?? intro.hiring_status;
                  const href = intro.candidate_id ? `/admin/candidates?candidate=${intro.candidate_id}` : `/admin/candidates?source=external&application=${intro.application_id}`;
                  const active = new Date(intro.protection_ends_at).getTime() >= Date.now();

                  return (
                    <tr key={intro.id} className="rounded-2xl bg-zinc-50 align-top">
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="font-semibold text-zinc-950">{name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{email ?? "No email"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{requirement?.job_title ?? "Requirement"}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500"><Building2 size={12} /> {company?.company_name ?? "Company"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${intro.source === "jobiverse_hiring_team" ? "bg-zinc-950 text-white" : "bg-violet-100 text-violet-700"}`}>
                          {intro.source === "jobiverse_hiring_team" ? "JobiVerse" : "Jobs Portal"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-zinc-700">{String(status).replaceAll("_", " ")}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`font-semibold ${active ? "text-emerald-700" : "text-red-600"}`}>{new Date(intro.protection_ends_at).toLocaleDateString("en-IN")}</p>
                        <p className="mt-1 text-xs text-zinc-500">Started {new Date(intro.protection_starts_at).toLocaleDateString("en-IN")}</p>
                      </td>
                      <td className="max-w-xs px-4 py-4 text-xs leading-5 text-zinc-600">{intro.commercial_terms}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm">Open <ArrowRight size={13} /></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: typeof ShieldCheck }) {
  return (
    <article className="rounded-[2rem] border bg-white p-7 shadow-sm">
      <Icon className="text-zinc-400" />
      <p className="mt-5 text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}
