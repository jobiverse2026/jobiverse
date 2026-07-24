"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, BriefcaseBusiness, ChevronDown, CircleDollarSign, FileText, GraduationCap, Search, Sparkles, Store, UsersRound } from "lucide-react";
import { serviceSlugForCategory } from "@/lib/marketplace/category-map";

type PricingItem = {
  name: string;
  price: string;
  note: string;
  href?: string;
  action?: string;
  details?: string[];
};

type PricingSection = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  icon: ElementType;
  items: PricingItem[];
  footer?: string;
};

type SelectedPrice = {
  sectionId: string;
  item: PricingItem;
};

const sections: PricingSection[] = [
  {
    id: "employers",
    title: "Employers & company workspaces",
    kicker: "Subscriptions",
    description: "Start with free public job posting and direct applicant tracking. Submitted-candidate access, company seats, reports and hiring intelligence unlock through subscriptions; Talent Search remains a separately approved add-on.",
    icon: BriefcaseBusiness,
    items: [
      { name: "Free Hiring", price: "₹0 upfront", note: "Create an employer workspace, publish public roles and manage candidates who apply directly through the Jobs Portal.", href: "/signup?role=employer", action: "Post a job free", details: ["Public job posting, direct applications and the direct interview/offer workflow are available without a subscription.", "JobiVerse/recruiter-submitted candidates, team seats, advanced reports and hiring intelligence stay locked.", "A one-time 3% of annual CTC fee applies only when a candidate who applied through the Jobs Portal successfully joins."] },
      { name: "Employer Starter", price: "₹2,999/month", note: "Unlock the submitted-candidate workspace, controlled team access and basic reports for a small hiring team.", details: ["Includes 1 master employer, 2 employer seats, 2 recruiter seats and up to 5 active requirements.", "Unlocks JobiVerse/recruiter-submitted candidates, team seats and basic hiring reports.", "Talent Search is not included; it remains a separately paid and admin-approved add-on."] },
      { name: "Employer Growth", price: "₹7,999/month", note: "Run a multi-user hiring operation with broader seats, hiring intelligence, calendars and performance reporting.", details: ["Includes 1 master employer, 5 employer seats, 10 recruiter seats and up to 20 active requirements.", "Unlocks the candidate pipeline, interview calendar, hiring health, funnel analytics and recruiter performance reports.", "Talent Search remains a separately approved add-on unless included in a custom commercial agreement."] },
      { name: "Employer Enterprise", price: "Custom", note: "Custom seats, bulk hiring, advanced workflows, dedicated JobiVerse ownership, reports and SLA.", details: ["Includes all agreed subscription workspace modules with company-specific controls.", "Seats, departments, Talent Search, reports and support scope are documented in the approved proposal.", "Best for high-volume hiring, multiple teams or custom operating workflows."] },
      { name: "Extra employer seat", price: "₹2,000/year/seat", note: "For additional company users who manage requirements, candidates, reports and team visibility.", details: ["Used when more employer-side users need controlled access.", "Master employer/admin can control access based on seat limits.", "Invited employer access stays restricted as per company rules."] },
      { name: "Extra recruiter seat", price: "₹1,000/year/seat", note: "For assigned sourcing users who submit candidates and work on recruiter pipelines.", details: ["Used when the company needs more recruiter users.", "Recruiters can work on assigned requirements and submit candidates.", "Recruiter access stays separate from employer/admin access."] },
      { name: "Talent Search Access", price: "₹1,999/month", note: "Locked add-on. Search only Open to Work JobiVerse profiles after payment and admin approval.", details: ["Unlocks searchable open-to-work talent profiles.", "Includes filters like skills, location, experience and notice period.", "Access starts only after payment and JobiVerse admin approval."] },
    ],
    footer: "Free Jobs Portal posting and direct applicant management need no subscription. Submitted profiles, seats, reports and intelligence are paid workspace tools. A direct applicant joining carries a one-time 3% annual-CTC success fee.",
  },
  {
    id: "hiring-fees",
    title: "Hiring success fees & premium hiring unlocks",
    kicker: "Placement revenue",
    description: "Commercial terms when a company hires through JobiVerse workflows, portal candidates or direct referrals.",
    icon: BadgeIndianRupee,
    items: [
      { name: "JobiVerse hiring team", price: "Negotiable / standard 5%", note: "For roles actively sourced, screened and coordinated by JobiVerse. Partnership commercials can be negotiated for volume." },
      { name: "Direct Jobs Portal joining", price: "3% of annual CTC", note: "If a candidate applies directly through the JobiVerse Jobs Portal and joins." },
      { name: "Candidate referral", price: "1% of annual salary", note: "Only if the referred candidate joins successfully." },
      { name: "Featured job posting", price: "₹499–₹1,999/role", note: "For urgent or priority roles that need stronger visibility." },
    ],
  },
  {
    id: "professionals",
    title: "Professionals & experienced candidates",
    kicker: "Career services",
    description: "Jobs remain free. Paid services help professionals improve positioning, interviews, transitions and visibility.",
    icon: UsersRound,
    items: [
      { name: "Career Free", price: "Free", note: "JobiVerse Card, job applications, resume upload, saved jobs, application tracker and Open to Work visibility." },
      { name: "Career Plus", price: "₹199/month", note: "Career score guidance, profile improvement, priority job alerts and application health tracking." },
      { name: "Career Pro", price: "₹499/month", note: "Career Plus + resume review credit, interview prep discount, guidance discount and premium CV template discount." },
      { name: "Resume Writing", price: "₹299", note: "Professional ATS-ready resume from scratch." },
      { name: "Resume Review & Optimization", price: "₹299", note: "Expert review and improvement of an existing resume." },
      { name: "Cover Letter Writing", price: "₹149", note: "Role-specific cover letter with compelling positioning." },
      { name: "LinkedIn Profile Optimization", price: "₹299", note: "Stronger visibility, credibility and recruiter discovery." },
      { name: "Portfolio Building", price: "₹499", note: "Premium portfolio for projects and achievements." },
      { name: "Career Guidance", price: "₹299", note: "Personalized role selection and practical career planning." },
      { name: "Career Transition Consulting", price: "₹999", note: "Plan for moving into a new role, domain or industry." },
      { name: "Interview Preparation", price: "₹299", note: "Structured prep for upcoming interviews." },
      { name: "Mock Interview", price: "₹599", note: "Role-specific practice with actionable feedback." },
      { name: "Salary Negotiation Coaching", price: "₹499", note: "Preparation for compensation and offer conversations." },
      { name: "Skill Gap Analysis", price: "₹499", note: "Focused assessment and skill-development roadmap." },
      { name: "Industry Mentorship", price: "₹499", note: "One-to-one guidance from experienced professionals." },
      { name: "Leadership Coaching", price: "₹1,999", note: "Support for managers and senior professionals." },
      { name: "Personal Branding", price: "₹999", note: "Build a consistent and credible professional identity." },
    ],
  },
  {
    id: "students",
    title: "Students, freshers & recent graduates",
    kicker: "First-career support",
    description: "Affordable readiness services for first jobs, internships, campus interviews and early career clarity.",
    icon: GraduationCap,
    items: [
      { name: "Fresher Pro Pack", price: "₹999", note: "Resume, first-job preparation, project presentation guidance and internship/job roadmap." },
      { name: "Student Resume Building", price: "₹299", note: "Strong first resume for limited experience." },
      { name: "Fresher Resume Review", price: "₹199", note: "Improve projects, skills and ATS readiness." },
      { name: "Career Discovery Session", price: "₹299", note: "Explore career paths based on strengths." },
      { name: "First Job Preparation", price: "₹499", note: "Complete strategy for entering the workforce." },
      { name: "Campus Interview Preparation", price: "₹299", note: "Aptitude, HR and placement interview practice." },
      { name: "Fresher Mock Interview", price: "₹499", note: "Confidence through realistic interview practice." },
      { name: "Internship Guidance", price: "₹299", note: "Plan, search and prepare for valuable internships." },
      { name: "Project & Portfolio Guidance", price: "₹499", note: "Present academic and personal projects professionally." },
      { name: "Skill Roadmap", price: "₹499", note: "Practical learning plan for a target role." },
      { name: "Employability Assessment", price: "₹299", note: "Evaluate job readiness and improvement areas." },
      { name: "Study & Course Guidance", price: "₹299", note: "Choose courses aligned with career outcomes." },
      { name: "Communication Coaching", price: "₹499", note: "Improve professional and interview communication." },
      { name: "Personal Mentorship", price: "₹499", note: "Ongoing guidance during early career decisions." },
    ],
  },
  {
    id: "employer-services",
    title: "Employer consulting services",
    kicker: "JobiVerse services",
    description: "One-time employer services for better job descriptions, screening, interviews, audits and hiring intelligence.",
    icon: Search,
    items: [
      { name: "Job Description Writing", price: "₹499", note: "Clear, market-ready job descriptions." },
      { name: "Hiring Consultation", price: "₹999", note: "Requirement, process and talent strategy support." },
      { name: "Candidate Screening", price: "₹499", note: "Profile evaluation against role requirements." },
      { name: "Technical Interview Support", price: "₹999", note: "Structured technical interview support." },
      { name: "HR Interview Support", price: "₹799", note: "Behavioral and culture-fit assessment." },
      { name: "Interview Framework Design", price: "₹1,999", note: "Consistent scorecards and evaluation criteria." },
      { name: "Recruitment Process Audit", price: "₹2,999", note: "Review and improve hiring workflow." },
      { name: "Talent Market Mapping", price: "₹2,999", note: "Talent, competitor and market intelligence." },
      { name: "Compensation Benchmarking", price: "₹1,999", note: "Realistic and competitive salary ranges." },
      { name: "Employer Branding Consultation", price: "₹2,999", note: "Improve candidate perception of the organization." },
      { name: "Bulk Hiring Support", price: "₹4,999", note: "Structured high-volume hiring execution." },
      { name: "Executive Search Consulting", price: "₹4,999", note: "Leadership and senior role hiring support." },
    ],
  },
  {
    id: "cv-templates",
    title: "CV templates & resume products",
    kicker: "Digital products",
    description: "Editable templates are a direct income stream with high margin and paid downloads.",
    icon: FileText,
    items: [
      { name: "JobiVerse editable CV templates", price: "₹50–₹500", note: "Original editable DOCX/PPTX/CV templates sold through JobiVerse." },
      { name: "Premium resume template downloads", price: "As listed", note: "Candidate pays before downloading; owned templates appear in their library." },
      { name: "AI Resume Analyzer", price: "Coming Soon", note: "Currently paused. We will launch after revenue starts and Gemini billing is safe." },
      { name: "AI Resume Builder", price: "Coming Soon", note: "Future tool for guided resume drafting and role-specific improvement." },
      { name: "ATS Compatibility Checker", price: "Coming Soon", note: "Future score/check layer; not active until AI is commercially ready." },
    ],
  },
  {
    id: "creators",
    title: "Creators, experts & service providers",
    kicker: "Earn with JobiVerse",
    description: "Creators can earn through services and templates. JobiVerse earns through markup, featured placement and trust layers.",
    icon: Store,
    items: [
      {
        name: "Creator account",
        price: "Free",
        note: "Create services, upload templates, receive orders, deliver files/links and track payouts. Opening and listing a service on JobiVerse is free.",
        details: ["No charge to create your creator account.", "No charge to publish a normal service listing.", "Featured placement is optional and only applies if you want stronger visibility at the top of relevant service sections."],
      },
      { name: "Feature a service under ₹1,000", price: "50% of service charge", note: "Optional visibility boost. Use this only if you want your already-created service to appear higher/top in relevant service sections for 30 days.", details: ["This is not a fee to post your service.", "Normal service listing remains free.", "Featured placement helps improve visibility for selected services."] },
      { name: "Feature a service ₹1,000–₹2,999", price: "₹499", note: "Optional 30-day top visibility placement for an existing creator service. Listing the service normally is still free.", details: ["This is only for featured/top placement.", "Your service can remain live without paying this.", "Use when you want more attention on a specific service."] },
      { name: "Feature a service ₹3,000–₹4,999", price: "₹799", note: "Optional 30-day top visibility placement for an existing creator service. Listing the service normally is still free.", details: ["This is only for featured/top placement.", "Your service can remain live without paying this.", "Use when you want more attention on a specific service."] },
      { name: "Feature a service ₹5,000+", price: "₹999", note: "Optional 30-day top visibility placement for an existing creator service. Listing the service normally is still free.", details: ["This is only for featured/top placement.", "Your service can remain live without paying this.", "Use when you want more attention on a specific service."] },
      { name: "Verified creator badge", price: "₹999 later", note: "Optional future trust badge and ranking layer." },
    ],
  },
  {
    id: "campus-events",
    title: "Campus, events & partnerships",
    kicker: "Institutional revenue",
    description: "Packages for colleges, student communities and hiring/career events.",
    icon: Sparkles,
    items: [
      { name: "Campus readiness programme", price: "Custom", note: "Resume workshops, mock interviews, employability dashboard and placement readiness support." },
      { name: "Per-student campus package", price: "₹99–₹499/student", note: "Suggested range depending service depth and student count." },
      { name: "College partnership package", price: "₹10,000–₹1,00,000+", note: "Depends on college size, workshops, dashboards and employer connect support." },
      { name: "Hiring/career event support", price: "Custom", note: "Event promotion, registration, profiles, screening and post-event tracking." },
    ],
  },
];

function pricingAction(sectionId: string, item: PricingItem) {
  const name = item.name.toLowerCase();
  const price = item.price.toLowerCase();
  const marketplaceServiceHref = (category: string) => `/marketplace/services/${serviceSlugForCategory(category)}?type=${encodeURIComponent(category)}`;
  if (price.includes("coming soon") || name.includes("ai ") || name.includes("ats compatibility")) {
    return { label: "Coming soon", href: "", disabled: true };
  }
  if (item.href) return { label: item.action ?? "Buy now", href: item.href, disabled: false };
  if (sectionId === "employers") return { label: item.price === "Custom" ? "Login to request proposal" : "Login to access / buy", href: "/plans?audience=employer", disabled: false };
  if (sectionId === "hiring-fees") {
    if (name.includes("referral")) return { label: "Start referral", href: "/referrals", disabled: false };
    return { label: item.price.includes("%") || item.price === "Custom" || item.price.includes("Negotiable") ? "Start request" : "Buy now", href: "/employers/requirements/new", disabled: false };
  }
  if (sectionId === "professionals") {
    if (name.includes("career free") || name.includes("career plus") || name.includes("career pro")) return { label: item.price === "Free" ? "Activate free" : "Buy plan", href: "/plans?audience=candidate", disabled: false };
    return { label: "Book service", href: marketplaceServiceHref(item.name), disabled: false };
  }
  if (sectionId === "students") return { label: "Book service", href: marketplaceServiceHref(item.name), disabled: false };
  if (sectionId === "employer-services") return { label: "Book service", href: marketplaceServiceHref(item.name), disabled: false };
  if (sectionId === "cv-templates") {
    if (name.includes("jobiverse editable")) return { label: "View templates", href: marketplaceServiceHref("Editable CV Template"), disabled: false };
    return { label: "View templates", href: "/candidates/resume-builder", disabled: false };
  }
  if (sectionId === "creators") {
    if (name.includes("creator account")) return { label: "Start earning", href: "/earn-with-jobiverse", disabled: false };
    return { label: "Feature service", href: "/earn-with-jobiverse/dashboard/services", disabled: false };
  }
  if (sectionId === "campus-events") return { label: "Enquire now", href: "/campus-partnerships", disabled: false };
  return { label: "Continue", href: "/contact", disabled: false };
}

export function PricingExplorer() {
  const [open, setOpen] = useState(sections[0].id);
  const [selected, setSelected] = useState<SelectedPrice | null>(null);
  const activeSection = sections.find((section) => section.id === open) ?? sections[0];
  const selectedAction = selected ? pricingAction(selected.sectionId, selected.item) : null;

  const toggleMobileSection = (sectionId: string) => {
    const nextOpen = open === sectionId ? "" : sectionId;
    setOpen(nextOpen);
    setSelected(null);

    if (nextOpen) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          document.getElementById(`mobile-pricing-trigger-${sectionId}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    }
  };

  return (
    <section className="px-5 pb-28 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        <div className="space-y-3 lg:hidden">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = open === section.id;

            return (
              <div key={section.id} className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm">
                <button
                  id={`mobile-pricing-trigger-${section.id}`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`mobile-pricing-${section.id}`}
                  onClick={() => toggleMobileSection(section.id)}
                  className={`flex w-full scroll-mt-28 cursor-pointer items-center gap-3 p-4 text-left transition ${isOpen ? "bg-zinc-950 text-white" : "bg-white text-zinc-700"}`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isOpen ? "bg-white text-zinc-950" : "bg-zinc-100 text-zinc-700"}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[.16em] opacity-60">{section.kicker}</span>
                    <span className="mt-1 block text-sm font-semibold leading-5">{section.title}</span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div id={`mobile-pricing-${section.id}`}>
                    <PricingSectionPanel
                      section={section}
                      selected={selected}
                      onSelect={(item) => setSelected({ sectionId: section.id, item })}
                      mobile
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[360px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
            {sections.map(({ id, title, kicker, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setOpen(id);
                  setSelected(null);
                }}
                className={`mb-2 flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition ${open === id ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100"}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${open === id ? "bg-white text-zinc-950" : "bg-white text-zinc-700"}`}>
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[.16em] opacity-60">{kicker}</span>
                  <span className="mt-1 block text-sm font-semibold">{title}</span>
                </span>
              </button>
            ))}
          </aside>

          <PricingSectionPanel
            section={activeSection}
            selected={selected}
            onSelect={(item) => setSelected({ sectionId: activeSection.id, item })}
          />
        </div>
        {selected && selectedAction && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="grid max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl lg:grid-cols-[1fr_300px]">
              <div className="p-3 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">Selected pricing</p>
                <h3 className="mt-2 text-3xl font-bold tracking-[-.04em]">{selected.item.name}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{selected.item.note}</p>
                {!!selected.item.details?.length && (
                  <div className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-white/[.06] p-4">
                    {selected.item.details.map((detail) => (
                      <p key={detail} className="flex gap-2 text-sm leading-6 text-zinc-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                        {detail}
                      </p>
                    ))}
                  </div>
                )}
                <p className="mt-6 text-xs leading-6 text-zinc-500">You can review the offer here first. Continue only when you want to login, access or buy this item.</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 text-zinc-950">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-400">Pay / continue</p>
                <p className="mt-2 text-2xl font-black tracking-[-.03em]">{selected.item.price}</p>
                {selectedAction.disabled ? (
                  <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-400">
                    {selectedAction.label}
                  </span>
                ) : (
                  <Link href={selectedAction.href} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
                    {selectedAction.label} <ArrowRight size={15} />
                  </Link>
                )}
                <button type="button" onClick={() => setSelected(null)} className="mt-3 w-full cursor-pointer rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50">
                  Back to pricing list
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PricingSectionPanel({ section, selected, onSelect, mobile = false }: { section: PricingSection; selected: SelectedPrice | null; onSelect: (item: PricingItem) => void; mobile?: boolean }) {
  const Icon = section.icon;

  return (
    <article className={mobile ? "bg-white" : "overflow-hidden rounded-[2.5rem] border border-zinc-950 bg-white shadow-sm"}>
      {!mobile && (
        <div className="flex items-center gap-4 p-6 sm:p-8">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-950 text-white">
            <Icon size={22} />
          </span>
          <span>
            <span className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">{section.kicker}</span>
            <span className="mt-1 block text-2xl font-bold tracking-[-.03em]">{section.title}</span>
          </span>
        </div>
      )}
      <div className={`${mobile ? "border-t border-zinc-200 p-4" : "border-t border-zinc-100 p-6 pt-5 sm:p-8"}`}>
        <p className="max-w-3xl text-sm leading-7 text-zinc-500">{section.description}</p>
        <div className="mt-5 grid gap-3 sm:mt-6">
          {section.items.map((item) => (
            <PricingRow
              key={`${section.id}-${item.name}`}
              item={item}
              sectionId={section.id}
              selected={selected?.sectionId === section.id && selected.item.name === item.name}
              onSelect={() => onSelect(item)}
            />
          ))}
        </div>
        {section.footer && (
          <p className="mt-5 flex gap-2 rounded-2xl bg-zinc-950 p-4 text-sm leading-6 text-white">
            <CircleDollarSign className="mt-0.5 shrink-0" size={17} />
            {section.footer}
          </p>
        )}
      </div>
    </article>
  );
}

function PricingRow({ item, sectionId, selected, onSelect }: { item: PricingItem; sectionId: string; selected: boolean; onSelect: () => void }) {
  const action = pricingAction(sectionId, item);

  return (
    <div className={`grid gap-4 rounded-[1.6rem] border p-5 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm lg:grid-cols-[1fr_230px] lg:items-stretch ${selected ? "border-zinc-950 bg-white shadow-sm" : "border-zinc-100 bg-zinc-50"}`}>
      <div>
        <h3 className="font-semibold text-zinc-950">{item.name}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{item.note}</p>
        {!!item.details?.length && (
          <div className="mt-4 grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
            {item.details.map((detail) => (
              <p key={detail} className="flex gap-2 text-sm leading-6 text-zinc-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
                {detail}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between rounded-[1.25rem] border border-zinc-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-zinc-400">Price / action</p>
          <p className="mt-2 text-xl font-bold tracking-[-.02em] text-zinc-950">{item.price}</p>
        </div>
        {action.disabled ? (
          <span className="mt-5 inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-400">
            {action.label}
          </span>
        ) : (
          <button type="button" onClick={onSelect} className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
            View details <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
