export type CandidateIntelligenceProfile = {
  headline?: string | null;
  phone?: string | null;
  current_location?: string | null;
  total_experience?: string | number | null;
  notice_period?: string | null;
  primary_skills?: string | null;
  preferred_roles?: string | null;
  preferred_locations?: string | null;
  linkedin?: string | null;
  portfolio_url?: string | null;
  bio?: string | null;
  resume_path?: string | null;
  open_to_work?: boolean | null;
  job_search_status?: string | null;
  work_mode?: string | null;
  employment_type?: string | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  expected_ctc?: string | null;
  interview_availability?: string | null;
  deal_breakers?: string | null;
  career_wallet_notes?: string | null;
  profile_completion?: number | null;
};

export function computeConfidenceScore(profile?: CandidateIntelligenceProfile | null, verifiedItems = 0) {
  const report = computeProfileCompleteness(profile, verifiedItems);
  return { score: report.score, missing: report.missing.slice(0, 4) };
}

export function confidenceTone(score: number) {
  if (score >= 80) return { label: "High confidence", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  if (score >= 55) return { label: "Building confidence", className: "bg-amber-50 text-amber-700 ring-amber-100" };
  return { label: "Needs profile depth", className: "bg-red-50 text-red-700 ring-red-100" };
}

export function applicationHealth(status?: string | null) {
  const normalized = String(status ?? "Applied").toLowerCase();
  const stages = ["Applied", "Viewed", "Shortlisted", "Interview", "Offered", "Hired"];
  const activeIndex = normalized.includes("hired") || normalized.includes("joined")
    ? 5
    : normalized.includes("offer")
      ? 4
      : normalized.includes("interview")
        ? 3
        : normalized.includes("shortlist") || normalized.includes("screen")
          ? 2
          : normalized.includes("review") || normalized.includes("view")
            ? 1
            : 0;
  const closed = ["rejected", "withdrawn", "cancelled"].some((item) => normalized.includes(item));
  return { stages, activeIndex, closed };
}

export function hiringHealthScore(input: {
  activeRequirements: number;
  candidates: number;
  interviews: number;
  positionsClosed: number;
  externalApplicants: number;
}) {
  const requirementCoverage = input.activeRequirements ? Math.min(35, Math.round((input.candidates / input.activeRequirements) * 10)) : 0;
  const interviewMovement = input.candidates ? Math.min(25, Math.round((input.interviews / input.candidates) * 100)) : 0;
  const closureMovement = input.candidates ? Math.min(25, Math.round((input.positionsClosed / input.candidates) * 100)) : 0;
  const directDemand = input.externalApplicants ? 10 : 0;
  const activityBase = input.activeRequirements ? 5 : 0;
  return Math.min(100, requirementCoverage + interviewMovement + closureMovement + directDemand + activityBase);
}

export function computeProfileCompleteness(profile?: CandidateIntelligenceProfile | null, verifiedItems = 0) {
  const items = [
    { label: "Headline", done: Boolean(profile?.headline), fix: "Add a sharp professional headline" },
    { label: "Phone", done: Boolean(profile?.phone), fix: "Add your phone number" },
    { label: "Location", done: Boolean(profile?.current_location), fix: "Add current location" },
    { label: "Experience", done: Boolean(profile?.total_experience), fix: "Add total years of experience" },
    { label: "Top skills", done: Boolean(profile?.primary_skills), fix: "Add top skills" },
    { label: "Target roles", done: Boolean(profile?.preferred_roles), fix: "Add preferred roles" },
    { label: "Notice period", done: Boolean(profile?.notice_period), fix: "Add notice period" },
    { label: "Resume", done: Boolean(profile?.resume_path), fix: "Upload your latest CV" },
    { label: "Open to Work", done: Boolean(profile?.open_to_work), fix: "Switch on Open to Work when ready" },
    { label: "Interview availability", done: Boolean(profile?.interview_availability), fix: "Add interview availability" },
    { label: "Deal breakers", done: Boolean(profile?.deal_breakers || profile?.expected_salary_min || profile?.expected_ctc || profile?.work_mode), fix: "Add salary, work mode or location deal-breakers" },
    { label: "Proof links", done: Boolean(profile?.linkedin || profile?.portfolio_url), fix: "Add LinkedIn or portfolio link" },
    { label: "Verified assets", done: verifiedItems > 0, fix: "Add/verify career wallet proofs" },
  ];
  const completed = items.filter((item) => item.done);
  const score = Math.round((completed.length / items.length) * 100);
  return {
    score,
    completed: completed.map((item) => item.label),
    missing: items.filter((item) => !item.done).map((item) => item.fix),
    total: items.length,
    done: completed.length,
  };
}

export function computeCareerScore(input: {
  profile?: CandidateIntelligenceProfile | null;
  verifiedItems?: number;
  applications?: number;
  savedJobs?: number;
  resumeVersions?: number;
}) {
  const completeness = computeProfileCompleteness(input.profile, input.verifiedItems ?? 0).score;
  const activity = Math.min(15, ((input.applications ?? 0) * 4) + ((input.savedJobs ?? 0) * 2));
  const wallet = Math.min(12, ((input.resumeVersions ?? 0) * 3) + ((input.verifiedItems ?? 0) * 4));
  const readiness = (input.profile?.open_to_work ? 6 : 0) + (input.profile?.interview_availability ? 5 : 0);
  const score = Math.min(100, Math.round((completeness * 0.62) + activity + wallet + readiness));
  const level = score >= 82 ? "Career-ready" : score >= 60 ? "Growing strong" : "Needs more depth";
  return {
    score,
    level,
    summary: score >= 82
      ? "Your career profile looks strong for active opportunities."
      : score >= 60
        ? "You have a good base. Add the missing trust signals to move faster."
        : "Build profile depth first so employers can understand your fit quickly.",
  };
}

export function computeRecruiterQualityScore(input: {
  candidates: number;
  l1: number;
  l2: number;
  fulfilled: number;
  requirementsWorked: number;
}) {
  const submissionBase = Math.min(30, input.candidates * 4);
  const interviewMovement = input.candidates ? Math.min(25, Math.round(((input.l1 + input.l2) / input.candidates) * 35)) : 0;
  const closureMovement = input.candidates ? Math.min(30, Math.round((input.fulfilled / input.candidates) * 100)) : 0;
  const coverage = Math.min(15, input.requirementsWorked * 5);
  const score = Math.min(100, submissionBase + interviewMovement + closureMovement + coverage);
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Strong" : score >= 35 ? "Building" : "Needs activity";
  return { score, label };
}

export type JobMatchInput = {
  job_title?: string | null;
  primary_skills?: string | null;
  location?: string | null;
  work_mode?: string | null;
  employment_type?: string | null;
  experience?: string | null;
  companies?: { is_verified?: boolean | null }[] | null;
};

function words(value?: string | number | null) {
  return String(value ?? "")
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

export function computeJobMatch(profile?: CandidateIntelligenceProfile | null, job?: JobMatchInput | null) {
  const profileSkills = new Set(words(profile?.primary_skills));
  const jobSkills = words(job?.primary_skills);
  const matchedSkills = jobSkills.filter((skill) => profileSkills.has(skill)).slice(0, 6);
  const missingSkills = jobSkills.filter((skill) => !profileSkills.has(skill)).slice(0, 4);
  const roleFit = words(profile?.preferred_roles).some((item) => words(job?.job_title).includes(item));
  const locationFit = Boolean(profile?.preferred_locations && job?.location && words(profile.preferred_locations).some((item) => words(job.location).includes(item)));
  const workModeFit = Boolean(profile?.work_mode && job?.work_mode && words(profile.work_mode).some((item) => words(job.work_mode).includes(item)));
  const skillsScore = jobSkills.length ? Math.min(45, Math.round((matchedSkills.length / Math.min(jobSkills.length, 8)) * 45)) : 18;
  const score = Math.min(98, skillsScore + (roleFit ? 20 : 8) + (locationFit ? 12 : 4) + (workModeFit ? 12 : 4) + (profile?.resume_path ? 6 : 0) + (profile?.interview_availability ? 5 : 0));
  const reasons = [
    matchedSkills.length ? `${matchedSkills.length} skill match${matchedSkills.length > 1 ? "es" : ""}` : "Skills need review",
    roleFit ? "Role preference aligned" : "Role fit needs confirmation",
    locationFit ? "Location preference aligned" : "Check location fit",
    workModeFit ? "Work mode aligned" : "Check work mode",
  ];
  return { score, matchedSkills, missingSkills, reasons, recommended: score >= 70 };
}
