"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

const profileSchema = z.object({
  headline: z.string().trim().max(160).optional(), phone: z.string().trim().max(30).optional(),
  current_location: z.string().trim().max(120).optional(), total_experience: z.string().trim().max(60).optional(),
  current_company: z.string().trim().max(160).optional(), current_ctc: z.string().trim().max(60).optional(),
  expected_ctc: z.string().trim().max(60).optional(), notice_period: z.string().trim().max(60).optional(),
  primary_skills: z.string().trim().max(1000).optional(), secondary_skills: z.string().trim().max(1000).optional(),
  preferred_locations: z.string().trim().max(500).optional(), preferred_roles: z.string().trim().max(500).optional(),
  linkedin: z.string().trim().max(500).optional(), portfolio_url: z.string().trim().max(500).optional(), bio: z.string().trim().max(3000).optional(),
  open_to_work: z.preprocess((value) => value === "on" || value === "true", z.boolean()).default(false),
  job_search_status: z.enum(["actively_looking", "open_to_offers", "not_looking"]).default("not_looking"),
  role_level: z.string().trim().max(80).optional(),
  industry: z.string().trim().max(120).optional(),
  functional_area: z.string().trim().max(120).optional(),
  highest_education: z.string().trim().max(120).optional(),
  employment_type: z.string().trim().max(80).optional(),
  work_mode: z.string().trim().max(80).optional(),
  expected_salary_min: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  expected_salary_max: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  searchable_keywords: z.string().trim().max(1200).optional(),
});

function normalizeUrl(value?: string) {
  if (!value) return null;
  const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try { return new URL(normalized).toString(); } catch { throw new Error("Please enter a valid LinkedIn or portfolio URL."); }
}

export async function saveCandidateProfile(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const raw = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "resume"));
  raw.open_to_work = formData.get("open_to_work") === "on" ? "on" : "false";
  const result = profileSchema.safeParse(raw);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Please check your profile details.");

  const { data: existing } = await supabase.from("candidate_profiles").select("resume_path").eq("user_id", user.id).maybeSingle();
  const resume = formData.get("resume") as File | null;
  let resumePath = existing?.resume_path ?? null;
  let newResumePath: string | null = null;

  if (resume?.size) {
    if (resume.type !== "application/pdf") throw new Error("Please upload your resume as a PDF.");
    if (resume.size > 5 * 1024 * 1024) throw new Error("Resume size must be 5 MB or less.");
    newResumePath = `${user.id}/profile-${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage.from("candidate-resumes").upload(newResumePath, resume);
    if (uploadError) throw new Error(uploadError.message);
    resumePath = newResumePath;
  }

  const profile = result.data;
  const completionFields = [profile.headline, profile.phone, profile.current_location, profile.total_experience, profile.primary_skills, profile.preferred_roles, profile.linkedin, profile.bio, resumePath];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const { error } = await supabase.from("candidate_profiles").upsert({
    user_id: user.id, ...profile,
    linkedin: normalizeUrl(profile.linkedin), portfolio_url: normalizeUrl(profile.portfolio_url),
    resume_path: resumePath, profile_completion: completion, updated_at: new Date().toISOString(),
  });

  if (error) {
    if (newResumePath) await supabase.storage.from("candidate-resumes").remove([newResumePath]);
    throw new Error(error.message);
  }
  if(newResumePath){await supabase.from("candidate_resume_versions").update({is_current:false}).eq("candidate_user_id",user.id).eq("is_current",true);const{error:versionError}=await supabase.from("candidate_resume_versions").insert({candidate_user_id:user.id,storage_path:newResumePath,file_name:resume?.name||"Resume.pdf",label:`Resume ${new Date().toLocaleDateString("en-IN")}`,size_bytes:resume?.size,source:"profile",is_current:true});if(versionError)throw new Error(versionError.message);}

  revalidatePath("/candidates/profile");
  revalidatePath("/candidates/dashboard");
  return {
    resumeChanged: Boolean(newResumePath),
    resumeReplaced: Boolean(newResumePath && existing?.resume_path),
  };
}

export async function saveCandidateResume(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const resume = formData.get("resume") as File | null;
  if (!resume?.size) throw new Error("Please choose a resume PDF.");
  if (resume.type !== "application/pdf") throw new Error("Please upload your resume as a PDF.");
  if (resume.size > 5 * 1024 * 1024) throw new Error("Resume size must be 5 MB or less.");
  const { data: existing, error: profileError } = await supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  const newResumePath = `${user.id}/profile-${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage.from("candidate-resumes").upload(newResumePath, resume);
  if (uploadError) throw new Error(uploadError.message);
  const completionFields = [existing?.headline, existing?.phone, existing?.current_location, existing?.total_experience, existing?.primary_skills, existing?.preferred_roles, existing?.linkedin, existing?.bio, newResumePath];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);
  const { error } = await supabase.from("candidate_profiles").upsert({ user_id: user.id, resume_path: newResumePath, profile_completion: completion, updated_at: new Date().toISOString() });
  if (error) { await supabase.storage.from("candidate-resumes").remove([newResumePath]); throw new Error(error.message); }
  await supabase.from("candidate_resume_versions").update({is_current:false}).eq("candidate_user_id",user.id).eq("is_current",true);
  const{error:versionError}=await supabase.from("candidate_resume_versions").insert({candidate_user_id:user.id,storage_path:newResumePath,file_name:resume.name,label:`Resume ${new Date().toLocaleDateString("en-IN")}`,size_bytes:resume.size,source:"upload",is_current:true});if(versionError)throw new Error(versionError.message);
  revalidatePath("/candidates/resume"); revalidatePath("/candidates/dashboard");
  return { replaced: Boolean(existing?.resume_path) };
}

export async function updateOpenToWorkPreference(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const openToWork = formData.get("open_to_work") === "on";
  const { error } = await supabase.from("candidate_profiles").upsert({
    user_id: user.id,
    open_to_work: openToWork,
    job_search_status: openToWork ? "open_to_offers" : "not_looking",
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/candidates/dashboard");
  revalidatePath("/candidates/profile");
  redirect(`/candidates/dashboard?visibility=${openToWork ? "open" : "hidden"}`);
}

export async function restoreResumeVersion(formData:FormData){const versionId=z.string().uuid().parse(formData.get("versionId"));const{supabase,user}=await requireRole(["candidate"]);const{data:version}=await supabase.from("candidate_resume_versions").select("id,storage_path").eq("id",versionId).eq("candidate_user_id",user.id).maybeSingle();if(!version)throw new Error("Resume version not found.");await supabase.from("candidate_resume_versions").update({is_current:false}).eq("candidate_user_id",user.id).eq("is_current",true);const[{error:versionError},{error:profileError}]=await Promise.all([supabase.from("candidate_resume_versions").update({is_current:true}).eq("id",version.id),supabase.from("candidate_profiles").update({resume_path:version.storage_path,updated_at:new Date().toISOString()}).eq("user_id",user.id)]);if(versionError||profileError)throw new Error(versionError?.message??profileError?.message);revalidatePath("/candidates/resume");revalidatePath("/candidates/profile");redirect("/candidates/resume?updated=restored");}

export async function renameResumeVersion(formData:FormData){const versionId=z.string().uuid().parse(formData.get("versionId"));const label=z.string().trim().min(2).max(80).parse(formData.get("label"));const{supabase,user}=await requireRole(["candidate"]);const{error}=await supabase.from("candidate_resume_versions").update({label}).eq("id",versionId).eq("candidate_user_id",user.id);if(error)throw new Error(error.message);revalidatePath("/candidates/resume");redirect("/candidates/resume?updated=renamed");}

export async function duplicateResumeVersion(formData:FormData){const versionId=z.string().uuid().parse(formData.get("versionId"));const{supabase,user}=await requireRole(["candidate"]);const{data:version}=await supabase.from("candidate_resume_versions").select("storage_path,file_name,label,size_bytes").eq("id",versionId).eq("candidate_user_id",user.id).maybeSingle();if(!version)throw new Error("Resume version not found.");const{error}=await supabase.from("candidate_resume_versions").insert({candidate_user_id:user.id,storage_path:version.storage_path,file_name:version.file_name,label:`${version.label} - Copy`,size_bytes:version.size_bytes,source:"duplicate",is_current:false});if(error)throw new Error(error.message);revalidatePath("/candidates/resume");redirect("/candidates/resume?updated=duplicated");}
