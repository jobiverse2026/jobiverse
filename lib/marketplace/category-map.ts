const categoryGroups: Record<string, string[]> = {
  "resume-builder": ["Resume Writing", "Resume Review & Optimization", "Cover Letter Writing", "Student Resume Building", "Fresher Resume Review"],
  "cv-templates": ["Editable CV Template"],
  "linkedin-optimization": ["LinkedIn Profile Optimization", "Personal Branding"],
  "portfolio-building": ["Portfolio Building", "Project & Portfolio Guidance"],
  "career-guidance": ["Career Guidance", "Career Transition Consulting", "Career Discovery Session", "First Job Preparation", "Internship Guidance", "Study & Course Guidance", "Personal Mentorship"],
  "interview-preparation": ["Interview Preparation", "Mock Interview", "Campus Interview Preparation", "Fresher Mock Interview", "Communication Coaching", "Salary Negotiation Coaching"],
  "skill-roadmaps": ["Skill Gap Analysis", "Skill Roadmap"],
  "employability-check": ["Employability Assessment"],
  "career-mentorship": ["Industry Mentorship", "Leadership Coaching"],
  "job-description-writing": ["Job Description Writing"],
  "hiring-consultation": ["Hiring Consultation", "Interview Framework Design", "Recruitment Process Audit", "Talent Market Mapping", "Compensation Benchmarking", "Employer Branding Consultation", "Bulk Hiring Support", "Executive Search Consulting"],
  "candidate-screening": ["Candidate Screening", "Technical Interview Support", "HR Interview Support"],
};

export function categoryBelongsToService(category: string, serviceSlug: string) {
  return categoryGroups[serviceSlug]?.includes(category) ?? false;
}

export function serviceSlugForCategory(category: string) {
  return Object.entries(categoryGroups).find(([, categories]) => categories.includes(category))?.[0] ?? "career-guidance";
}

export function categoriesForService(serviceSlug: string) {
  return categoryGroups[serviceSlug] ?? [];
}
