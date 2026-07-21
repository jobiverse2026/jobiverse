import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Compass,
  FileText,
  GraduationCap,
  Mic2,
  Route,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { ExploreServicesSection } from "@/components/marketplace/explore-services-section";
import { ActiveJobsGateway } from "@/components/careers/active-jobs-gateway";


const tools = [
  {
    id: "career-guide",
    title: "Career Guide",
    description: "Understand career paths, role expectations and the skills employers actually look for before choosing your direction.",
    icon: Compass,
    label: "Explore your direction",
  },
  {
    id: "resume-maker",
    title: "First Resume Maker",
    description: "Turn academics, projects, internships and certifications into a sharp, ATS-ready professional story.",
    icon: WandSparkles,
    label: "Build your first resume",
  },
  {
    title: "Interview Preparation",
    description: "Practice common HR and role-specific questions with structured guidance that builds clarity and confidence.",
    icon: Mic2,
    label: "Prepare with confidence",
  },
  {
    title: "Skill Roadmaps",
    description: "Follow practical learning paths designed around the role you want-not an endless list of disconnected courses.",
    icon: Route,
    label: "Plan what to learn",
  },
  {
    title: "Fresher Opportunities",
    description: "Discover internships, graduate roles and entry-level opportunities matched to your potential and interests.",
    icon: BriefcaseBusiness,
    label: "Discover opportunities",
  },
  {
    title: "Employability Check",
    description: "See where you stand today and identify the most valuable improvements for your target role.",
    icon: BookOpenCheck,
    label: "Check your readiness",
  },
];

export default function StudentsPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f4] pt-28 text-zinc-950">
      <section id="student-overview" className="relative mx-5 overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.18),transparent_23rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] px-6 pb-24 pt-24 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:mx-8 lg:mx-auto lg:max-w-[1450px] lg:pb-32 lg:pt-32">
        <div className="pointer-events-none absolute inset-0 opacity-[.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="pointer-events-none absolute left-1/2 top-[55%] h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-zinc-400/20" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-zinc-200 shadow-sm backdrop-blur-xl">
                <GraduationCap size={15} /> JobiVerse for Students
              </span>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-8xl">
                Your career starts <br /><span className="text-zinc-400">before your first job.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                A dedicated launchpad for students and recent graduates to discover their direction, build a stronger profile and enter the working world with confidence.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup?role=candidate" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-7 font-semibold text-black shadow-xl transition hover:-translate-y-0.5">
                  Start your journey <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </Link>
                <Link href="#student-tools" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 font-semibold backdrop-blur-xl transition hover:bg-white/10">
                  Explore student tools
                </Link>
                <Link href="/campus-partnerships" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 font-semibold backdrop-blur-xl transition hover:bg-white/10">
                  Campus partnerships
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[470px]">
              <div className="absolute inset-0 rounded-full border border-white/15" />
              <div className="absolute inset-[14%] rotate-12 rounded-full border border-white/10" />
              <div className="absolute inset-[29%] -rotate-12 rounded-full border border-white/15 bg-white/[.06] shadow-[0_30px_100px_-20px_rgba(0,0,0,.55)]" />
              <div className="absolute inset-[35%] grid place-items-center rounded-full bg-white text-black"><Sparkles size={42} /></div>
              {[["Resume", "left-0 top-[44%]"], ["Direction", "right-0 top-[18%]"], ["Skills", "bottom-[4%] right-[16%]"]].map(([label, position]) => (
                <div key={label} className={`absolute ${position} rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold shadow-xl backdrop-blur-xl`}>{label}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="student-tools" className="border-y border-black/5 bg-white px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-zinc-400">The student toolkit</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">From uncertain to<br />career-ready.</h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600">Everything needed to make a thoughtful first move-organized around your journey, not scattered across generic advice.</p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <article id={tool.id} key={tool.title} className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-[#fafaf9] p-8 transition duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:bg-white hover:shadow-[0_30px_80px_-45px_rgba(0,0,0,.55)]">
                  <span className="absolute right-7 top-7 text-xs font-semibold text-zinc-300">0{index + 1}</span>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg"><Icon size={25} /></div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight">{tool.title}</h3>
                  <p className="mt-4 min-h-24 leading-7 text-zinc-600">{tool.description}</p>
                  <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-zinc-900">{tool.label}<ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ActiveJobsGateway audience="student" />

      <ExploreServicesSection audience="student" limit={3} />

      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.75rem] bg-zinc-950 text-white lg:grid-cols-[1fr_.7fr]">
          <div className="p-9 sm:p-14 lg:p-20">
            <FileText className="text-zinc-400" />
            <h2 className="mt-7 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Potential deserves<br /><span className="text-zinc-500">a professional story.</span></h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">Our student-first resume experience will help you present projects, coursework and early experience with the clarity recruiters expect.</p>
            <Link href="/signup?role=candidate" className="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200">Join the early experience <ArrowRight size={17} /></Link>
          </div>
          <div className="relative min-h-80 border-t border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.16),transparent_45%)] lg:border-l lg:border-t-0">
            <div className="absolute inset-[16%] rotate-6 rounded-[2rem] border border-white/15 bg-white/5 p-7 backdrop-blur-xl">
              <div className="h-3 w-2/5 rounded-full bg-white/70" /><div className="mt-5 h-2 w-full rounded-full bg-white/15" /><div className="mt-3 h-2 w-4/5 rounded-full bg-white/15" />
              <div className="mt-9 grid grid-cols-3 gap-3">{[1,2,3].map(item => <div key={item} className="h-16 rounded-xl border border-white/10 bg-white/5" />)}</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
