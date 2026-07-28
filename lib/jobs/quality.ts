export type QualityJob = {
  id: string;
  job_title?: string | null;
  job_description?: string | null;
  location?: string | null;
  primary_skills?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  experience?: string | null;
  status?: string | null;
  is_public?: boolean | null;
  published_at?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  companyLogo?: string | null;
};

export function evaluateJobQuality(job: QualityJob) {
  let score = 100; const issues: string[] = [];
  const add = (points: number, issue: string) => { score -= points; issues.push(issue); };
  if (!job.job_title?.trim()) add(25, "Missing job title");
  if (!job.companyName?.trim()) add(18, "Missing company name");
  if (!job.job_description?.trim()) add(25, "Missing job description");
  else if (job.job_description.trim().length < 180) add(12, "Description is too brief");
  if (!job.location?.trim() || /not specified|unknown/i.test(job.location)) add(12, "Location not specified");
  else if (/^india$/i.test(job.location.trim())) add(5, "Location is too broad");
  if (!job.primary_skills?.trim()) add(8, "Skills not listed");
  if (!job.employment_type?.trim()) add(6, "Employment type missing");
  if (!job.work_mode?.trim()) add(5, "Work mode missing");
  if (!job.experience?.trim()) add(5, "Experience range missing");
  if (!job.companyWebsite?.trim()) add(4, "Company website missing");
  if (!job.companyLogo?.trim()) add(2, "Company logo missing");
  if (job.published_at && Date.now() - new Date(job.published_at).getTime() > 45 * 86_400_000) add(10, "Published more than 45 days ago");
  if (job.is_public && ["Closed", "Cancelled", "Filled"].includes(job.status || "")) add(30, "Closed role is still public");
  return { score: Math.max(0, score), issues, grade: score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 55 ? "Needs work" : "Critical" };
}
