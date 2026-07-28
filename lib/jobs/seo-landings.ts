export const JOB_CITY_LANDINGS = [
  { slug: "mumbai", name: "Mumbai", summary: "India's financial and commercial centre with opportunities across BFSI, technology, media, healthcare, retail and operations." },
  { slug: "delhi-ncr", name: "Delhi NCR", summary: "A broad employment region spanning Delhi, Noida and Gurugram across consulting, technology, sales, manufacturing and services." },
  { slug: "bengaluru", name: "Bengaluru", summary: "A leading technology and startup ecosystem for software, data, AI, product, finance and business roles." },
  { slug: "hyderabad", name: "Hyderabad", summary: "A fast-growing centre for technology, pharmaceuticals, healthcare, operations and global capability teams." },
  { slug: "pune", name: "Pune", summary: "A diverse market for automotive, manufacturing, software, education, finance and business services." },
  { slug: "chennai", name: "Chennai", summary: "A major market for automotive, manufacturing, SaaS, healthcare, banking and operations careers." },
  { slug: "kolkata", name: "Kolkata", summary: "Explore opportunities across finance, education, healthcare, retail, logistics, technology and creative work." },
  { slug: "ahmedabad", name: "Ahmedabad", summary: "A growing centre for manufacturing, pharmaceuticals, finance, technology, sales and supply-chain careers." },
] as const;

export const JOB_ROLE_LANDINGS = [
  { slug: "software-engineer", name: "Software Engineer", query: "software engineer", sector: "it-software", summary: "Explore frontend, backend, full-stack, mobile, cloud and platform engineering opportunities." },
  { slug: "data-ai", name: "Data & AI", query: "data AI", sector: "it-software", summary: "Find data engineering, analytics, machine learning, AI and data-science opportunities." },
  { slug: "sales-business-development", name: "Sales & Business Development", query: "sales business development", sector: "sales-marketing", summary: "Discover B2B, B2C, account management, inside sales and business-development roles." },
  { slug: "marketing", name: "Marketing", query: "marketing", sector: "sales-marketing", summary: "Explore growth, brand, digital, content, performance and product-marketing careers." },
  { slug: "human-resources", name: "Human Resources", query: "human resources", sector: "hr-recruitment", summary: "Find HR operations, talent acquisition, people partnership, payroll and L&D roles." },
  { slug: "finance-accounting", name: "Finance & Accounting", query: "finance accounting", sector: "bfsi", summary: "Explore accounting, audit, taxation, banking, risk, investment and corporate-finance roles." },
  { slug: "healthcare", name: "Healthcare", query: "healthcare", sector: "healthcare", summary: "Discover clinical, hospital, pharmaceutical, laboratory and healthcare-operations careers." },
  { slug: "operations-supply-chain", name: "Operations & Supply Chain", query: "operations supply chain", sector: "operations-supply-chain", summary: "Find operations, procurement, logistics, warehouse, vendor and process-management roles." },
] as const;

export function getCityLanding(slug: string) { return JOB_CITY_LANDINGS.find(item => item.slug === slug); }
export function getRoleLanding(slug: string) { return JOB_ROLE_LANDINGS.find(item => item.slug === slug); }

