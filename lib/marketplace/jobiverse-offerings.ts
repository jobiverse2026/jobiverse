type JobiVerseOffer = { price: number; priceLabel?: string; description: string; delivery: string };

const offers: Record<string, JobiVerseOffer> = {
  "Editable CV Template": { price: 299, description: "A premium editable CV template curated by the JobiVerse career team.", delivery: "Instant access" },
  "Resume Writing": { price: 1499, description: "A personally written ATS-ready professional resume with one consultation and two revisions.", delivery: "3 working days" },
  "Resume Review & Optimization": { price: 699, description: "Detailed resume audit, ATS optimization and actionable content improvements.", delivery: "2 working days" },
  "Cover Letter Writing": { price: 599, description: "A personalized, role-specific cover letter aligned with your target opportunity.", delivery: "2 working days" },
  "LinkedIn Profile Optimization": { price: 999, description: "Complete LinkedIn positioning, headline, About section and keyword optimization.", delivery: "3 working days" },
  "Portfolio Building": { price: 1499, description: "Professional portfolio structure and content guidance for your strongest work.", delivery: "5 working days" },
  "Career Guidance": { price: 999, description: "A personal 60-minute career strategy session with a JobiVerse consultant.", delivery: "60 min session" },
  "Career Transition Consulting": { price: 1499, description: "A practical transition plan covering positioning, skill gaps and job-search execution.", delivery: "75 min session" },
  "Interview Preparation": { price: 1499, description: "Role-focused interview strategy, question preparation and personalized coaching.", delivery: "2 sessions" },
  "Mock Interview": { price: 999, description: "A realistic mock interview with structured written and verbal feedback.", delivery: "60 min session" },
  "Salary Negotiation Coaching": { price: 999, description: "Offer evaluation and a personalized compensation negotiation strategy.", delivery: "45 min session" },
  "Skill Gap Analysis": { price: 799, description: "Target-role skill assessment with a prioritized improvement roadmap.", delivery: "2 working days" },
  "Industry Mentorship": { price: 1499, description: "One-to-one practical mentorship with a JobiVerse domain professional.", delivery: "60 min session" },
  "Leadership Coaching": { price: 2499, description: "Focused coaching for managers, senior professionals and emerging leaders.", delivery: "75 min session" },
  "Personal Branding": { price: 1499, description: "A unified professional positioning strategy across resume, LinkedIn and portfolio.", delivery: "5 working days" },
  "Student Resume Building": { price: 799, description: "A strong ATS-ready fresher resume built around academics, projects and potential.", delivery: "3 working days" },
  "Fresher Resume Review": { price: 499, description: "Detailed fresher resume review with improvements for projects, skills and presentation.", delivery: "2 working days" },
  "Career Discovery Session": { price: 499, description: "A guided session to identify suitable roles using interests, strengths and goals.", delivery: "45 min session" },
  "First Job Preparation": { price: 999, description: "A complete first-job plan covering profile, search strategy and interview readiness.", delivery: "2 sessions" },
  "Campus Interview Preparation": { price: 799, description: "Focused preparation for campus HR, aptitude and placement interview rounds.", delivery: "60 min session" },
  "Fresher Mock Interview": { price: 599, description: "A confidence-building fresher mock interview with practical feedback.", delivery: "45 min session" },
  "Internship Guidance": { price: 499, description: "Personalized internship search, profile and application strategy.", delivery: "45 min session" },
  "Project & Portfolio Guidance": { price: 799, description: "Expert guidance for selecting and presenting projects professionally.", delivery: "60 min session" },
  "Skill Roadmap": { price: 599, description: "A practical role-based learning roadmap with milestones and priorities.", delivery: "2 working days" },
  "Employability Assessment": { price: 499, description: "A structured job-readiness assessment with an actionable improvement report.", delivery: "2 working days" },
  "Study & Course Guidance": { price: 499, description: "Unbiased course selection guidance aligned with career outcomes.", delivery: "45 min session" },
  "Communication Coaching": { price: 799, description: "Personal coaching for professional speaking and interview communication.", delivery: "60 min session" },
  "Personal Mentorship": { price: 999, description: "A personal early-career mentorship session with clear next steps.", delivery: "60 min session" },
  "Job Description Writing": { price: 1499, description: "A market-ready, inclusive job description written by JobiVerse hiring consultants.", delivery: "2 working days" },
  "Hiring Consultation": { price: 0, priceLabel: "Commercial fee | Negotiable", description: "A focused hiring strategy consultation covering role clarity, process and market fit. Scope and commercial terms are finalized privately after understanding the requirement.", delivery: "Consultation" },
  "Candidate Screening": { price: 499, priceLabel: "INR 499 / profile", description: "Structured candidate screening against your role requirements and scorecard.", delivery: "Per profile" },
  "Technical Interview Support": { price: 1499, priceLabel: "INR 1,499 / interview", description: "Independent technical interview support with structured evaluation feedback.", delivery: "Per interview" },
  "HR Interview Support": { price: 999, priceLabel: "INR 999 / interview", description: "Behavioral, motivation and culture-fit interview support from JobiVerse.", delivery: "Per interview" },
  "Interview Framework Design": { price: 4999, description: "Complete interview stages, scorecards, competency criteria and decision framework.", delivery: "5 working days" },
  "Recruitment Process Audit": { price: 9999, description: "End-to-end recruitment workflow audit with prioritized recommendations.", delivery: "7 working days" },
  "Talent Market Mapping": { price: 14999, priceLabel: "From INR 14,999 / role", description: "Target-company, talent-pool and availability mapping for one critical role.", delivery: "10 working days" },
  "Compensation Benchmarking": { price: 7499, priceLabel: "From INR 7,499 / role", description: "Market-aligned compensation benchmark and hiring budget recommendation.", delivery: "7 working days" },
  "Employer Branding Consultation": { price: 14999, description: "Employer value proposition and candidate-experience improvement consulting.", delivery: "Project based" },
  "Bulk Hiring Support": { price: 0, priceLabel: "Success fee percentage | Negotiable", description: "Success-based volume hiring support. No placement, no professional fee. Commercial percentage is finalized privately based on hiring volume and role complexity.", delivery: "Success based" },
  "Executive Search Consulting": { price: 0, priceLabel: "Success fee percentage | Negotiable", description: "Confidential leadership search with market mapping and managed engagement. Commercial percentage is finalized privately for each mandate.", delivery: "Success based" },
};

export function getJobiVerseOffer(category: string | null) {
  return category ? offers[category] ?? null : null;
}




