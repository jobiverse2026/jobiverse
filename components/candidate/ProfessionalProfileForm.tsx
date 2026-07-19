"use client";

import { useState } from "react";
import { Save } from "lucide-react";
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
    ["headline", "Professional headline", "Senior React Developer | FinTech", true], ["phone", "Phone", "+91...", false],
    ["current_location", "Current location", "Mumbai", false], ["total_experience", "Total experience", "5 years", false],
    ["current_company", "Current company", "Company name", false], ["notice_period", "Notice period", "30 days", false],
    ["current_ctc", "Current CTC", "₹8 LPA", false], ["expected_ctc", "Expected CTC", "₹12 LPA", false],
    ["primary_skills", "Primary skills", "React, TypeScript, Node.js", true], ["secondary_skills", "Secondary skills", "AWS, Docker", true],
    ["preferred_roles", "Preferred roles", "Frontend Lead, Full Stack Developer", true], ["preferred_locations", "Preferred locations", "Mumbai, Pune, Remote", true],
    ["linkedin", "LinkedIn", "linkedin.com/in/your-name", true], ["portfolio_url", "Portfolio", "yourportfolio.com", true],
  ] as const;

  return <form onSubmit={submit} className="rounded-[2.5rem] border border-white bg-white/90 p-7 shadow-[0_30px_90px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-10">
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map(([name, label, placeholder, wide]) => <label key={name} className={`text-sm font-medium text-zinc-700 ${wide ? "md:col-span-2" : ""}`}>{label}<input name={name} defaultValue={profile?.[name] ?? ""} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500" /></label>)}
      <label className="text-sm font-medium text-zinc-700 md:col-span-2">Professional summary<textarea name="bio" rows={6} defaultValue={profile?.bio ?? ""} placeholder="Describe your experience, impact and career direction..." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 outline-none focus:border-zinc-500" /></label>
    </div>
    {message && <p className={`mt-5 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
    <button disabled={loading} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-7 py-4 font-semibold text-white disabled:opacity-50"><Save size={18} /> {loading ? "Saving..." : "Save Professional Profile"}</button>
  </form>;
}
