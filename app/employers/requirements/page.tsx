import Link from "next/link";
import { getRequirements } from "@/actions/requirements";
import RequirementsTable from "@/components/employer/requirements/RequirementsTable";

export default async function RequirementsPage() {
  const requirements = await getRequirements();

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

      <RequirementsTable
        requirements={requirements ?? []}
      />
      </div>
    </main>
  );
}
