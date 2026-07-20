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

export function recruiterQualitySuggestions(input: {
  candidates: number;
  l1: number;
  l2: number;
  fulfilled: number;
  requirementsWorked: number;
}) {
  const suggestions = [
    input.candidates < 5 && "Submit more relevant profiles against active assigned requirements.",
    input.candidates > 0 && input.l1 === 0 && "Improve first-screen quality so more candidates reach L1 interview.",
    input.l1 > 0 && input.l2 === 0 && "Follow up after L1 and refine shortlists for L2 movement.",
    input.candidates > 0 && input.fulfilled === 0 && "Track interview feedback and push stronger fitment before offer stage.",
    input.requirementsWorked < 2 && "Work across more assigned requirements to improve coverage score.",
  ].filter(Boolean) as string[];
  return suggestions.length ? suggestions.slice(0, 3) : ["Maintain submission quality, fast follow-ups and accurate candidate status updates."];
}

export function jobiverseCandidateFitFeedback(input: {
  candidateName?: string | null;
  jobTitle?: string | null;
  candidateSkills?: string | null;
  requiredSkills?: string | null;
  experience?: string | number | null;
  noticePeriod?: string | null;
  location?: string | null;
  status?: string | null;
}) {
  const candidateWords = new Set(words(input.candidateSkills));
  const requiredWords = words(input.requiredSkills);
  const matched = requiredWords.filter((skill) => candidateWords.has(skill)).slice(0, 5);
  const name = input.candidateName || "This candidate";
  const role = input.jobTitle || "this requirement";
  const feedback = [
    matched.length
      ? `${name} shows overlap with ${matched.join(", ")} for ${role}.`
      : `${name} needs a deeper skill review against ${role}.`,
    input.experience ? `Experience signal: ${input.experience}.` : "Experience details should be confirmed during screening.",
    input.noticePeriod ? `Joining readiness: notice period is ${input.noticePeriod}.` : "Notice period is not captured yet.",
    input.location ? `Location signal: ${input.location}.` : "Location fit should be verified before interview scheduling.",
    input.status ? `Current hiring stage: ${input.status}.` : "Stage is still open for employer review.",
  ];
  return {
    title: "JobiVerse fit explanation",
    summary: matched.length >= 2
      ? "JobiVerse view: profile has visible alignment, proceed with structured screening."
      : "JobiVerse view: profile should be screened carefully before moving ahead.",
    feedback,
  };
}

export function jobiverseApplicationFeedback(status?: string | null, jobTitle?: string | null) {
  const value = String(status ?? "Applied").toLowerCase();
  const role = jobTitle || "this role";
  if (value.includes("reject")) return {
    tone: "red",
    title: "JobiVerse feedback",
    message: `This application for ${role} is closed. Improve role-fit keywords, resume clarity and interview readiness before applying to similar roles.`,
    action: "Use JobiVerse resume and career guidance to strengthen the next application.",
  };
  if (value.includes("interview")) return {
    tone: "violet",
    title: "JobiVerse feedback",
    message: `You are in interview movement for ${role}. Prepare role stories, projects, notice period answer and salary expectation clearly.`,
    action: "Book JobiVerse interview tips if you want guided preparation.",
  };
  if (value.includes("offer") || value.includes("selected")) return {
    tone: "emerald",
    title: "JobiVerse feedback",
    message: `Good movement on ${role}. Keep documents, joining date and negotiation points ready.`,
    action: "Use JobiVerse offer guidance if you need support before acceptance.",
  };
  if (value.includes("short") || value.includes("screen") || value.includes("review")) return {
    tone: "amber",
    title: "JobiVerse feedback",
    message: `Your application for ${role} is being evaluated. Strong profile completeness and clear proof links improve confidence.`,
    action: "Update your JobiVerse Card and resume if anything important is missing.",
  };
  return {
    tone: "blue",
    title: "JobiVerse feedback",
    message: `Application sent for ${role}. Keep your JobiVerse Card updated so employers can assess your fit faster.`,
    action: "Track status here and continue applying to relevant roles.",
  };
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
