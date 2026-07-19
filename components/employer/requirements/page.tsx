import Link from "next/link";
import { getRequirements } from "@/actions/requirements";
import RequirementsTable from "@/components/employer/requirements/RequirementsTable";

export default async function RequirementsPage() {
  const requirements = await getRequirements();

  return (
    <main className="mx-auto max-w-7xl p-8">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Requirements
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage all your hiring requirements.
          </p>
        </div>

        <Link
          href="/employers/requirements/new"
          className="rounded-xl bg-black px-6 py-3 text-white"
        >
          + New Requirement
        </Link>

      </div>


      <RequirementsTable
        requirements={requirements ?? []}
      />

    </main>
  );
}