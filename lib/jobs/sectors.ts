export const JOB_SECTORS = [
  { value: "it-software", label: "IT & Software", searchTerm: "software", keywords: ["software", "developer", "engineer", "technology", "information technology", "data", "cloud", "devops", "cyber", "product manager", "qa", "testing", "artificial intelligence", "machine learning", "frontend", "backend", "full stack"] },
  { value: "healthcare", label: "Healthcare & Medical", searchTerm: "healthcare", keywords: ["healthcare", "medical", "hospital", "doctor", "nurse", "pharma", "pharmaceutical", "clinical", "dentist", "physiotherapist", "laboratory", "radiology", "patient care"] },
  { value: "bfsi", label: "Banking, Finance & Insurance", searchTerm: "banking", keywords: ["banking", "bank", "finance", "financial", "insurance", "fintech", "accountant", "accounting", "audit", "tax", "investment", "credit", "loan", "wealth", "risk"] },
  { value: "engineering-manufacturing", label: "Engineering & Manufacturing", searchTerm: "manufacturing", keywords: ["manufacturing", "mechanical", "electrical", "electronics", "automobile", "automotive", "production", "plant", "quality engineer", "industrial", "chemical engineer", "maintenance engineer"] },
  { value: "sales-marketing", label: "Sales & Marketing", searchTerm: "sales", keywords: ["sales", "marketing", "business development", "growth", "digital marketing", "seo", "performance marketing", "brand", "advertising", "account executive", "relationship manager"] },
  { value: "hr-recruitment", label: "HR & Recruitment", searchTerm: "human resources", keywords: ["human resources", " hr ", "recruiter", "recruitment", "talent acquisition", "payroll", "employee relations", "people operations", "learning and development"] },
  { value: "operations-supply-chain", label: "Operations & Supply Chain", searchTerm: "operations", keywords: ["operations", "supply chain", "logistics", "procurement", "warehouse", "inventory", "transport", "vendor management", "process management"] },
  { value: "education-training", label: "Education & Training", searchTerm: "education", keywords: ["education", "teacher", "teaching", "faculty", "professor", "trainer", "academic", "school", "college", "university", "curriculum", "edtech", "counsellor"] },
  { value: "legal-compliance", label: "Legal & Compliance", searchTerm: "legal", keywords: ["legal", "lawyer", "advocate", "attorney", "compliance", "company secretary", "contract management", "paralegal", "regulatory"] },
  { value: "hospitality-travel", label: "Hospitality & Travel", searchTerm: "hospitality", keywords: ["hospitality", "hotel", "restaurant", "travel", "tourism", "chef", "food and beverage", "front office", "housekeeping", "airline", "aviation"] },
  { value: "construction-real-estate", label: "Construction & Real Estate", searchTerm: "construction", keywords: ["construction", "civil engineer", "real estate", "property", "architect", "architecture", "site engineer", "quantity surveyor", "interior designer"] },
  { value: "creative-media", label: "Creative, Design & Media", searchTerm: "design", keywords: ["creative", "graphic designer", "design", "media", "content writer", "copywriter", "video editor", "animation", "photography", "journalist", "social media", "ui ux"] },
  { value: "customer-support", label: "Customer Support & BPO", searchTerm: "customer support", keywords: ["customer support", "customer service", "call center", "call centre", "bpo", "voice process", "helpdesk", "client support", "technical support"] },
  { value: "retail-ecommerce", label: "Retail & E-commerce", searchTerm: "retail", keywords: ["retail", "ecommerce", "e-commerce", "store manager", "merchandising", "category manager", "marketplace", "fashion", "fmcg"] },
] as const;

export type JobSectorValue = (typeof JOB_SECTORS)[number]["value"];

export function getJobSector(value?: string) {
  return JOB_SECTORS.find((sector) => sector.value === value);
}

export function matchesJobSector(value: string, sectorValue?: string) {
  const sector = getJobSector(sectorValue);
  if (!sector) return true;
  const normalized = ` ${value.toLowerCase().replace(/[^a-z0-9+#]+/g, " ")} `;
  return sector.keywords.some((keyword) => normalized.includes(keyword.toLowerCase().replace(/[^a-z0-9+#]+/g, " ")));
}

export function sectorSearchKeywords(keywords: string, sectorValue?: string) {
  const sector = getJobSector(sectorValue);
  return [keywords.trim(), sector?.searchTerm].filter(Boolean).join(" ");
}
