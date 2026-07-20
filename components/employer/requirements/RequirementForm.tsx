"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRequirement, updateRequirement } from "@/actions/requirements";
import { ArrowRight, BadgeCheck, FileText, Globe2, Target, UsersRound } from "lucide-react";

type RequirementFormProps = {
  mode?: "create" | "edit";
  requirementId?: string;
  initialValues?: Partial<{
    job_title: string;
    department: string | null;
    employment_type: string | null;
    work_mode: string | null;
    experience: string | null;
    vacancies: number | null;
    budget_ctc: string | null;
    location: string | null;
    notice_period: string | null;
    primary_skills: string | null;
    education: string | null;
    job_description: string | null;
    priority: string | null;
    hiring_team_requested: boolean | null;
    is_public: boolean | null;
  }>;
};

function normalizePriority(value?: string | null) {
  const lower = String(value ?? "Normal").toLowerCase();
  if (lower === "low") return "Low";
  if (lower === "high") return "High";
  if (lower === "urgent") return "Urgent";
  return "Normal";
}

export default function RequirementForm({ mode = "create", requirementId, initialValues }: RequirementFormProps) {
  const router = useRouter();
  const editing = mode === "edit";

  const [loading, setLoading] = useState(false);

const [form, setForm] = useState({
  job_title: initialValues?.job_title ?? "",

  department: initialValues?.department ?? "",

  employment_type: initialValues?.employment_type ?? "",

  work_mode: initialValues?.work_mode ?? "",

  experience: initialValues?.experience ?? "",

  vacancies: initialValues?.vacancies ?? 1,

  budget_ctc: initialValues?.budget_ctc ?? "",

  location: initialValues?.location ?? "",

  notice_period: initialValues?.notice_period ?? "",

  skills: initialValues?.primary_skills ?? "",

  education: initialValues?.education ?? "",

  job_description: initialValues?.job_description ?? "",

  priority: normalizePriority(initialValues?.priority),

  assign_to_jobiverse: Boolean(initialValues?.hiring_team_requested),

  publish_to_jobs: Boolean(initialValues?.is_public),
});

  function updateField(
    key: keyof typeof form,
    value: string | number | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      if (editing) {
        if (!requirementId) throw new Error("Requirement ID missing.");
        await updateRequirement(requirementId, form);
      } else {
        await createRequirement(form);
      }

      alert(editing ? "Requirement updated successfully." : "Requirement created successfully.");

      router.push(editing && requirementId ? `/employers/requirements/${requirementId}` : "/employers/dashboard");

      router.refresh();
    } catch (err) {
  console.error("CREATE REQUIREMENT ERROR:", err);

  alert(
    err instanceof Error
      ? err.message
      : "Failed to create requirement."
  );
}
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-8 overflow-hidden rounded-[2.5rem] border border-white bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-10 [&_input]:bg-zinc-50/80 [&_input]:transition [&_input]:duration-300 [&_input]:focus:border-zinc-500 [&_input]:focus:bg-white [&_input]:focus:ring-4 [&_input]:focus:ring-zinc-950/5 [&_select]:bg-zinc-50/80 [&_select]:transition [&_select]:focus:border-zinc-500 [&_select]:focus:ring-4 [&_select]:focus:ring-zinc-950/5 [&_textarea]:bg-zinc-50/80 [&_textarea]:transition [&_textarea]:focus:border-zinc-500 [&_textarea]:focus:bg-white [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-zinc-950/5"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-zinc-200/50 blur-3xl" />
      <div className="relative flex items-start gap-4 border-b border-zinc-100 pb-8">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg"><Target size={21} /></span>
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Role intelligence</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Tell us who you need</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Clear details help our recruiters target the right talent pool from day one.</p></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Job Title
          </label>

          <input
            value={form.job_title}
            onChange={(e) =>
              updateField("job_title", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Department
          </label>

          <input
            value={form.department}
            onChange={(e) =>
              updateField("department", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Employment Type
          </label>

          <select
            value={form.employment_type}
            onChange={(e) =>
              updateField(
                "employment_type",
                e.target.value
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Select</option>

            <option>Full Time</option>

            <option>Part Time</option>

            <option>Contract</option>

            <option>Internship</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Work Mode
          </label>

          <select
            value={form.work_mode}
            onChange={(e) =>
              updateField(
                "work_mode",
                e.target.value
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Select</option>

            <option>Onsite</option>

            <option>Hybrid</option>

            <option>Remote</option>
          </select>
        </div>        <div>
          <label className="mb-2 block text-sm font-medium">
            Experience
          </label>

          <input
            value={form.experience}
            onChange={(e) =>
              updateField("experience", e.target.value)
            }
            placeholder="e.g. 3-5 Years"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Vacancies
          </label>

          <input
            type="number"
            min={1}
            value={form.vacancies}
            onChange={(e) =>
              updateField(
                "vacancies",
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Budget CTC
          </label>

          <input
            value={form.budget_ctc}
            onChange={(e) =>
              updateField("budget_ctc", e.target.value)
            }
            placeholder="e.g. 8-12 LPA"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Location
          </label>

          <input
            value={form.location}
            onChange={(e) =>
              updateField("location", e.target.value)
            }
            placeholder="Mumbai"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Notice Period
          </label>

          <input
            value={form.notice_period}
            onChange={(e) =>
              updateField(
                "notice_period",
                e.target.value
              )
            }
            placeholder="Immediate / 30 Days"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Priority
          </label>

          <select
            value={form.priority}
            onChange={(e) =>
              updateField("priority", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Skills
          </label>

          <textarea
            rows={3}
            value={form.skills}
            onChange={(e) =>
              updateField("skills", e.target.value)
            }
            placeholder="React, Node.js, PostgreSQL..."
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Education
          </label>

          <input
            value={form.education}
            onChange={(e) =>
              updateField("education", e.target.value)
            }
            placeholder="B.Tech / MCA"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Job Description
          </label>

          <textarea
            rows={8}
            value={form.job_description}
            onChange={(e) =>
              updateField(
                "job_description",
                e.target.value
              )
            }
            placeholder="Write complete job description..."
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

      </div>

      <section className="border-t border-zinc-100 pt-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-900"><BadgeCheck size={21} /></span>
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Optional hiring channels</p><h2 className="mt-1 text-2xl font-semibold text-zinc-950">Choose additional JobiVerse support</h2><p className="mt-2 text-sm leading-6 text-zinc-500">These options are completely optional. You can select either one, both, or create a private requirement without selecting them.</p></div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className={`group cursor-pointer rounded-[1.75rem] border p-6 transition ${form.assign_to_jobiverse ? "border-zinc-950 bg-zinc-950 text-white shadow-xl" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"}`}>
            <div className="flex items-start justify-between gap-4"><span className={`grid h-11 w-11 place-items-center rounded-xl ${form.assign_to_jobiverse ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}><UsersRound size={20} /></span><input type="checkbox" checked={form.assign_to_jobiverse} onChange={(event) => updateField("assign_to_jobiverse", event.target.checked)} className="h-5 w-5 accent-zinc-950" /></div>
            <p className="mt-5 font-bold">Assign to JobiVerse Hiring Team</p>
            <p className={`mt-2 text-sm leading-6 ${form.assign_to_jobiverse ? "text-zinc-300" : "text-zinc-600"}`}>Our hiring specialists review the mandate, refine the brief, source beyond active applicants, screen candidates and coordinate the recruitment journey.</p>
            <p className={`mt-4 rounded-xl p-3 text-xs font-semibold ${form.assign_to_jobiverse ? "bg-white/10 text-white" : "bg-white text-zinc-700"}`}>Employer success fee: 5% of the selected candidate&apos;s annual CTC, charged once after successful joining.</p>
          </label>
          <label className={`group cursor-pointer rounded-[1.75rem] border p-6 transition ${form.publish_to_jobs ? "border-blue-700 bg-gradient-to-br from-blue-700 to-indigo-950 text-white shadow-xl" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"}`}>
            <div className="flex items-start justify-between gap-4"><span className={`grid h-11 w-11 place-items-center rounded-xl ${form.publish_to_jobs ? "bg-white text-blue-800" : "bg-zinc-950 text-white"}`}><Globe2 size={20} /></span><input type="checkbox" checked={form.publish_to_jobs} onChange={(event) => updateField("publish_to_jobs", event.target.checked)} className="h-5 w-5 accent-blue-700" /></div>
            <p className="mt-5 font-bold">Release on JobiVerse Jobs Portal</p>
            <p className={`mt-2 text-sm leading-6 ${form.publish_to_jobs ? "text-blue-100" : "text-zinc-600"}`}>The opportunity becomes visible to eligible JobiVerse candidates, who can discover the role, save it and apply directly through the platform.</p>
            <p className={`mt-4 rounded-xl p-3 text-xs font-semibold ${form.publish_to_jobs ? "bg-white/10 text-white" : "bg-white text-zinc-700"}`}>Direct applicant success fee: 3% of the selected candidate&apos;s annual CTC, charged once after successful joining.</p>
          </label>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900"><strong>Commercial note:</strong> These are employer-paid success fees applicable only after a candidate successfully joins. If JobiVerse Hiring Team participates in sourcing or managed recruitment, the 5% hiring-team fee applies. Job seekers are never charged to apply for a role.</div>
      </section>

      <div className="flex flex-col gap-4 border-t border-zinc-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-zinc-500"><FileText size={18} /><span>Your brief can be refined with your assigned recruiter.</span></div>
        <button
          type="submit"
          disabled={loading}
          className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-8 py-3 font-semibold text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : editing ? "Save Requirement" : "Create Requirement"}
          {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </div>

    </form>
  );
}
