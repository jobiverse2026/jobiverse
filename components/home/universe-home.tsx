"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  IdCard,
  Layers3,
  MessageSquareText,
  Orbit,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UsersRound,
  WalletCards,
} from "lucide-react";

const worlds = [
  {
    title: "Talent World",
    eyebrow: "For professionals",
    text: "Explore opportunities, build your JobiVerse Card, improve your confidence score and move with a clearer career path.",
    href: "/candidates",
    action: "Enter talent world",
    icon: UsersRound,
  },
  {
    title: "Student World",
    eyebrow: "For freshers",
    text: "Start with resumes, interview readiness, projects, first-job support, campus programs and practical career direction.",
    href: "/students",
    action: "Start career launch",
    icon: GraduationCap,
  },
  {
    title: "Employer World",
    eyebrow: "For companies",
    text: "Use hiring workspaces, requirements, candidate pipelines, reports, talent search and JobiVerse hiring support.",
    href: "/employers",
    action: "See employer universe",
    icon: Building2,
  },
  {
    title: "Creator World",
    eyebrow: "For experts",
    text: "Earn through career services, resume support, interview coaching, hiring consulting and editable CV templates.",
    href: "/earn-with-jobiverse",
    action: "Earn with JobiVerse",
    icon: Palette,
  },
];

const actionCards = [
  { title: "Create a JobiVerse Card", text: "A universal career identity that can travel with every application.", href: "/login/candidate?next=%2Fcareer-passport", icon: IdCard },
  { title: "Explore Active Jobs", text: "Browse roles, save opportunities and apply with structured details.", href: "/candidates/jobs", icon: BriefcaseBusiness },
  { title: "Book Career Services", text: "Resume, interview, LinkedIn, mentorship and career guidance support.", href: "/marketplace", icon: Store },
  { title: "View Pricing", text: "Transparent pricing for plans, services, templates and marketplace unlocks.", href: "/pricing", icon: BadgeIndianRupee },
  { title: "Campus Partnerships", text: "Placement readiness programs for colleges, institutes and student communities.", href: "/campus-partnerships", icon: GraduationCap },
  { title: "Personal Consultations", text: "Focused JobiVerse guidance for career, hiring and professional decisions.", href: "/consultations", icon: CalendarDays },
];

const platformLayers = [
  { title: "Identity", text: "JobiVerse Card, profile completeness, skills, work history and visibility controls.", icon: IdCard },
  { title: "Opportunity", text: "Active jobs, applications, saved roles, direct portal applicants and protected introductions.", icon: Search },
  { title: "Growth", text: "Career score, confidence layer, services, templates, mentorship and readiness support.", icon: Star },
  { title: "Workspaces", text: "Employer portals, recruiter seats, candidate pipelines, reports and interview calendars.", icon: Layers3 },
  { title: "Marketplace", text: "Creators, JobiVerse pinned services, orders, negotiation, delivery and payouts.", icon: WalletCards },
  { title: "Trust", text: "Access control, verified flows, notifications, billing, receipts and hiring protection.", icon: ShieldCheck },
];

const services = [
  "Resume Writing",
  "Interview Preparation",
  "Career Guidance",
  "CV Templates",
  "Hiring Consultation",
  "Candidate Screening",
  "Campus Readiness",
  "Talent Search",
];

const proof = [
  { value: "4", label: "worlds connected", text: "Talent, students, employers and creators." },
  { value: "1", label: "career identity", text: "The JobiVerse Card links applications, skills and trust." },
  { value: "∞", label: "growth paths", text: "Jobs, services, learning, hiring and earning in one place." },
];

export function UniverseHome() {
  return (
    <>
      <section className="bg-[#f6f6f3] px-5 pb-12 pt-28 sm:px-8">
        <div className="jv-noise relative mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.22),transparent_25rem),radial-gradient(circle_at_85%_20%,rgba(161,161,170,.22),transparent_20rem),linear-gradient(135deg,#050505,#18181b_52%,#3f3f46)] px-7 py-20 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.72)] sm:px-14 lg:py-28">
          <div className="jv-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full border border-white/10" />

          <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1.05fr_.85fr]">
            <div>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200 backdrop-blur">
                <Orbit size={15} /> Every Hire. Every Career. One Universe.
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-7 max-w-5xl text-4xl font-semibold leading-[.94] tracking-[-.06em] sm:text-6xl lg:text-7xl">
                India&apos;s work universe for careers, hiring, learning and earning.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-7 max-w-3xl text-lg leading-8 text-zinc-300">
                JobiVerse brings talent, students, companies and creators into one premium ecosystem — where a person can build a career, a company can build a team, and an expert can build income.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-10 flex flex-wrap gap-3">
                <Link href="/choose-your-world" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl">
                  Choose your world <ArrowRight size={18} />
                </Link>
                <Link href="/pricing" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10">
                  Explore pricing
                </Link>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.18 }} className="relative mx-auto aspect-square w-full max-w-[500px]">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-[9%] rotate-6 rounded-full border border-white/10" />
              <div className="absolute inset-[20%] -rotate-12 rounded-full border border-white/10 bg-white/[.03]" />
              <div className="absolute inset-[35%] grid place-items-center rounded-full bg-white text-black shadow-[0_0_90px_rgba(255,255,255,.22)]">
                <Sparkles size={42} />
              </div>
              {[
                ["Careers", "left-1/2 top-0 -translate-x-1/2"],
                ["Hiring", "right-0 top-[32%]"],
                ["Students", "bottom-[8%] right-[12%]"],
                ["Creators", "bottom-[18%] left-0"],
                ["Services", "left-[7%] top-[24%]"],
              ].map(([label, position]) => (
                <span key={label} className={`absolute ${position} rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl`}>
                  {label}
                </span>
              ))}
              <span className="absolute left-[20%] top-[56%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_white]" />
              <span className="absolute right-[21%] top-[17%] h-2 w-2 rounded-full bg-zinc-300" />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="worlds" className="bg-[#f6f6f3] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Choose your world</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-6xl">One platform. Four doors.</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {worlds.map(({ title, eyebrow, text, href, action, icon: Icon }, index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Link href={href} className="group flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-zinc-400 hover:shadow-2xl">
                  <span>
                    <span className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                        <Icon size={23} />
                      </span>
                      <ArrowRight className="text-zinc-300 transition group-hover:translate-x-1 group-hover:text-zinc-950" />
                    </span>
                    <span className="mt-8 block text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">{eyebrow}</span>
                    <strong className="mt-3 block text-2xl tracking-[-.03em] text-zinc-950">{title}</strong>
                    <span className="mt-4 block text-sm leading-7 text-zinc-600">{text}</span>
                  </span>
                  <span className="mt-8 inline-flex text-sm font-bold text-zinc-950">{action}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="rounded-[3rem] bg-zinc-950 p-8 text-white sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">The JobiVerse map</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Not a recruitment page. A living work system.</h2>
            <p className="mt-6 leading-8 text-zinc-400">Every module has a role: identity, opportunity, growth, workspaces, marketplace and trust. Hiring is one strong part of the universe — not the whole story.</p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {proof.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-zinc-500">{item.label}</p>
                  <p className="mt-3 text-xs leading-5 text-zinc-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {platformLayers.map(({ title, text, icon: Icon }, index) => (
              <motion.article key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-[2rem] border border-zinc-200 bg-[#f7f7f4] p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                  <Icon size={21} />
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-[-.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f3] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="rounded-[3rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">What users can do</p>
                <h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-6xl">Every click opens a useful path.</h2>
                <p className="mt-6 leading-8 text-zinc-600">People can apply, learn, earn, buy services, build a JobiVerse Card, explore opportunities or partner with us — without feeling locked into one single service.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {actionCards.map(({ title, text, href, icon: Icon }) => (
                  <Link key={title} href={href} className="group rounded-[1.6rem] border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-1 hover:bg-zinc-950 hover:text-white hover:shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-white transition group-hover:bg-white group-hover:text-zinc-950">
                        <Icon size={19} />
                      </span>
                      <ArrowRight className="text-zinc-300 transition group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                    <h3 className="mt-5 font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 transition group-hover:text-zinc-300">{text}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Services & marketplace</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Support for every stage of work.</h2>
            </div>
            <Link href="/marketplace" className="inline-flex w-fit items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-bold text-white">
              Explore services <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div key={service} className="rounded-[1.5rem] border border-zinc-200 bg-[#f7f7f4] p-6">
                <CheckCircle2 className="h-5 w-5 text-zinc-950" />
                <p className="mt-5 font-bold">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f3] px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-5 lg:grid-cols-3">
          <div className="rounded-[2.5rem] bg-zinc-950 p-8 text-white lg:col-span-2 sm:p-12">
            <Bot className="h-8 w-8" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Intelligence layer</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Human-first today. AI-ready tomorrow.</h2>
            <p className="mt-6 max-w-3xl leading-8 text-zinc-400">AI resume analysis, ATS checks, matching and career coaching are prepared as future unlocks. For launch, JobiVerse stays safe, human-led and revenue-conscious.</p>
          </div>
          <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
            <MessageSquareText className="h-8 w-8" />
            <h3 className="mt-8 text-3xl font-bold tracking-[-.04em]">Built for trust.</h3>
            <p className="mt-5 leading-7 text-zinc-600">Notifications, messages, receipts, billing, verified flows and protected candidate tracking keep every side accountable.</p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[3rem] bg-[radial-gradient(circle_at_50%_0%,rgba(212,212,216,.45),transparent_25rem),linear-gradient(180deg,#ffffff,#f4f4f5)] p-8 text-center shadow-sm sm:p-14">
          <Sparkles className="mx-auto h-9 w-9" />
          <h2 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-6xl">Start anywhere. Grow everywhere.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">Whether someone wants a job, a better resume, a hiring workspace, a career service, a campus partnership or a way to earn — JobiVerse gives them a door.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/choose-your-world" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-bold text-white">
              Choose your world <ArrowRight size={17} />
            </Link>
            <Link href="/contact" className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 font-bold text-zinc-950">
              Contact JobiVerse
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
