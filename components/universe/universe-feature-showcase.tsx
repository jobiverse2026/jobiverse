"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, GraduationCap, IdCard, LockKeyhole, Search, ShieldCheck, Sparkles, Target, UserRound, UsersRound, WalletCards } from "lucide-react";

type Universe = "professional" | "student" | "employer" | "creator";
type FeatureGroup = { title: string; description: string; features: string[]; icon: React.ElementType };

const content: Record<Universe, {
  eyebrow: string; title: string; description: string; signupHref: string; loginHref: string; signupLabel: string; loginLabel: string; groups: FeatureGroup[]; notes: string[]; journey: string[];
}> = {
  professional: {
    eyebrow: "Inside the Professional Universe",
    title: "What’s inside the Professional Universe?",
    description: "Discover opportunities, build a credible career identity and manage every important career action without losing context.",
    signupHref: "/signup?role=candidate", loginHref: "/login/candidate", signupLabel: "Create professional account", loginLabel: "Professional login",
    groups: [
      { title: "Profile & JobiVerse Card", description: "Build a discoverable professional identity.", icon: IdCard, features: ["Professional profile and completion guidance", "Open-to-Work visibility controls", "Shareable JobiVerse Card and public link", "Experience, education, projects, skills and credentials", "Evidence and verification status", "Card visibility and view analytics"] },
      { title: "Jobs & discovery", description: "Find and organise relevant opportunities.", icon: Search, features: ["Direct JobiVerse and attributed partner jobs", "Role, city, sector, mode, type and freshness filters", "Saved jobs and saved searches", "Compare up to three opportunities", "Job alerts with instant, daily or weekly digests", "Trust signals and directional salary guidance"] },
      { title: "Applications & hiring", description: "Keep every hiring stage visible.", icon: BriefcaseBusiness, features: ["Application Health dashboard", "Preserved application and resume snapshots", "Interview calendar, links and reminders", "Messages and supported attachments", "Offer accept, decline and counter flow", "Follow-up assistant and application withdrawal"] },
      { title: "Career growth tools", description: "Prepare for the next move.", icon: Sparkles, features: ["Resume Studio and private version history", "Resume builder and editable templates", "Interview preparation and answer notebook", "Career services and consultations", "Events, plans and referral tracking", "AI resume analysis when the paid AI gate is active"] },
    ],
    notes: ["Applications and interviews are always free for candidates.", "Privacy, notifications, security, data export and PWA access are included with the account."],
    journey: ["Create your professional identity", "Discover and save relevant roles", "Apply and track every stage", "Prepare, interview and grow"],
  },
  student: {
    eyebrow: "Inside the Student Universe",
    title: "What’s inside the Student Universe?",
    description: "Start with academics and projects, discover fresher-friendly opportunities and grow into a professional account without rebuilding your profile.",
    signupHref: "/signup?role=student&next=%2Fstudents%2Fdashboard", loginHref: "/login/student", signupLabel: "Create student account", loginLabel: "Student login",
    groups: [
      { title: "Student profile", description: "Show more than work experience.", icon: GraduationCap, features: ["College, degree, specialization and graduation details", "Semester, CGPA and academic information", "Projects, internships and certifications", "Achievements and extracurricular activities", "Skills, languages, GitHub and LinkedIn", "Preferred roles, location, mode and availability"] },
      { title: "Fresh opportunities", description: "See relevant early-career openings first.", icon: BriefcaseBusiness, features: ["Freshers and first-job collection", "Internships and apprenticeships", "Graduate, trainee and entry-level roles", "New-this-week and remote collections", "Saved opportunities and job alerts", "Clear direct and partner source labels"] },
      { title: "Applications & preparation", description: "Move from application to interview confidently.", icon: CalendarDays, features: ["Student application tracker", "Interview and offer stage visibility", "First Resume Studio and resume versions", "Interview preparation notebook", "Messages, reminders and follow-ups", "Free application and interview protection"] },
      { title: "Proof of potential", description: "Turn learning into a professional story.", icon: BadgeCheck, features: ["JobiVerse Card for education and projects", "Credentials and supporting evidence", "Project and portfolio guidance", "Student-focused career services", "Campus programmes, workshops and events", "Seamless move to the Professional Universe later"] },
    ],
    notes: ["Your Student account uses the same secure career foundation as your future Professional account.", "JobiVerse never charges students to apply or interview."],
    journey: ["Build your academic profile", "Show projects and proof of potential", "Find fresh jobs and internships", "Apply, prepare and become career-ready"],
  },
  employer: {
    eyebrow: "Inside the Employer Universe",
    title: "What’s inside the Employer Universe?",
    description: "Publish better roles, bring every candidate source into one pipeline and keep your team, interviews, offers and commercials accountable.",
    signupHref: "/signup?role=employer", loginHref: "/login/employer", signupLabel: "Create employer workspace", loginLabel: "Employer login",
    groups: [
      { title: "Company & requirements", description: "Set up structured hiring from day one.", icon: Target, features: ["Verified company profile and master workspace", "Create, edit, save privately or publish requirements", "Student, fresher, internship or experienced audience targeting", "Live Job Quality Assistant and safety checks", "Priority, vacancy, skills, budget and work-mode details", "Optional JobiVerse Hiring Team assignment"] },
      { title: "Unified talent pipeline", description: "Review every source in one place.", icon: UsersRound, features: ["Direct portal, recruiter and JobiVerse candidates", "Source, role, status and date filters", "Secure resumes and JobiVerse Cards", "Candidate comparison, notes and talent folders", "Shortlist-to-joining status movement", "Consent-first candidate information"] },
      { title: "Interviews & offers", description: "Coordinate decisions without spreadsheet gaps.", icon: CalendarDays, features: ["Interview calendar and same-day reminders", "Multiple rounds, mode, interviewer and meeting links", "Reschedule, cancel, complete and no-show outcomes", "Interview feedback records", "Offer CTC, joining date, location and terms", "Accept, decline and candidate counter responses"] },
      { title: "Team, intelligence & billing", description: "Operate and measure your hiring workspace.", icon: ChartNoAxesCombined, features: ["Employer and recruiter team seats", "Requirement-level recruiter assignments", "Recruiter and requirement performance reports", "Paid Open-to-Work Talent Search", "Messages, notifications and hiring-health signals", "Statements, success-fee tracking and optional Spotlight"] },
    ],
    notes: ["Public job posting is ₹0 upfront; the current direct-hire workflow applies a one-time 3% annual-CTC employer fee after joining.", "Managed hiring, Talent Search, team access and promotion can have separate clearly stated commercials."],
    journey: ["Set up your company workspace", "Publish a quality requirement", "Review talent and coordinate interviews", "Send offers, track joining and measure hiring"],
  },
  creator: {
    eyebrow: "Inside the Creator Universe",
    title: "What’s inside the Creator Universe?",
    description: "Package real expertise into career services or original templates, manage customers professionally and track money from order to payout.",
    signupHref: "/signup?role=creator", loginHref: "/login/creator", signupLabel: "Become a creator", loginLabel: "Creator login",
    groups: [
      { title: "Storefront & services", description: "Publish an offer customers can trust.", icon: Sparkles, features: ["Create career services and editable templates", "Audience, category, deliverables and timeline", "Creator-selected earning and customer price preview", "Preview assets, revisions and originality declaration", "Edit, pause, resume or archive listings", "Marketplace views and service performance"] },
      { title: "Offers & orders", description: "Turn enquiries into controlled work.", icon: BriefcaseBusiness, features: ["Customer offers and creator counteroffers", "Paid order workspace and status timeline", "Order messages and supported attachments", "Delivery submission and customer review", "Revision requests and completion controls", "Refund and dispute workflow"] },
      { title: "Sessions & availability", description: "Control service capacity and scheduling.", icon: CalendarDays, features: ["Available days and working hours", "Minimum booking notice", "Daily booking capacity", "Pause new bookings when unavailable", "Propose, confirm or reschedule sessions", "Booking-linked customer communication"] },
      { title: "Earnings & growth", description: "Understand every rupee earned.", icon: WalletCards, features: ["Lifetime, clearing, available and paid balances", "Order-level earnings ledger", "Verified payout profile", "Withdrawal requests and payout statements", "Customer reviews and credibility signals", "Optional paid featured marketplace placement"] },
    ],
    notes: ["Publishing normally is free; optional featured visibility does not guarantee sales.", "Payouts follow completion, customer-protection and settlement rules, with refunds or disputes reflected transparently."],
    journey: ["Create your creator profile", "Publish an original service", "Manage offers, orders and delivery", "Build credibility and withdraw earnings"],
  },
};

export function UniverseFeatureShowcase({ universe }: { universe: Universe }) {
  const page = content[universe];
  const reduced = useReducedMotion();
  return <main className="min-h-screen bg-[#f8f6fa] pb-24 pt-32 text-zinc-950"><section className="px-5 py-8 sm:px-8" aria-labelledby={`${universe}-features-title`}>
    <div className="mx-auto max-w-[1450px]">
      <div className="jv-brand-gradient relative overflow-hidden rounded-[3rem] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10" />
        <div className="relative grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-200">{page.eyebrow}</p><h1 id={`${universe}-features-title`} className="mt-5 text-5xl font-semibold leading-[.95] tracking-[-.055em] sm:text-7xl">{page.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-300 sm:text-xl">{page.description}</p><div className="mt-8 flex flex-wrap gap-2">{page.journey.map((step,index)=><span key={step} className="rounded-full border border-white/15 bg-white/[.07] px-4 py-2 text-xs font-semibold text-zinc-300">{index+1}. {step}</span>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-200">Your workspace map</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{page.groups.map(({title,description,icon:Icon},index)=><motion.div key={title} animate={reduced ? undefined : { y: [0,-5,0] }} transition={{duration:4.5+index*.35,repeat:Infinity,delay:index*.25}} className="rounded-[1.75rem] border border-white/15 bg-white/[.08] p-5 backdrop-blur"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-violet-950"><Icon size={19}/></span><h2 className="mt-5 font-bold">{title}</h2><p className="mt-2 text-xs leading-5 text-zinc-400">{description}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div initial={{width:"18%"}} whileInView={{width:`${58+index*9}%`}} viewport={{once:true}} transition={{duration:.8,delay:index*.1}} className="h-full rounded-full bg-violet-300"/></div></motion.div>)}</div></div></div>
      </div>

      <div id="universe-features" className="mt-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-700">Everything included</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">One focused workspace.<br/>Every essential tool.</h2></div><div className="mt-8 grid gap-5 lg:grid-cols-2">
        {page.groups.map(({ title, description, features, icon: Icon }, groupIndex) => <motion.article key={title} initial={reduced ? false : {opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.16}} transition={{duration:.45,delay:groupIndex*.06}} className="rounded-[2.25rem] border border-violet-100 bg-white p-7 shadow-[0_24px_70px_-48px_rgba(55,30,75,.6)] sm:p-9">
          <div className="flex items-start justify-between gap-4"><span className="jv-brand-gradient grid h-13 w-13 place-items-center rounded-2xl text-white"><Icon size={23}/></span><span className="text-xs font-black text-violet-200">0{groupIndex + 1}</span></div>
          <h3 className="mt-7 text-2xl font-bold tracking-[-.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{features.map(feature => <li key={feature} className="flex gap-3 rounded-2xl bg-violet-50/60 p-4 text-sm leading-6 text-zinc-700"><BadgeCheck className="mt-0.5 shrink-0 text-violet-700" size={17}/><span>{feature}</span></li>)}</ul>
        </motion.article>)}
      </div>

      <section className="mt-16 rounded-[3rem] border border-violet-100 bg-white p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-700">How your journey flows</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">From first step to meaningful outcome.</h2><div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><motion.div aria-hidden="true" initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true,amount:.5}} transition={{duration:1.15,ease:[.22,1,.36,1]}} className="absolute left-[8%] right-[8%] top-4 hidden h-0.5 origin-left bg-gradient-to-r from-violet-300 via-violet-600 to-violet-300 xl:block"/>{page.journey.map((step, index) => <motion.article key={step} initial={reduced?false:{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.14}} className="jv-spotlight relative rounded-[1.75rem] bg-violet-50/70 p-6"><span className="text-sm font-black text-violet-300">0{index + 1}</span><h3 className="mt-5 text-xl font-bold leading-7">{step}</h3></motion.article>)}</div></section><div className="mt-6 grid gap-4 md:grid-cols-2">{page.notes.map((note, index) => <div key={note} className="flex gap-4 rounded-[1.5rem] border border-violet-100 bg-white p-5 text-sm leading-6 text-zinc-600"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-800">{index === 0 ? <ShieldCheck size={18}/> : <LockKeyhole size={18}/>}</span>{note}</div>)}</div>

      <div className="jv-brand-gradient mt-6 overflow-hidden rounded-[3rem] p-8 text-white sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-200">Ready to enter?</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Unlock your complete {universe} workspace.</h2><p className="mt-4 max-w-2xl text-zinc-300">Create a new account or continue securely with your existing JobiVerse login.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link href={page.signupHref} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">{page.signupLabel}<ArrowRight size={17}/></Link><Link href={page.loginHref} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white">{page.loginLabel}<UserRound size={17}/></Link></div></div></div>
    </div>
  </section></main>;
}
