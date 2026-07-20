import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Compass,
  FileText,
  GraduationCap,
  MessagesSquare,
  Mic2,
  Palette,
  ShieldCheck,
  CalendarClock,
  HeartHandshake,
  WalletCards,
  Search,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { PageSectionIndex } from "@/components/common/page-section-index";
import { creatorServiceGroups } from "@/lib/marketplace/creator-service-options";
import { serviceSlugForCategory } from "@/lib/marketplace/category-map";

const audiences = [
  {
    id: "for-employers",
    eyebrow: "For employers",
    title: "Build stronger teams.",
    description: "Recruitment expertise and hiring technology for startups, SMEs and enterprises.",
    href: "/marketplace#for-employers",
    cta: "Explore employer solutions",
    icon: Building2,
    services: [
      ["IT & Non-IT Recruitment", "Specialist hiring across technology and business functions.", BriefcaseBusiness, "candidate-screening"],
      ["Talent Search Access", "Paid access to open-to-work JobiVerse profiles with filters and privacy-safe contact flow.", Search, "talent-search-access"],
      ["Executive Search", "Confidential search for leaders, senior managers and domain experts.", UserRoundCheck, "hiring-consultation"],
      ["Hiring Strategy", "Requirement discovery, market mapping and structured hiring support.", TrendingUp, "job-description-writing"],
    ],
  },
  {
    id: "for-professionals",
    eyebrow: "For professionals",
    title: "Move your career forward.",
    description: "Practical services for experienced professionals planning their next opportunity or transition.",
    href: "/marketplace#for-professionals",
    cta: "Explore professional services",
    icon: UserRoundCheck,
    services: [
      ["Resume & CV Services", "Editable premium CVs, resume improvement and ATS-ready presentation.", FileText, "resume-builder"],
      ["Editable CV Templates", "Choose original creator-made CV templates and personalize every section.", Palette, "cv-templates"],
      ["Interview Preparation", "Role-specific preparation for HR, technical and leadership interviews.", Mic2, "interview-preparation"],
      ["Career Guidance", "Career transitions, job-search strategy and professional growth planning.", Compass, "career-guidance"],
      ["Skill Roadmaps", "Identify skill gaps and follow a practical role-focused growth plan.", TrendingUp, "skill-roadmaps"],
    ],
  },
  {
    id: "for-students",
    eyebrow: "For students & graduates",
    title: "Start career-ready.",
    description: "A dedicated launchpad for freshers building direction, confidence and their first professional profile.",
    href: "/marketplace#for-students",
    cta: "Explore student services",
    icon: GraduationCap,
    services: [
      ["First Resume Maker", "Turn academics, projects and internships into a strong first resume.", FileText, "resume-builder"],
      ["Editable CV Templates", "Start faster with editable creator-made CV templates for freshers.", Palette, "cv-templates"],
      ["Career Roadmaps", "Understand suitable roles and the skills required to reach them.", Compass, "skill-roadmaps"],
      ["Fresher Preparation", "Interview practice, employability guidance and first-job support.", Sparkles, "interview-preparation"],
      ["Career Guidance", "Choose the right direction with personalized student career guidance.", UserRoundCheck, "career-guidance"],
    ],
  },
  {
    id: "creator-services",
    eyebrow: "For creators & experts",
    title: "Turn expertise into income.",
    description: "Create career-focused products and services for the JobiVerse community.",
    href: "/earn-with-jobiverse",
    cta: "Explore creator opportunities",
    icon: Palette,
    services: [
      ["Sell CV Templates", "Publish original editable CV designs and earn from paid downloads.", Palette, "sell-cv-templates"],
      ["Offer Career Services", "Provide resume writing, counselling, mentorship or mock interviews.", MessagesSquare, "career-mentorship"],
      ["Courses & Workshops", "Share practical knowledge through focused learning experiences.", GraduationCap, "skill-roadmaps"],
    ],
  },
] as const;

const intelligenceFeatures = [
  ["Confidence Layer", "Hiring Confidence Score that improves as talent adds CV, skills, availability, deal-breakers and verified assets.", ShieldCheck],
  ["Availability Calendar", "Talent can share preferred interview windows so recruiters can schedule faster.", CalendarClock],
  ["Application Health Tracker", "Applications show visible stages instead of disappearing into a black hole.", TrendingUp],
  ["Deal-breaker Matching", "Salary, location, work mode and shift non-negotiables help avoid mismatched roles.", HeartHandshake],
  ["Career Wallet", "CV versions, applications, saved roles, proofs and profile assets stay organized in one place.", WalletCards],
  ["Employer Hiring Health Score", "Companies see funnel health across requirements, submissions, interviews and closures.", TrendingUp],
] as const;

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-zinc-950">
      <PageHeader
        eyebrow="JobiVerse Services"
        title="One Ecosystem. Services For Every Career Journey."
        description="Choose the experience built for you-from growing a team to growing a career, starting your first job or earning through your expertise."
      />
      <PageSectionIndex items={audiences.map(({ id, eyebrow }) => ({ label: eyebrow, href: `#${id}` }))} />

      <div className="mx-auto max-w-[1450px] space-y-6 px-5 pb-28 sm:px-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10 lg:p-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">What makes JobiVerse different</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">A smarter layer above ordinary job portals.</h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">These features help talent stay ready, employers hire with confidence and JobiVerse track the journey transparently.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {intelligenceFeatures.map(([title, description, Icon]) => (
              <article key={title} className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21} /></span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10 lg:flex-row lg:items-center lg:p-14"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">JobiVerse Personal</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Need clarity before choosing a service?</h2><p className="mt-4 max-w-3xl leading-7 text-zinc-600">Book a focused consultation for career direction, resume strategy, interview practice, employer hiring or creator onboarding.</p></div><Link href="/consultations" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white">Explore consultations<ArrowRight size={17}/></Link></section>
        {audiences.map((audience, audienceIndex) => {
          const AudienceIcon = audience.icon;
          return (
            <section id={audience.id} key={audience.id} className={`overflow-hidden rounded-[2.5rem] border border-zinc-200 p-7 sm:p-10 lg:p-14 ${audienceIndex % 2 ? "bg-zinc-950 text-white" : "bg-white"}`}>
              <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
                <div>
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl ${audienceIndex % 2 ? "bg-white text-black" : "bg-black text-white"}`}><AudienceIcon size={25} /></span>
                  <p className={`mt-7 text-xs font-bold uppercase tracking-[.2em] ${audienceIndex % 2 ? "text-zinc-500" : "text-zinc-400"}`}>{audience.eyebrow}</p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">{audience.title}</h2>
                  <p className={`mt-5 max-w-lg leading-7 ${audienceIndex % 2 ? "text-zinc-400" : "text-zinc-600"}`}>{audience.description}</p>
                  <Link href={audience.href} className={`mt-8 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold ${audienceIndex % 2 ? "bg-white text-black" : "bg-black text-white"}`}>{audience.cta}<ArrowRight size={17} /></Link>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {audience.services.map(([title, description, Icon, serviceSlug], index) => (
                    <Link href={serviceSlug === "sell-cv-templates" ? "/earn-with-jobiverse" : serviceSlug === "talent-search-access" ? "/employers/talent-search" : `/marketplace/services/${serviceSlug}`} key={title} className={`group rounded-[1.75rem] border p-6 transition hover:-translate-y-1 hover:shadow-xl ${audienceIndex % 2 ? "border-white/10 bg-white/[.05]" : "border-zinc-200 bg-zinc-50"}`}>
                      <div className="flex items-center justify-between"><Icon size={21} /><span className={`text-xs font-bold ${audienceIndex % 2 ? "text-zinc-600" : "text-zinc-300"}`}>0{index + 1}</span></div>
                      <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                      <p className={`mt-3 text-sm leading-6 ${audienceIndex % 2 ? "text-zinc-400" : "text-zinc-600"}`}>{description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        <section id="complete-catalogue" className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10 lg:p-14"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Complete JobiVerse catalogue</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Every service. Clearly organized.</h2><p className="mt-5 text-lg leading-8 text-zinc-600">Explore the complete set of services available to professionals, students and employers. Shared services appear in every relevant journey.</p></div><div className="mt-12 space-y-12">{creatorServiceGroups.map(group => <div key={group.audience}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="text-3xl font-semibold tracking-[-.03em]">{group.label}</h3><p className="mt-2 text-sm text-zinc-500">{group.description}</p></div><span className="text-sm font-semibold text-zinc-400">{group.services.length} services</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{group.services.map(service => <Link key={`${group.audience}-${service.title}`} href={`/marketplace/services/${serviceSlugForCategory(service.title)}`} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-1 hover:border-zinc-950 hover:bg-white hover:shadow-xl"><div className="flex items-start justify-between gap-3"><h4 className="font-semibold">{service.title}</h4><ArrowRight className="shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-black" size={16}/></div><p className="mt-2 text-xs leading-5 text-zinc-500">{service.description}</p></Link>)}</div></div>)}</div></section>
      </div>
    </main>
  );
}
