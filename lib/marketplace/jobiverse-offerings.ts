type JobiVerseOffer = { price: number; priceLabel?: string; description: string; delivery: string };

const offers: Record<string, JobiVerseOffer> = {
  "Editable CV Template": { price: 0, priceLabel: "CV templates on portal", description: "A premium editable CV template curated by the JobiVerse career team.", delivery: "Instant access" },
  "Resume Writing": { price: 299, description: "Professional ATS-ready resume writing from scratch.", delivery: "3 working days" },
  "Resume Review & Optimization": { price: 299, description: "Expert resume review and improvement of your existing resume.", delivery: "2 working days" },
  "Cover Letter Writing": { price: 149, description: "Role-specific cover letter with compelling positioning.", delivery: "2 working days" },
  "LinkedIn Profile Optimization": { price: 299, description: "Stronger visibility, credibility and recruiter discovery.", delivery: "3 working days" },
  "Portfolio Building": { price: 499, description: "Premium portfolio guidance for projects and achievements.", delivery: "5 working days" },
  "Career Guidance": { price: 299, description: "Personalized role selection and practical career planning.", delivery: "60 min session" },
  "Career Transition Consulting": { price: 999, description: "A practical plan for moving into a new role or industry.", delivery: "75 min session" },
  "Interview Preparation": { price: 299, description: "Structured preparation for upcoming interviews.", delivery: "60 min session" },
  "Mock Interview": { price: 599, description: "Role-specific interview practice with actionable feedback.", delivery: "60 min session" },
  "Salary Negotiation Coaching": { price: 499, description: "Preparation for compensation and offer conversations.", delivery: "45 min session" },
  "Skill Gap Analysis": { price: 499, description: "Focused assessment and skill-development roadmap.", delivery: "2 working days" },
  "Industry Mentorship": { price: 499, description: "One-to-one guidance from experienced professionals.", delivery: "60 min session" },
  "Leadership Coaching": { price: 1999, description: "Support for managers and senior professionals.", delivery: "75 min session" },
  "Personal Branding": { price: 999, description: "A consistent and credible professional identity.", delivery: "5 working days" },
  "Student Resume Building": { price: 299, description: "Strong first resume building for limited experience.", delivery: "3 working days" },
  "Fresher Resume Review": { price: 199, description: "Improve projects, skills and ATS readiness.", delivery: "2 working days" },
  "Career Discovery Session": { price: 299, description: "Explore career paths based on strengths.", delivery: "45 min session" },
  "First Job Preparation": { price: 499, description: "A complete strategy for entering the workforce.", delivery: "2 sessions" },
  "Campus Interview Preparation": { price: 299, description: "Aptitude, HR and placement interview practice.", delivery: "60 min session" },
  "Fresher Mock Interview": { price: 499, description: "Confidence through realistic interview practice.", delivery: "45 min session" },
  "Internship Guidance": { price: 299, description: "Plan, search and prepare for valuable internships.", delivery: "45 min session" },
  "Project & Portfolio Guidance": { price: 499, description: "Present academic and personal projects professionally.", delivery: "60 min session" },
  "Skill Roadmap": { price: 499, description: "A practical learning plan for a target role.", delivery: "2 working days" },
  "Employability Assessment": { price: 299, description: "Evaluate job readiness and improvement areas.", delivery: "2 working days" },
  "Study & Course Guidance": { price: 299, description: "Choose courses aligned with career outcomes.", delivery: "45 min session" },
  "Communication Coaching": { price: 499, description: "Improve professional and interview communication.", delivery: "60 min session" },
  "Personal Mentorship": { price: 499, description: "Ongoing guidance during early career decisions.", delivery: "60 min session" },
  "Job Description Writing": { price: 499, description: "Clear, market-ready job descriptions.", delivery: "2 working days" },
  "Hiring Consultation": { price: 999, description: "Requirement, process and talent strategy support.", delivery: "Consultation" },
  "Candidate Screening": { price: 499, priceLabel: "INR 499 / profile", description: "Profile evaluation against role requirements.", delivery: "Per profile" },
  "Technical Interview Support": { price: 999, priceLabel: "INR 999 / interview", description: "Structured technical interview support.", delivery: "Per interview" },
  "HR Interview Support": { price: 799, priceLabel: "INR 799 / interview", description: "Behavioral and culture-fit assessment.", delivery: "Per interview" },
  "Interview Framework Design": { price: 1999, description: "Consistent scorecards and evaluation criteria.", delivery: "5 working days" },
  "Recruitment Process Audit": { price: 2999, description: "Review and improve the hiring workflow.", delivery: "7 working days" },
  "Talent Market Mapping": { price: 2999, description: "Talent, competitor and market intelligence.", delivery: "10 working days" },
  "Compensation Benchmarking": { price: 1999, description: "Realistic and competitive salary ranges.", delivery: "7 working days" },
  "Employer Branding Consultation": { price: 2999, description: "Improve candidate perception of the organization.", delivery: "Project based" },
  "Bulk Hiring Support": { price: 4999, description: "Structured high-volume hiring execution.", delivery: "Project based" },
  "Executive Search Consulting": { price: 4999, description: "Leadership and specialized hiring advisory.", delivery: "Project based" },
};

export function getJobiVerseOffer(category: string | null) {
  return category ? offers[category] ?? null : null;
}



