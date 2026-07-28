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

export type OpportunitySignals = {
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  skills?: string | null;
  salary?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  postedAt?: string | null;
  applyUrl?: string | null;
  direct?: boolean;
  verifiedCompany?: boolean;
  provider?: string | null;
};

export function calculateOpportunityTrust(job: OpportunitySignals) {
  let score = job.direct ? 54 : 32;
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (job.direct) reasons.push("Published inside the JobiVerse employer workflow");
  else if (job.provider) { score += 5; reasons.push(`Attributed to ${job.provider}`); }
  else warnings.push("Source attribution is limited");
  if (job.verifiedCompany) { score += 14; reasons.push("Verified company profile"); }
  if (job.company && !/not disclosed|confidential|unknown/i.test(job.company)) { score += 8; reasons.push("Company name disclosed"); }
  else warnings.push("Company identity is limited");
  const descriptionLength = job.description?.trim().length ?? 0;
  if (descriptionLength >= 500) { score += 9; reasons.push("Comprehensive role information available"); }
  else if (descriptionLength >= 250) { score += 7; reasons.push("Detailed role information available"); }
  else if (descriptionLength >= 120) score += 4;
  else warnings.push("Role description is brief");
  if (job.location && !/not specified|unknown/i.test(job.location)) {
    score += /worldwide|anywhere|global|india/i.test(job.location) ? 2 : 4;
  }
  else warnings.push("Location needs confirmation");
  if (job.employmentType || job.workMode) {
    score += /full.?time|part.?time|contract|intern|remote|hybrid|on.?site/i.test(`${job.employmentType ?? ""} ${job.workMode ?? ""}`) ? 3 : 1;
  }
  if (job.skills) score += 3;
  if (job.salary && !/not disclosed|not specified|competitive/i.test(job.salary)) { score += 5; reasons.push("Compensation information disclosed"); }
  if (job.applyUrl && /^https:\/\//i.test(job.applyUrl)) score += 4;
  if (job.title.trim().length >= 6 && !/multiple openings|various roles|urgent hiring/i.test(job.title)) score += 2;
  if (job.postedAt) {
    const age = listingAgeInDays(job.postedAt);
    if (age !== null && age <= 3) { score += 8; reasons.push("Published or updated within 3 days"); }
    else if (age !== null && age <= 14) { score += 6; reasons.push("Recently published or updated"); }
    else if (age !== null && age <= 30) score += 3;
    else if (age !== null && age > 60) { score -= 5; warnings.push("Listing may be older than 60 days"); }
  } else warnings.push("Publication date is unavailable");

  score = Math.max(20, Math.min(98, score));
  return {
    score,
    label: score >= 85 ? "Strong signals" : score >= 70 ? "Good signals" : score >= 55 ? "Review details" : "Use caution",
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 3),
  };
}

function listingAgeInDays(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? Math.max(0, Math.floor((Date.now() - time) / 86_400_000)) : null;
}

const salaryBases: Record<string, [number, number]> = {
  technology: [5.5, 10.5],
  data: [6.5, 12.5],
  product: [7, 14],
  finance: [4.5, 9],
  sales: [3.5, 7.5],
  marketing: [3.5, 8],
  healthcare: [4, 9],
  operations: [3.5, 7],
  hr: [3.5, 7.5],
  default: [3.5, 8],
};

export function estimateSalaryRange(job: OpportunitySignals) {
  const text = `${job.title} ${job.skills ?? ""} ${job.description ?? ""}`.toLowerCase();
  const family = /data|machine learning|artificial intelligence|analytics/.test(text) ? "data"
    : /software|developer|engineer|devops|cloud|cyber|technology|technical/.test(text) ? "technology"
      : /product manager|product owner/.test(text) ? "product"
        : /finance|account|audit|bank|investment/.test(text) ? "finance"
          : /sales|business development|account executive/.test(text) ? "sales"
            : /marketing|content|seo|brand/.test(text) ? "marketing"
              : /health|medical|doctor|nurse|pharma/.test(text) ? "healthcare"
                : /human resource|recruit|talent acquisition|\bhr\b/.test(text) ? "hr"
                  : /operation|supply chain|logistics|procurement/.test(text) ? "operations" : "default";
  const years = Number.parseFloat(String(job.experience ?? "").match(/\d+(?:\.\d+)?/)?.[0] ?? "0");
  const experienceMultiplier = years >= 10 ? 2.2 : years >= 7 ? 1.8 : years >= 4 ? 1.45 : years >= 2 ? 1.2 : 1;
  const location = String(job.location ?? "").toLowerCase();
  const locationMultiplier = /bengaluru|bangalore|mumbai|gurugram|gurgaon|hyderabad|pune|delhi|noida/.test(location) ? 1.12 : 1;
  const [baseMin, baseMax] = salaryBases[family];
  const min = Math.round(baseMin * experienceMultiplier * locationMultiplier * 10) / 10;
  const max = Math.round(baseMax * experienceMultiplier * locationMultiplier * 10) / 10;
  return {
    min,
    max,
    unit: "LPA",
    family,
    confidence: job.experience && job.location ? "medium" : "directional",
    disclaimer: "JobiVerse market estimate, not an employer-offered salary. Confirm compensation with the hiring company.",
  };
}

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

export function isExpiredListing(value?: string | null, maxDays = 45) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < Date.now() - maxDays * 86_400_000;
}

export function listingKey(title: string, company: string, location: string) {
  const normalize = (value: string) => value
    .toLowerCase()
    .replace(/\b(?:pvt|private|limited|ltd|inc|llp|corporation|corp|company|co)\b/g, " ")
    .replace(/\b(?:senior|sr|junior|jr)\b/g, " ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const city = normalize(location).split(" ").slice(0, 3).join(" ");
  return `${normalize(title)}|${normalize(company)}|${city}`;
}
