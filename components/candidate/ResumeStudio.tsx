"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import FileUploadField from "@/components/common/FileUploadField";
import { saveCandidateResume } from "@/actions/candidate-profile";

export default function ResumeStudio({ resumeUrl, hasResume }: { resumeUrl?: string | null; hasResume: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(null);
    try {
      const result = await saveCandidateResume(new FormData(event.currentTarget));
      setMessage(result.replaced ? "Resume replaced successfully." : "Resume uploaded successfully.");
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save resume."); setLoading(false); }
  }
  return <form onSubmit={submit} className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_80px_-45px_rgba(0,0,0,.55)] sm:p-9">
    <FileUploadField name="resume" label="Your Current Resume" buttonLabel={hasResume ? "Replace Resume" : "Upload Resume"} accept="application/pdf,.pdf" hint="PDF only | Maximum 5 MB" pdfOnly existingMessage={hasResume ? "Your secure resume is ready to view or replace." : undefined} existingUrl={resumeUrl} />
    {message && <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
    <button disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-4 font-semibold text-white disabled:opacity-45"><Save size={18} />{loading ? "Saving Resume..." : "Save Resume"}</button>
  </form>;
}




