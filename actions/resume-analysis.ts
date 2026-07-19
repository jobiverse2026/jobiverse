"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ats_score: { type: "integer", minimum: 0, maximum: 100 },
    impact_score: { type: "integer", minimum: 0, maximum: 100 },
    readability_score: { type: "integer", minimum: 0, maximum: 100 },
    keyword_score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" }, maxItems: 6 },
    improvements: { type: "array", items: { type: "string" }, maxItems: 8 },
    missing_keywords: { type: "array", items: { type: "string" }, maxItems: 12 },
    suggested_roles: { type: "array", items: { type: "string" }, maxItems: 6 },
    section_feedback: { type: "array", maxItems: 8, items: { type: "object", additionalProperties: false, properties: { section: { type: "string" }, feedback: { type: "string" } }, required: ["section", "feedback"] } },
  },
  required: ["ats_score", "impact_score", "readability_score", "keyword_score", "summary", "strengths", "improvements", "missing_keywords", "suggested_roles", "section_feedback"],
};

export async function analyzeCandidateResume() {
  if (process.env.ENABLE_PAID_AI !== "true") throw new Error("JobiVerse AI Resume Analyzer is coming soon.");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI service is not configured.");
  const { supabase, user } = await requireRole(["candidate"]);
  const { data: profile, error: profileError } = await supabase.from("candidate_profiles").select("resume_path, preferred_roles, primary_skills, total_experience").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile?.resume_path) throw new Error("Please upload your resume before running AI analysis.");

  const { data: resume, error: downloadError } = await supabase.storage.from("candidate-resumes").download(profile.resume_path);
  if (downloadError || !resume) throw new Error(downloadError?.message ?? "Unable to read your resume.");
  if (resume.size > 5 * 1024 * 1024) throw new Error("Resume must be 5 MB or less.");
  const fileData = `data:application/pdf;base64,${Buffer.from(await resume.arrayBuffer()).toString("base64")}`;
  const model = process.env.OPENAI_RESUME_MODEL || "gpt-5.6-luna";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [
        { type: "input_file", filename: "resume.pdf", file_data: fileData },
        { type: "input_text", text: `Act as a careful Indian recruitment resume reviewer. Analyze this resume for general ATS compatibility and career impact. Candidate preferences: roles=${profile.preferred_roles || "not provided"}; skills=${profile.primary_skills || "not provided"}; experience=${profile.total_experience || "not provided"}. Scores are estimates, not guarantees. Do not invent facts. Give concise, actionable feedback.` },
      ] }],
      text: { format: { type: "json_schema", name: "resume_analysis", strict: true, schema } },
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? "AI analysis failed. Please try again.");
  const outputText = payload.output_text ?? payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("AI returned an empty analysis.");
  const analysis = JSON.parse(outputText);

  const { error: saveError } = await supabase.from("resume_analyses").insert({ candidate_user_id: user.id, resume_path: profile.resume_path, model, ...analysis });
  if (saveError) throw new Error(saveError.message);
  revalidatePath("/candidates/resume-analysis");
  revalidatePath("/candidates/dashboard");
  return analysis;
}
