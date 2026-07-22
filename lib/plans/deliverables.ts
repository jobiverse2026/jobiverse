export type PlanChecklist = {
  summary: string;
  deliverables: string[];
};

export function planChecklist(slug?: string | null, name?: string | null): PlanChecklist {
  switch (slug) {
    case "employer-starter":
      return {
        summary: "Employer Starter workspace request. Verify company intent, then guide them to company profile + first requirement.",
        deliverables: [
          "Confirm company details and business email.",
          "Ensure master employer access is correct.",
          "Guide employer to submit first hiring requirement.",
          "Keep Talent Search locked unless paid separately.",
        ],
      };
    case "employer-growth":
      return {
        summary: "Employer Growth subscription request. This is the main paid employer operating plan.",
        deliverables: [
          "Verify payment or commercial approval.",
          "Activate company plan for one month/year as agreed.",
          "Confirm included master employer access.",
          "Set employer and recruiter seat limits as per purchased seats.",
          "Explain reports, requirement tracking and hiring funnel usage.",
          "Keep JobiVerse hiring success fee separate from subscription.",
        ],
      };
    case "employer-enterprise":
      return {
        summary: "Enterprise/custom employer request. Needs direct JobiVerse follow-up and custom commercials.",
        deliverables: [
          "Call/email the company for hiring volume and workflow needs.",
          "Prepare custom seat limits, departments and reporting scope.",
          "Define ATS/CRM access, support SLA and account manager ownership.",
          "Confirm recruitment success fee terms separately.",
          "Document custom terms in admin note before activating.",
        ],
      };
    case "employer-talent-search":
      return {
        summary: "Paid Talent Search access request. Unlock only after payment/admin approval.",
        deliverables: [
          "Verify payment for Talent Search Access.",
          "Approve Talent Search for the company/master employer.",
          "Confirm allowed users and seat access.",
          "Remind employer that only Open to Work profiles are searchable.",
          "Monitor usage and contact unlock requests through JobiVerse.",
        ],
      };
    case "employer-seat":
      return {
        summary: "Extra employer seat request.",
        deliverables: [
          "Verify ₹2,000/year per employer seat payment.",
          "Increase employer seat limit for the company.",
          "Confirm only master employer can invite employer users.",
          "Invited employer users should not be able to invite more employers.",
        ],
      };
    case "recruiter-seat":
      return {
        summary: "Extra recruiter seat request.",
        deliverables: [
          "Verify ₹1,000/year per recruiter seat payment.",
          "Increase recruiter seat limit for the company or assigned employer.",
          "Confirm recruiter login access only, not employer/admin access.",
          "Recruiters should see only assigned requirements and submissions.",
        ],
      };
    case "career-plus":
      return {
        summary: "Candidate Career Plus request. Job applications remain free; paid value is guidance and visibility.",
        deliverables: [
          "Verify subscription/payment approval.",
          "Enable Career Plus support note for the user.",
          "Offer career score/profile improvement guidance.",
          "Prioritize service recommendations and career nudges.",
          "Do not promise job placement.",
        ],
      };
    case "career-pro":
      return {
        summary: "Candidate Career Pro request. Higher-touch career support.",
        deliverables: [
          "Verify payment approval.",
          "Schedule monthly resume/interview/career support as promised.",
          "Review JobiVerse Card/profile completeness.",
          "Suggest relevant paid JobiVerse services if needed.",
          "Track consultation/service completion manually until automation is added.",
        ],
      };
    case "fresher-pro-pack":
      return {
        summary: "Student/Fresher Pro Pack request.",
        deliverables: [
          "Verify payment or campus approval.",
          "Help user with fresher resume, first-job preparation and project presentation.",
          "Share internship/job application roadmap.",
          "Recommend mock interview or campus interview practice if needed.",
        ],
      };
    default:
      return {
        summary: `${name || "Plan"} request. Review payment/commercials and activate only if valid.`,
        deliverables: [
          "Verify payment or approved commercial terms.",
          "Check user role and account access.",
          "Add admin note with what was approved.",
          "Notify user after activation/rejection.",
        ],
      };
  }
}
