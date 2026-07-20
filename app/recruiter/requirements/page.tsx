import Link from "next/link";
import { Eye } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function RecruiterRequirementsPage() {
  const { user } = await requireRole(["recruiter"]);

  const { data: assignments } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("requirement_id")
    .eq("recruiter_id", user.id);

  const assignedIds = [...new Set((assignments ?? []).map((item: any) => item.requirement_id).filter(Boolean))];
  const { data: directRequirements } = await adminSupabase
    .from("requirements")
    .select("*")
    .eq("assigned_recruiter", user.id)
    .order("created_at", { ascending: false });
  const directIds = new Set((directRequirements ?? []).map((item: any) => item.id));
  const extraIds = assignedIds.filter((id) => !directIds.has(id));
  const { data: extraRequirements } = extraIds.length
    ? await adminSupabase.from("requirements").select("*").in("id", extraIds)
    : { data: [] };
  const requirements = [...(directRequirements ?? []), ...(extraRequirements ?? [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            My Requirements
          </h1>

          <p className="mt-2 text-zinc-500">
            Jobs assigned to you.
          </p>

        </div>

        <div
          className="
          rounded-2xl
          bg-black
          px-6
          py-4
          text-center
          text-white
          "
        >

          <p className="text-sm text-zinc-300">
            Assigned Jobs
          </p>

          <p className="mt-1 text-3xl font-bold">
            {requirements?.length ?? 0}
          </p>

        </div>

      </div>

      {/* Search */}

      <input
        placeholder="Search Requirement..."
        className="
        w-full
        rounded-2xl
        border
        border-zinc-300
        bg-white
        px-5
        py-4
        outline-none
        focus:border-black
        "
      />

      {/* Table */}

      <div
        className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-200
        bg-white
        "
      >

        <table className="w-full">

          <thead className="bg-zinc-100">

            <tr>

              <th className="px-6 py-4 text-left">
                Position
              </th>

              <th className="px-6 py-4 text-left">
                Department
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-left">
                Created
              </th>

              <th className="px-6 py-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {requirements?.length ? (

              requirements.map((job) => (

                <tr
                  key={job.id}
                  className="border-t"
                >

                  <td className="px-6 py-5">

                    <div>

                      <p className="font-semibold">
                        {job.job_title}
                      </p>

                      <p className="text-sm text-zinc-500">
                        {job.work_mode}
                      </p>

                    </div>

                  </td>

                  <td className="px-6 py-5">
                    {job.department}
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold

                        ${
                          job.status === "New"
                            ? "bg-green-100 text-green-700"
                            : job.status === "Assigned"
                            ? "bg-blue-100 text-blue-700"
                            : job.status === "Interview"
                            ? "bg-yellow-100 text-yellow-700"
                            : job.status === "Closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-zinc-100 text-zinc-700"
                        }
                      `}
                    >
                      {job.status}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    {new Date(
                      job.created_at
                    ).toLocaleDateString()}

                  </td>

                  <td className="px-6 py-5 text-center">

                    <Link
                      href={`/recruiter/requirements/${job.id}`}
                      className="
                      inline-flex
                      items-center
                      rounded-xl
                      border
                      border-zinc-300
                      px-4
                      py-2
                      text-sm
                      transition
                      hover:bg-black
                      hover:text-white
                      "
                    >

                      <Eye className="mr-2 h-4 w-4" />

                      View

                    </Link>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="
                  py-20
                  text-center
                  text-zinc-500
                  "
                >

                  No Requirements Assigned.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
