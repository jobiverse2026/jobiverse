"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

type ResumeAnalysis = {
  ats_score: number;
  impact_score: number;
  readability_score: number;
  keyword_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missing_keywords: string[];
  suggested_roles: string[];
  section_feedback: { section: string; feedback: string }[];
};

export async function analyzeCandidateResume() {
  if (process.env.ENABLE_PAID_AI !== "true") throw new Error("JobiVerse AI Resume Analyzer is coming soon.");
  const provider = (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
  const model = provider === "gemini" ? (process.env.GEMINI_RESUME_MODEL || "gemini-2.5-flash") : (process.env.OPENAI_RESUME_MODEL || "gpt-5.6-luna");
  const { supabase, user } = await requireRole(["candidate"]);
  const { data: profile, error: profileError } = await supabase.from("candidate_profiles").select("resume_path, preferred_roles, primary_skills, total_experience").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile?.resume_path) throw new Error("Please upload your resume before running AI analysis.");
  const { data: purchase, error: purchaseError } = await adminSupabase.from("ai_feature_purchases").select("id").eq("user_id", user.id).eq("feature_key", "resume_analyzer").eq("status", "available").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (purchaseError) throw new Error(purchaseError.message);
  if (!purchase) throw new Error("Please complete AI Resume Analyzer payment before running the report.");

  const { data: resume, error: downloadError } = await supabase.storage.from("candidate-resumes").download(profile.resume_path);
  if (downloadError || !resume) throw new Error(downloadError?.message ?? "Unable to read your resume.");
  if (resume.size > 5 * 1024 * 1024) throw new Error("Resume must be 5 MB or less.");
  const base64 = Buffer.from(await resume.arrayBuffer()).toString("base64");
  const prompt = `Act as a careful Indian recruitment resume reviewer. Analyze this PDF resume for ATS compatibility, impact, readability, keyword alignment and practical role fit. Candidate preferences: roles=${profile.preferred_roles || "not provided"}; skills=${profile.primary_skills || "not provided"}; experience=${profile.total_experience || "not provided"}. Scores are estimates, not guarantees. Do not invent facts. Return only valid JSON with these exact keys: ats_score, impact_score, readability_score, keyword_score, summary, strengths, improvements, missing_keywords, suggested_roles, section_feedback. section_feedback must be an array of objects with section and feedback.`;

  await adminSupabase.from("ai_interaction_audit").insert({
    user_id: user.id,
    feature_key: "resume_analyzer",
    input_reference: profile.resume_path,
    model_provider: provider === "gemini" ? "Google Gemini" : "OpenAI",
    model_name: model,
    status: "started",
  });

  let analysis: ResumeAnalysis;
  if (provider === "gemini") {
    analysis = await analyzeWithGemini({ base64, prompt, model, userId: user.id, inputReference: profile.resume_path });
  } else {
    analysis = await analyzeWithOpenAI({ base64, prompt, model, userId: user.id, inputReference: profile.resume_path });
  }

  const { error: saveError } = await supabase.from("resume_analyses").insert({ candidate_user_id: user.id, resume_path: profile.resume_path, model, ...analysis });
  if (saveError) throw new Error(saveError.message);
  const { error: consumeError } = await adminSupabase.from("ai_feature_purchases").update({ status: "consumed", consumed_at: new Date().toISOString() }).eq("id", purchase.id).eq("status", "available");
  if (consumeError) throw new Error(consumeError.message);
  await adminSupabase.from("ai_interaction_audit").insert({
    user_id: user.id,
    feature_key: "resume_analyzer",
    input_reference: profile.resume_path,
    output_reference: "resume_analyses",
    model_provider: provider === "gemini" ? "Google Gemini" : "OpenAI",
    model_name: model,
    status: "completed",
  });
  revalidatePath("/candidates/resume-analysis");
  revalidatePath("/candidates/dashboard");
  return analysis;
}

async function analyzeWithGemini({ base64, prompt, model, userId, inputReference }: { base64: string; prompt: string; model: string; userId: string; inputReference: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is not configured.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ inline_data: { mime_type: "application/pdf", data: base64 } }, { text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    await adminSupabase.from("ai_interaction_audit").insert({ user_id: userId, feature_key: "resume_analyzer", input_reference: inputReference, model_provider: "Google Gemini", model_name: model, status: "failed", error_code: String(payload?.error?.code ?? response.status) });
    throw new Error(payload?.error?.message ?? "Gemini resume analysis failed. Please try again.");
  }
  const outputText = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim();
  if (!outputText) throw new Error("Gemini returned an empty analysis.");
  return normalizeAnalysis(parseJson(outputText));
}

async function analyzeWithOpenAI({ base64, prompt, model, userId, inputReference }: { base64: string; prompt: string; model: string; userId: string; inputReference: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is not configured.");
  const fileData = `data:application/pdf;base64,${base64}`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [
        { type: "input_file", filename: "resume.pdf", file_data: fileData },
        { type: "input_text", text: prompt },
      ] }],
      text: { format: { type: "json_object" } },
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = payload?.error?.message ?? "AI analysis failed. Please try again.";
    const code = payload?.error?.code ?? payload?.error?.type ?? String(response.status);
    await adminSupabase.from("ai_interaction_audit").insert({
      user_id: userId,
      feature_key: "resume_analyzer",
      input_reference: inputReference,
      model_provider: "OpenAI",
      model_name: model,
      status: "failed",
      error_code: String(code),
    });
    if (response.status === 429 || String(code).includes("quota")) {
      throw new Error("AI usage limit or billing is not active right now. Please try again after JobiVerse AI credits are refreshed.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("AI service key is not authorized. Please check the OpenAI API key in production settings.");
    }
    throw new Error(providerMessage);
  }
  const outputText = payload.output_text ?? payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("AI returned an empty analysis.");
  return normalizeAnalysis(parseJson(outputText));
}

function parseJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

function normalizeAnalysis(value: any): ResumeAnalysis {
  const score = (input: unknown) => Math.max(0, Math.min(100, Math.round(Number(input) || 0)));
  const strings = (input: unknown, limit: number) => Array.isArray(input) ? input.map(String).filter(Boolean).slice(0, limit) : [];
  const sectionFeedback = Array.isArray(value?.section_feedback) ? value.section_feedback.map((item: any) => ({ section: String(item?.section ?? "Resume section"), feedback: String(item?.feedback ?? "") })).filter((item: { feedback: string }) => item.feedback).slice(0, 8) : [];
  return {
    ats_score: score(value?.ats_score),
    impact_score: score(value?.impact_score),
    readability_score: score(value?.readability_score),
    keyword_score: score(value?.keyword_score),
    summary: String(value?.summary ?? "Your resume has been analyzed. Review the suggestions below before applying."),
    strengths: strings(value?.strengths, 6),
    improvements: strings(value?.improvements, 8),
    missing_keywords: strings(value?.missing_keywords, 12),
    suggested_roles: strings(value?.suggested_roles, 6),
    section_feedback: sectionFeedback,
  };
}
