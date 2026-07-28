export const JOB_COLLECTIONS = [
  { value: "freshers", label: "Freshers & first jobs", description: "Entry-level roles, graduate opportunities and early-career openings." },
  { value: "remote", label: "Remote opportunities", description: "Roles that can be performed remotely or from anywhere." },
  { value: "internships", label: "Internships", description: "Practical learning, trainee and internship opportunities." },
  { value: "new", label: "New this week", description: "Freshly published or recently updated opportunities." },
  { value: "leadership", label: "Leadership roles", description: "Manager, head, director and executive opportunities." },
  { value: "future-tech", label: "AI & future technology", description: "AI, data, cloud, cyber and emerging-technology roles." },
] as const;

export type JobCollection = (typeof JOB_COLLECTIONS)[number]["value"];

export function getJobCollection(value?: string | null) {
  return JOB_COLLECTIONS.find((collection) => collection.value === value);
}

export function matchesJobCollection(input: {
  title?: string | null;
  description?: string | null;
  type?: string | null;
  experience?: string | null;
  workMode?: string | null;
  updated?: string | null;
}, collection?: string | null) {
  if (!collection) return true;
  const text = `${input.title ?? ""} ${input.description ?? ""} ${input.type ?? ""} ${input.experience ?? ""} ${input.workMode ?? ""}`.toLowerCase();
  if (collection === "freshers") return /fresher|entry.?level|graduate|trainee|0\s*(?:-|to)\s*2\s*years?|no experience/.test(text);
  if (collection === "remote") return /remote|work from home|anywhere|worldwide/.test(text);
  if (collection === "internships") return /intern|internship|apprentice/.test(text);
  if (collection === "leadership") return /\bmanager\b|senior manager|head of|director|vice president|\bvp\b|chief|\bcxo\b/.test(text);
  if (collection === "future-tech") return /artificial intelligence|machine learning|\bai\b|\bml\b|data science|cloud|cyber|blockchain|robotics|generative/.test(text);
  if (collection === "new") {
    if (!input.updated) return false;
    const time = new Date(input.updated).getTime();
    return Number.isFinite(time) && time >= Date.now() - 7 * 86_400_000;
  }
  return true;
}
