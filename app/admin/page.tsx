import {
  BriefcaseBusiness,
  Building2,
  Users,
  UserCog,
  ArrowUpRight,
} from "lucide-react";

import { getDashboardData } from "@/actions/admin";

export default async function AdminDashboardPage() {
  const { stats, latestRequirements } = await getDashboardData();

  const dashboardStats = [
    {
      title: "Requirements",
      value: stats.requirements,
      icon: BriefcaseBusiness,
    },
    {
      title: "Companies",
      value: stats.companies,
      icon: Building2,
    },
    {
      title: "Candidates",
      value: stats.candidates,
      icon: Users,
    },
    {
      title: "Recruiters",
      value: stats.recruiters,
      icon: UserCog,
    },
  ];

  return (
    <div className="space-y-10">

      {/* Header */}

      <section>

        <p className="text-zinc-500">
          Welcome back 👋
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Recruitment Dashboard
        </h1>

        <p className="mt-3 text-zinc-600">
          Monitor hiring activities across JobiVerse.
        </p>

      </section>

      {/* Stats */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {dashboardStats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-7
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-xl
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-black
                  text-white
                  "
                >
                  <Icon className="h-7 w-7" />
                </div>

                <ArrowUpRight className="text-zinc-400" />

              </div>

              <h3 className="mt-8 text-4xl font-bold">
                {item.value}
              </h3>

              <p className="mt-2 text-zinc-500">
                {item.title}
              </p>

            </div>

          );

        })}

      </section>

      {/* Latest Requirements */}

      <section
        className="
        rounded-3xl
        border
        border-zinc-200
        bg-white
        p-8
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Latest Hiring Requirements
            </h2>

            <p className="mt-2 text-zinc-500">
              Live data from Supabase
            </p>

          </div>

        </div>

        <div className="mt-8 overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-zinc-200">

                <th className="py-4 text-left font-semibold">
                  Company
                </th>

                <th className="py-4 text-left font-semibold">
                  Position
                </th>

                <th className="py-4 text-left font-semibold">
                  Location
                </th>

                <th className="py-4 text-left font-semibold">
                  Status
                </th>

                <th className="py-4 text-left font-semibold">
                  Created
                </th>

              </tr>

            </thead>

            <tbody>

                            {latestRequirements.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="
                    py-12
                    text-center
                    text-zinc-500
                    "
                  >
                    No hiring requirements found.
                  </td>

                </tr>

              ) : (

                latestRequirements.map((item: any) => (

                  <tr
                    key={item.id}
                    className="
                    border-b
                    border-zinc-100
                    transition
                    hover:bg-zinc-50
                    "
                  >

                    <td className="py-6 font-semibold">
                      {item.companies?.company_name ?? "-"}
                    </td>

                    <td>
                      {item.job_title}
                    </td>

                    <td>
                      {item.companies?.location ?? "-"}
                    </td>

                    <td>

                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-sm
                          font-medium

                          ${
                            item.status === "New"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Assigned"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "Closed"
                              ? "bg-red-100 text-red-700"
                              : "bg-zinc-100 text-zinc-700"
                          }
                        `}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="text-zinc-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>

  );

}