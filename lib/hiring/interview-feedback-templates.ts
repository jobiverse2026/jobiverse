export const interviewFeedbackTemplates = [
  {
    key: "technical-fit",
    title: "Technical fit",
    summary: "Use after a technical or functional round.",
    body: "Technical strength:\nRelevant project exposure:\nProblem-solving quality:\nGaps observed:\nRecommendation:",
  },
  {
    key: "communication",
    title: "Communication",
    summary: "Use when communication, clarity or confidence matters.",
    body: "Communication clarity:\nConfidence level:\nListening and response quality:\nStakeholder readiness:\nRecommendation:",
  },
  {
    key: "salary-notice",
    title: "Salary & notice fit",
    summary: "Use before offer movement or negotiation.",
    body: "Current/expected compensation fit:\nNotice period fit:\nJoining risk:\nNegotiation notes:\nRecommendation:",
  },
  {
    key: "culture-fit",
    title: "Culture fit",
    summary: "Use for team, ownership and long-term fitment.",
    body: "Ownership mindset:\nTeam collaboration:\nWork style fit:\nStability indicators:\nRecommendation:",
  },
  {
    key: "final-recommendation",
    title: "Final recommendation",
    summary: "Use when deciding select, hold or reject.",
    body: "Overall interview outcome:\nStrong reasons to proceed:\nRisks or concerns:\nNext action:\nFinal recommendation:",
  },
] as const;

export type InterviewFeedbackTemplateKey = (typeof interviewFeedbackTemplates)[number]["key"];
