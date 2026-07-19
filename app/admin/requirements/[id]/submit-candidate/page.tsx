import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, BriefcaseBusiness, ShieldCheck } from "lucide-react";

import CandidateForm from "@/components/recruiter/candidate/CandidateForm";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function AdminSubmitCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  const { data: requirement } = await adminSupabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!requirement) notFound();

  const { data: company } = await adminSupabase
    .from("companies")
    .select("company_name, location")
    .eq("id", requirement.company_id)
    .maybeSingle();

  return (
    <main className="space-y-8">
      <Link href={`/admin/requirements/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-black">
        <ArrowLeft size={16} />
        Back to requirement
      </Link>

      <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">JobiVerse Hiring Team</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Submit candidate to employer.</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">
          This profile will be shared with the employer as a JobiVerse-submitted candidate and will appear in their Submitted Candidates workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Summary icon={<Building2 size={18} />} label="Company" value={company?.company_name ?? "Company unavailable"} />
        <Summary icon={<BriefcaseBusiness size={18} />} label="Role" value={requirement.job_title ?? "Requirement"} />
        <Summary icon={<ShieldCheck size={18} />} label="Visibility" value="Employer visible after submission" />
      </section>

      <CandidateForm requirement={requirement} />
    </main>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </article>
  );
}
