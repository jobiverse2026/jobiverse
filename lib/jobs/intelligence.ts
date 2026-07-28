export type JobCandidateProfile = {
  primary_skills?: string | null;
  preferred_roles?: string | null;
  preferred_locations?: string | null;
  work_mode?: string | null;
  employment_type?: string | null;
  total_experience?: string | null;
  resume_path?: string | null;
  interview_availability?: string | null;
};

export type MatchableJob = {
  title: string;
  skills?: string | null;
  location?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  description?: string | null;
};

function tokens(value?: string | null) {
  return String(value ?? "").toLowerCase().split(/[^a-z0-9+#.]+/).filter((token) => token.length > 1);
}

function overlaps(left?: string | null, right?: string | null) {
  const rightTokens = new Set(tokens(right));
  return tokens(left).filter((token) => rightTokens.has(token));
}

export function calculateListingMatch(profile: JobCandidateProfile | null | undefined, job: MatchableJob) {
  if (!profile) return null;
  const jobSkillText = `${job.skills ?? ""} ${job.description ?? ""}`;
  const matchedSkills = [...new Set(overlaps(profile.primary_skills, jobSkillText))].slice(0, 6);
  const profileSkills = [...new Set(tokens(profile.primary_skills))].slice(0, 12);
  const missingSkills = profileSkills.length
    ? [...new Set(tokens(job.skills).filter((skill) => !tokens(profile.primary_skills).includes(skill)))].slice(0, 4)
    : [];
  const roleFit = overlaps(profile.preferred_roles, job.title).length > 0;
  const locationFit = overlaps(profile.preferred_locations, job.location).length > 0
    || tokens(profile.preferred_locations).includes("remote") && tokens(job.workMode).includes("remote");
  const modeFit = overlaps(profile.work_mode, job.workMode).length > 0;
  const typeFit = overlaps(profile.employment_type, job.employmentType).length > 0;
  const skillScore = profileSkills.length ? Math.min(42, Math.round((matchedSkills.length / Math.min(profileSkills.length, 8)) * 42)) : 16;
  const score = Math.min(98, skillScore + (roleFit ? 24 : 7) + (locationFit ? 13 : 4) + (modeFit ? 9 : 3) + (typeFit ? 6 : 2) + (profile.resume_path ? 4 : 0));
  return {
    score,
    recommended: score >= 70,
    matchedSkills,
    missingSkills,
    reasons: [
      roleFit ? "Preferred role aligned" : "Review role alignment",
      matchedSkills.length ? `${matchedSkills.length} matching skills` : "Add skills for better matching",
      locationFit ? "Location aligned" : "Check location",
      modeFit ? "Work mode aligned" : "Check work mode",
    ],
  };
}

export function freshnessLabel(value?: string | null) {
  if (!value) return { label: "Recently listed", tone: "zinc" as const };
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return { label: "Recently listed", tone: "zinc" as const };
  const days = Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
  if (days === 0) return { label: "New today", tone: "emerald" as const };
  if (days <= 3) return { label: `New · ${days}d`, tone: "emerald" as const };
  if (days <= 14) return { label: `Posted ${days}d ago`, tone: "violet" as const };
  return { label: `Updated ${days}d ago`, tone: "zinc" as const };
}

export function isStaleListing(value?: string | null, maxDays = 60) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < Date.now() - maxDays * 86_400_000;
}

export function listingKey(title: string, company: string, location: string) {
  return `${title}|${company}|${location}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
