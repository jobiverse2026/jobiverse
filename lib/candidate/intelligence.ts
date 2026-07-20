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
  const checks = [
    Boolean(profile?.headline),
    Boolean(profile?.phone),
    Boolean(profile?.current_location),
    Boolean(profile?.total_experience),
    Boolean(profile?.primary_skills),
    Boolean(profile?.preferred_roles),
    Boolean(profile?.notice_period),
    Boolean(profile?.resume_path),
    Boolean(profile?.open_to_work),
    Boolean(profile?.interview_availability),
    Boolean(profile?.deal_breakers || profile?.expected_salary_min || profile?.expected_ctc || profile?.work_mode),
    Boolean(profile?.linkedin || profile?.portfolio_url),
    verifiedItems > 0,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const missing = [
    !profile?.resume_path && "Upload your latest CV",
    !profile?.primary_skills && "Add top skills",
    !profile?.preferred_roles && "Add preferred roles",
    !profile?.notice_period && "Add notice period",
    !profile?.interview_availability && "Add interview availability",
    !profile?.deal_breakers && "Add deal-breakers",
    !profile?.open_to_work && "Switch on Open to Work when ready",
  ].filter(Boolean) as string[];
  return { score, missing: missing.slice(0, 4) };
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
