"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRequirement } from "@/actions/requirements";

type Requirement = {
  id: string;
  job_title: string;
  department: string | null;
  location: string | null;
  experience: string | null;
  vacancies: number;
  status: string;
  priority: string;
  created_at: string;
  is_public?: boolean | null;
  hiring_team_requested?: boolean | null;
  candidate_count?: number;
  jobiverse_candidate_count?: number;
  latest_candidate_status?: string | null;
  candidate_status_counts?: { stage: string; count: number }[];
};

export default function RequirementsTable({
  requirements,
}: {
  requirements: Requirement[];
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this requirement?"
    );

    if (!confirmDelete) return;

    try {
      await deleteRequirement(id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete requirement");
    }
  }

  if (!requirements.length) {
    return (
      <div className="rounded-3xl border bg-white p-12 text-center">
        <h2 className="text-xl font-semibold">
          No requirements yet
        </h2>

        <p className="mt-2 text-zinc-500">
          Create your first hiring requirement.
        </p>

        <Link
          href="/employers/requirements/new"
          className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-white"
        >
          Create Requirement
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead className="border-b bg-zinc-50">
            <tr>
              <th className="px-6 py-4">Position</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Experience</th>
              <th className="px-6 py-4">Vacancies</th>
              <th className="px-6 py-4">Candidates</th>
              <th className="px-6 py-4">Candidate status</th>
              <th className="px-6 py-4">Requirement status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {requirements.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-none"
              >
                <td className="px-6 py-5">
                  <p className="font-semibold">
                    {item.job_title}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {item.department || "General"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.is_public ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {item.is_public ? "Jobs portal live" : "Private"}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.hiring_team_requested ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {item.hiring_team_requested ? "JobiVerse team" : "Self managed"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  {item.location || "-"}
                </td>

                <td className="px-6 py-5">
                  {item.experience || "-"}
                </td>

                <td className="px-6 py-5">
                  {item.vacancies}
                </td>

                <td className="px-6 py-5">
                  <Link href={`/employers/candidates?requirement=${item.id}`} className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md">
                    {item.candidate_count ?? 0} submitted
                  </Link>
                  {!!item.jobiverse_candidate_count && (
                    <Link href={`/employers/candidates?source=jobiverse&requirement=${item.id}`} className="mt-2 block rounded-full bg-amber-50 px-3 py-1 text-center text-[10px] font-bold uppercase text-amber-700">
                      {item.jobiverse_candidate_count} by JobiVerse
                    </Link>
                  )}
                </td>

                <td className="px-6 py-5">
                  <div className="flex max-w-xs flex-wrap gap-2">
                    {item.candidate_status_counts?.length ? item.candidate_status_counts.map((status) => (
                      <Link key={status.stage} href={`/employers/candidates?requirement=${item.id}&status=${encodeURIComponent(status.stage)}`} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                        {status.stage}: {status.count}
                      </Link>
                    )) : (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">No candidates</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <Link href={`/employers/requirements/${item.id}`} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200">
                    {item.status}
                  </Link>
                </td>

                <td className="px-6 py-5">
                  {item.priority}
                </td>

                <td className="px-6 py-5">
                  <div className="flex gap-3">

                    <Link
                      href={`/employers/requirements/${item.id}`}
                      className="text-blue-600"
                    >
                      View
                    </Link>

                    <Link
                      href={`/employers/requirements/${item.id}/edit`}
                      className="text-purple-600"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
