import {
  Briefcase,
  CalendarDays,
  FileText,
  GraduationCap,
  Building2,
  Users,
  Search,
  Sparkles,
  Target,
  UserRound,
  Mail,
  Compass,
  WandSparkles,
  Bookmark,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";


export type NavChild = {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon?: React.ElementType;
};


export type NavItem = {
  title: string;
  href?: string;
  children?: NavChild[];
};

export const publicNavigation: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Jobs", href: "/jobs" },
  {
    title: "Career Growth",
    children: [
      { title: "Students & Graduates", description: "Fresh jobs, first resumes and early-career guidance.", href: "/students", icon: GraduationCap },
      { title: "Professionals", description: "Opportunities, career identity and professional growth.", href: "/candidates", icon: Briefcase },
      { title: "Career Services", description: "Resume, interview, LinkedIn and career support.", href: "/career-services", icon: Compass },
    ],
  },
  { title: "Hire Talent", href: "/employers" },
  { title: "Create & Earn", href: "/earn-with-jobiverse" },
  {
    title: "Explore More",
    children: [
      { title: "Help & Guides", description: "Learn every JobiVerse workflow.", href: "/guides", icon: FileText },
      { title: "Campus Partnerships", description: "Placement programmes for institutions.", href: "/campus-partnerships", icon: GraduationCap },
      { title: "Pricing", description: "Plans, services and premium unlocks.", href: "/pricing", icon: Target },
      { title: "Events & Workshops", description: "Career clinics, webinars and hiring drives.", href: "/events", icon: Sparkles },
      { title: "Consultations", description: "Focused career and hiring guidance.", href: "/consultations", icon: UserRound },
      { title: "Why JobiVerse", description: "Trust, protection and platform intelligence.", href: "/why-jobiverse", icon: ShieldCheck },
    ],
  },
  { title: "About Us", href: "/about" },
];

const mainSiteMenu: NavChild[] = [
  { title: "Help & Guides", description: "Role-specific JobiVerse product guides.", href: "/guides", icon: FileText },
  { title: "Student Guide", description: "A first-career path from profile to placement.", href: "/guides/student", icon: GraduationCap },
  { title: "Home", description: "Return to the JobiVerse homepage.", href: "/", icon: Sparkles },
  { title: "Jobs", description: "Explore direct and clearly attributed partner opportunities.", href: "/jobs", icon: Briefcase },
  { title: "Services", description: "Explore services for every JobiVerse audience.", href: "/services", icon: Compass },
  { title: "Pricing", description: "Paid plans, marketplace earnings and premium unlocks.", href: "/pricing", icon: Target },
  { title: "Professionals", description: "Career opportunities and professional support.", href: "/candidates", icon: Briefcase },
  { title: "Students", description: "Career tools for students and recent graduates.", href: "/students", icon: GraduationCap },
  { title: "Campus Partnerships", description: "Institution programmes, placement support and campus collaboration.", href: "/campus-partnerships", icon: GraduationCap },
  { title: "Events", description: "Workshops, career clinics, webinars and hiring drives.", href: "/events", icon: Sparkles },
  { title: "Employers", description: "Recruitment and employer hiring solutions.", href: "/employers", icon: Building2 },
  { title: "Earn", description: "Create, contribute and earn with JobiVerse.", href: "/earn-with-jobiverse", icon: WandSparkles },
  { title: "About Us", description: "Our universe, mission, vision and contact details.", href: "/about", icon: UserRound },
  { title: "Why JobiVerse", description: "Trust, protection and intelligence behind the platform.", href: "/why-jobiverse", icon: ShieldCheck },
  { title: "Responsible AI", description: "Understand JobiVerse AI features, safeguards and launch status.", href: "/ai", icon: Sparkles },
];

export const marketplaceNavigation: NavItem[] = [
  { title: "Professionals", href: "/marketplace#for-professionals" },
  { title: "Students", href: "/marketplace#for-students" },
  { title: "Employers", href: "/marketplace#for-employers" },
  { title: "Main Site", href: "/" },
];

export const roleNavigation: Record<"candidate" | "employer" | "recruiter" | "admin" | "creator", NavItem[]> = {
  candidate: [
    { title: "Dashboard", href: "/candidates/dashboard" },
    { title: "Candidate Guide", href: "/guides/candidate" },
    { title: "Explore Opportunities", href: "/jobs" },
    { title: "Career", children: [
      { title: "Jobs", description: "Discover direct and partner opportunities.", href: "/jobs", icon: Briefcase },
      { title: "Job Alerts", description: "Set role, location and work-mode alerts.", href: "/candidates/job-alerts", icon: Sparkles },
      { title: "Saved Jobs", description: "Return to opportunities saved for later.", href: "/candidates/saved-jobs", icon: Bookmark },
      { title: "Applications", description: "Track applications, interviews and offers.", href: "/candidates/applications", icon: Target },
      { title: "Card Analytics", description: "Track public JobiVerse Card views.", href: "/candidates/card-analytics", icon: Search },
      { title: "Resume Studio", description: "Manage resumes and premium templates.", href: "/candidates/resume", icon: FileText },
      { title: "Consultations", description: "Book and track personal guidance.", href: "/consultations/my", icon: UserRound },
      { title: "Plans", description: "Optional career support memberships.", href: "/plans", icon: Sparkles },
      { title: "Referrals", description: "Invite professionals and track activity.", href: "/referrals", icon: Users },
      { title: "Events", description: "Workshops, clinics and hiring drives.", href: "/events", icon: GraduationCap },
    ]},
    { title: "Services", href: "/marketplace#for-professionals" },
    { title: "My Orders", href: "/marketplace/orders" },
    { title: "Main Site", children: mainSiteMenu },
  ],
  employer: [
    { title: "Dashboard", href: "/employers/dashboard" },
    { title: "Employer Guide", href: "/guides/employer" },
    { title: "Hiring", children: [
      { title: "Requirements", description: "Create and track hiring mandates.", href: "/employers/requirements", icon: Briefcase },
      { title: "Candidates", description: "Review submitted talent and offers.", href: "/employers/candidates", icon: Users },
      { title: "Interview Calendar", description: "View upcoming interviews and same-day reminders.", href: "/employers/interviews", icon: CalendarDays },
      { title: "Talent Search", description: "Locked until paid access is approved by JobiVerse admin.", href: "/employers/talent-search", icon: LockKeyhole },
      { title: "Reports", description: "Track recruiter performance and requirement fulfilment.", href: "/employers/reports", icon: FileText },
      { title: "Team Seats", description: "Invite specific recruiters to your employer workspace.", href: "/employers/team", icon: UserRound },
      { title: "Company Profile", description: "Manage your verified organization profile.", href: "/employers/company", icon: Building2 },
    ]},
    { title: "Business Services", children: [
      { title: "Employer Services", description: "Explore hiring and people advisory support.", href: "/marketplace?audience=employer", icon: Compass },
      { title: "Consultations", description: "Book JobiVerse hiring guidance.", href: "/consultations/my", icon: UserRound },
      { title: "Employer Plans", description: "Choose operational hiring support.", href: "/plans", icon: Target },
      { title: "Billing", description: "View statements and purchases.", href: "/employers/billing", icon: FileText },
    ]},
    { title: "Main Site", children: mainSiteMenu },
  ],
  recruiter: [
    { title: "Dashboard", href: "/recruiter" },
    { title: "Recruiter Guide", href: "/guides/recruiter" },
    { title: "Recruitment", children: [
      { title: "Requirements", description: "Work on assigned hiring roles.", href: "/recruiter/requirements", icon: Briefcase },
      { title: "Candidates", description: "Manage sourcing and delivery pipelines.", href: "/recruiter/candidates", icon: Users },
      { title: "Interview Calendar", description: "View upcoming interviews and same-day reminders.", href: "/recruiter/interviews", icon: CalendarDays },
      { title: "Talent Search", description: "Locked until employer Talent Search access is approved.", href: "/recruiter/talent-search", icon: LockKeyhole },
      { title: "Reports", description: "Review submissions, interview movement and fulfilment.", href: "/recruiter/reports", icon: FileText },
    ]},
    { title: "Main Site", children: mainSiteMenu },
  ],
  admin: [
    { title: "Dashboard", href: "/admin" },
    { title: "Operations", children: [
      { title: "JobiVerse Queue", description: "View only requirements assigned to JobiVerse Hiring Team.", href: "/admin/requirements", icon: Briefcase },
      { title: "Companies", description: "Review employer organizations.", href: "/admin/companies", icon: Building2 },
      { title: "JobiVerse Candidates", description: "Track candidates submitted by JobiVerse to employers.", href: "/admin/candidates", icon: Users },
      { title: "Protection Audit", description: "Audit JobiVerse introductions, commercial terms and protection windows.", href: "/admin/protection-audit", icon: ShieldCheck },
      { title: "Company Reports", description: "Review company-level hiring and performance reports.", href: "/admin/analytics", icon: FileText },
    ]},
    { title: "Platform", children: [
      { title: "Marketplace", description: "Moderate services and orders.", href: "/admin/marketplace", icon: Compass },
      { title: "Billing", description: "Manage placement billing.", href: "/admin/billing", icon: FileText },
      { title: "Events", description: "Publish workshops and hiring drives.", href: "/admin/events", icon: GraduationCap },
      { title: "AI Governance", description: "Control responsible AI activation.", href: "/admin/ai-governance", icon: Sparkles },
    ]},
    { title: "Main Site", children: mainSiteMenu },
  ],
  creator: [
    { title: "Dashboard", href: "/earn-with-jobiverse/dashboard" },
    { title: "Creator Guide", href: "/guides/creator" },
    { title: "Create Service", href: "/earn-with-jobiverse/dashboard/services/new" },
    { title: "Creator Business", children: [
      { title: "Negotiations", description: "Review customer offers and counters.", href: "/earn-with-jobiverse/dashboard/offers", icon: Users },
      { title: "Orders", description: "Deliver and manage paid work.", href: "/earn-with-jobiverse/dashboard/orders", icon: Briefcase },
      { title: "Availability", description: "Control booking capacity and schedule.", href: "/earn-with-jobiverse/dashboard/availability", icon: Target },
      { title: "Earnings", description: "Track revenue, payouts and statements.", href: "/earn-with-jobiverse/dashboard/earnings", icon: FileText },
      { title: "Payout Profile", description: "Manage verified payout details.", href: "/earn-with-jobiverse/dashboard/payout-profile", icon: UserRound },
    ]},
    { title: "Main Site", children: mainSiteMenu },
  ],
};



export const navigation: NavItem[] = [

  {
    title: "Home",
    href: "/",
  },


  {
    title: "Professionals",

    children: [

      {
        title: "Experienced Opportunities",
        description:
          "Discover opportunities for experienced professionals ready for their next move.",
        href: "/candidates",
        icon: Search,
      },

      {
        title: "CV & Resume Tools",
        description:
          "Build and optimize an achievement-led CV for your next career move.",
        href: "/career-services#professional-resume",
        icon: FileText,
      },

      {
        title: "Career Services",
        description:
          "Resume building, interview preparation and career guidance.",
        href: "/career-services",
        badge: "New",
        icon: GraduationCap,
      },

    ],
  },

  {
    title: "Students",
    children: [
      {
        title: "Student Career Hub",
        description: "Start your career journey with guidance built for students and recent graduates.",
        href: "/students",
        badge: "New",
        icon: GraduationCap,
      },
      {
        title: "Resume Maker",
        description: "Build an ATS-ready first resume that turns education and projects into potential.",
        href: "/students#resume-maker",
        icon: WandSparkles,
      },
      {
        title: "Career Guide",
        description: "Explore roles, skills and practical roadmaps before making your first move.",
        href: "/students#career-guide",
        icon: Compass,
      },
    ],
  },



  {
    title: "Employers",

    children: [

      {
        title: "Hire Talent",
        description:
          "Find skilled professionals across IT & Non-IT domains.",
        href: "/employers",
        icon: Users,
      },


      {
  title: "Submit Requirement",
  description:
    "Share your hiring needs with our recruitment experts.",
  href: "/employers/requirements/new",
  icon: Building2,
},


      {
        title: "Recruitment Solutions",
        description:
          "Flexible hiring solutions designed for business growth.",
        href: "/services",
        icon: Target,
      },

    ],
  },



  {
    title: "Services",

    children: [

      {
        title: "Recruitment",
        description:
          "Permanent hiring solutions across multiple industries.",
        href: "/services",
        icon: Briefcase,
      },


      {
        title: "Executive Search",
        description:
          "Leadership and strategic hiring solutions.",
        href: "/services#executive-search",
        icon: Target,
      },


      {
        title: "AI Powered Hiring",
        description:
          "Future-ready intelligent recruitment technology.",
        href: "/services#ai",
        badge: "AI",
        icon: Sparkles,
      },

    ],
  },

  {
    title: "EARN",
    href: "/earn-with-jobiverse",
  },



  {
    title: "Company",

    children: [

      {
        title: "About JobiVerse",
        description:
          "Discover our mission, vision and journey of building India's hiring ecosystem.",
        href: "/about",
        icon: UserRound,
      },


      {
        title: "Industries",
        description:
          "Explore the sectors we help companies hire exceptional talent for.",
        href: "/industries",
        icon: Building2,
      },


      {
        title: "Contact",
        description:
          "Connect with the JobiVerse team for hiring and career support.",
        href: "/contact",
        icon: Mail,
      },

    ],
  },

];





export const loginMenu = [
  { title: "Student Login", description: "Fresh jobs, applications and first-career tools.", href: "/login/student", icon: GraduationCap },
  { title: "Professional Login", description: "Career profile, applications and opportunities.", href: "/login/candidate", icon: Briefcase },
  { title: "Employer Login", description: "Requirements, candidates and hiring workspace.", href: "/login/employer", icon: Building2 },
  { title: "Creator Login", description: "Services, orders and creator earnings.", href: "/login/creator", icon: WandSparkles },
  { title: "Recruiter Login", description: "Invite-only employer recruitment workspace.", href: "/login/recruiter", icon: Users },
  { title: "Admin Login", description: "Secure JobiVerse administration access.", href: "/login/admin", icon: ShieldCheck },
];

export const signupMenu = [
  { title: "Student Sign Up", description: "Start your student career launchpad.", href: "/signup?role=student&next=%2Fstudents%2Fdashboard", icon: GraduationCap },
  { title: "Professional Sign Up", description: "Build your career profile and access opportunities.", href: "/signup?role=candidate", icon: Briefcase },
  { title: "Employer Sign Up", description: "Create a company workspace and start hiring.", href: "/signup?role=employer", icon: Building2 },
  { title: "Creator Sign Up", description: "Publish career services and earn.", href: "/signup?role=creator", icon: WandSparkles },
];
