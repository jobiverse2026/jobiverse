"use client";

import { motion } from "framer-motion";
import { Briefcase, UserPlus } from "lucide-react";

type Requirement = { id: string; job_title: string; created_at: string };
type Candidate = { id: string; full_name: string; status: string; created_at: string };

export default function ActivityFeed({ requirements, candidates }: { requirements: Requirement[]; candidates: Candidate[] }) {
  const activities = [
    ...requirements.map((item) => ({ id: `requirement-${item.id}`, icon: Briefcase, title: `Requirement created: ${item.job_title}`, createdAt: item.created_at })),
    ...candidates.map((item) => ({ id: `candidate-${item.id}`, icon: UserPlus, title: `${item.full_name} | ${item.status}`, createdAt: item.created_at })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-6 text-xl font-semibold">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {!activities.length ? <p className="text-zinc-500">No recent activity yet.</p> : activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Icon size={20} />
              </div>

              <div>
                <h4 className="font-medium">
                  {activity.title}
                </h4>

                <p className="text-sm text-zinc-500">
                  {new Date(activity.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}




