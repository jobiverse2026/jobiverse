import Link from "next/link";
import { getRequirements } from "@/actions/requirements";
import RequirementsTable from "@/components/employer/requirements/RequirementsTable";

export default async function RequirementsPage() {
  const requirements = await getRequirements();
  const rows = (requirements ?? []) as any[];
  const active = rows.filter((item:any) => !["closed", "cancelled"].includes(String(item.status ?? "").toLowerCase())).length;
  const published = rows.filter((item:any) => item.is_public).length;
  const jobiverseAssigned = rows.filter((item:any) => item.hiring_team_requested).length;

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-5 rounded-[2rem] bg-zinc-950 p-7 text-white sm:flex-row sm:items-center sm:p-9">

        <div>
          <h1 className="text-3xl font-bold">
            Requirements
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage all your hiring requirements.
          </p>
        </div>

        <Link
          href="/employers/requirements/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-zinc-950"
        >
          + New Requirement
        </Link>

      </div>

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        <Metric label="Total requirements" value={rows.length} />
        <Metric label="Active" value={active} />
        <Metric label="Jobs portal live" value={published} />
        <Metric label="Assigned to JobiVerse" value={jobiverseAssigned} />
      </section>

      <section className="mb-8 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Free employer hiring</p>
        <h2 className="mt-2 text-2xl font-semibold">Job posting costs ₹0. A 3% success fee applies only after a direct applicant joins.</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Open any requirement to manage Jobs Portal visibility, review direct applicants, schedule interviews and track hiring. JobiVerse managed sourcing is an optional separate channel.</p>
      </section>

      <RequirementsTable
        requirements={rows}
      />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-4xl font-bold">{value}</p></article>;
}
