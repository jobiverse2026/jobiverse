"use client";

import { useState } from "react";
import { BriefcaseBusiness, Eye, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { saveCandidateProfile } from "@/actions/candidate-profile";

export default function ProfessionalProfileForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);
    try {
      const result = await saveCandidateProfile(form);
      setMessage(result.resumeReplaced ? "CV replaced successfully." : result.resumeChanged ? "CV uploaded and profile saved successfully." : "Professional profile saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    ["headline", "Professional headline", "Senior React Developer | FinTech", true],
    ["phone", "Phone", "+91...", false],
    ["current_location", "Current location", "Mumbai", false],
    ["total_experience", "Total experience", "5 years", false],
    ["current_company", "Current company", "Company name", false],
    ["notice_period", "Notice period", "30 days", false],
    ["current_ctc", "Current CTC", "₹8 LPA", false],
    ["expected_ctc", "Expected CTC", "₹12 LPA", false],
    ["primary_skills", "Primary skills", "React, TypeScript, Node.js", true],
    ["secondary_skills", "Secondary skills", "AWS, Docker", true],
    ["preferred_roles", "Preferred roles", "Frontend Lead, Full Stack Developer", true],
    ["preferred_locations", "Preferred locations", "Mumbai, Pune, Remote", true],
    ["linkedin", "LinkedIn", "linkedin.com/in/your-name", true],
    ["portfolio_url", "Portfolio", "yourportfolio.com", true],
  ] as const;

  return (
    <form onSubmit={submit} className="rounded-[2.5rem] border border-white bg-white/90 p-7 shadow-[0_30px_90px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-10">
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-6 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                <Eye size={19} />
              </span>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Recruiter discovery</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Make me discoverable to verified hiring teams.</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              If this is on, your profile can appear in JobiVerse Talent Search for employers and recruiters. If off, your profile remains private except for jobs you apply to.
            </p>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold lg:min-w-80">
            <span>{profile?.open_to_work ? "Open to work" : "Not discoverable"}</span>
            <input name="open_to_work" type="checkbox" defaultChecked={Boolean(profile?.open_to_work)} className="h-6 w-6 accent-white" />
          </label>
        </div>
      </section>

      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-950 text-white">
          <BriefcaseBusiness size={18} />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Core profile</h2>
          <p className="text-sm text-zinc-500">These details power applications, CV tools and profile matching.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map(([name, label, placeholder, wide]) => (
          <label key={name} className={`text-sm font-medium text-zinc-700 ${wide ? "md:col-span-2" : ""}`}>
            {label}
            <input name={name} defaultValue={profile?.[name] ?? ""} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500" />
          </label>
        ))}
        <label className="text-sm font-medium text-zinc-700 md:col-span-2">
          Professional summary
          <textarea name="bio" rows={6} defaultValue={profile?.bio ?? ""} placeholder="Describe your experience, impact and career direction..." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 outline-none focus:border-zinc-500" />
        </label>
      </div>

      <section className="mt-8 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
            <SlidersHorizontal size={19} />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Talent Search filters</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">Employers use these filters to find relevant open-to-work candidates faster.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Search status
            <select name="job_search_status" defaultValue={profile?.job_search_status ?? "not_looking"} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500">
              <option value="actively_looking">Actively looking</option>
              <option value="open_to_offers">Open to good offers</option>
              <option value="not_looking">Not looking right now</option>
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Role level
            <select name="role_level" defaultValue={profile?.role_level ?? ""} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500">
              <option value="">Select level</option>
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
              <option value="Leadership">Leadership</option>
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">Industry<input name="industry" defaultValue={profile?.industry ?? ""} placeholder="IT, BFSI, Healthcare, Manufacturing..." className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500" /></label>
          <label className="text-sm font-medium text-zinc-700">Functional area<input name="functional_area" defaultValue={profile?.functional_area ?? ""} placeholder="Engineering, Sales, Finance, HR..." className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500" /></label>
          <label className="text-sm font-medium text-zinc-700">Highest education<input name="highest_education" defaultValue={profile?.highest_education ?? ""} placeholder="B.Tech, MBA, B.Com..." className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500" /></label>
          <label className="text-sm font-medium text-zinc-700">
            Employment type
            <select name="employment_type" defaultValue={profile?.employment_type ?? ""} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500">
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Work mode
            <select name="work_mode" defaultValue={profile?.work_mode ?? ""} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500">
              <option value="">Any</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">Expected salary min / year<input name="expected_salary_min" type="number" min="0" defaultValue={profile?.expected_salary_min ?? ""} placeholder="600000" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500" /></label>
          <label className="text-sm font-medium text-zinc-700">Expected salary max / year<input name="expected_salary_max" type="number" min="0" defaultValue={profile?.expected_salary_max ?? ""} placeholder="1200000" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none focus:border-zinc-500" /></label>
          <label className="text-sm font-medium text-zinc-700 md:col-span-2">
            Search keywords
            <textarea name="searchable_keywords" rows={4} defaultValue={profile?.searchable_keywords ?? ""} placeholder="Add role-specific keywords, tools, certifications, domains or achievements employers should discover you by." className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none focus:border-zinc-500" />
          </label>
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-zinc-600">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={18} />
          Your contact details and resume are protected. Employers get discovery access first; full hiring coordination stays through JobiVerse.
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
            <ShieldCheck size={19} />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Confidence, availability & deal-breakers</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              These details power your Hiring Confidence Score, faster scheduling and better role matching.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Interview availability calendar
            <textarea name="interview_availability" rows={5} defaultValue={profile?.interview_availability ?? ""} placeholder="Example: Mon-Fri after 7 PM, Saturday 11 AM-3 PM, 24 hours notice preferred." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 outline-none focus:border-zinc-500" />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Deal-breakers / non-negotiables
            <textarea name="deal_breakers" rows={5} defaultValue={profile?.deal_breakers ?? ""} placeholder="Example: Minimum 12 LPA, Mumbai/Remote only, no night shifts, product companies preferred." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 outline-none focus:border-zinc-500" />
          </label>
          <label className="text-sm font-medium text-zinc-700 md:col-span-2">
            Career wallet notes
            <textarea name="career_wallet_notes" rows={4} defaultValue={profile?.career_wallet_notes ?? ""} placeholder="Add portfolio context, certificate notes, work samples or important profile links you want to remember." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 outline-none focus:border-zinc-500" />
          </label>
        </div>
      </section>

      {message && <p className={`mt-5 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
      <button disabled={loading} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-7 py-4 font-semibold text-white disabled:opacity-50">
        <Save size={18} /> {loading ? "Saving..." : "Save Professional Profile"}
      </button>
    </form>
  );
}
