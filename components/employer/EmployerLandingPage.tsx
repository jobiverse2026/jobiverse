import Link from "next/link";
import {
  ArrowRight, BarChart3, BriefcaseBusiness, Building2, CalendarDays, Check,
  CircleAlert, Clock3, FileCheck2, FolderKanban, Gauge, LockKeyhole,
  MessageSquareText, Search, ShieldCheck, Sparkles, UserCheck, UserPlus, Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { PageSectionIndex } from "@/components/common/page-section-index";

const workspaceFeatures = [
  { icon: Building2, title: "Master employer account", text: "Own company information, hiring visibility, seat limits and workspace controls from one verified account." },
  { icon: UserPlus, title: "Employer & recruiter seats", text: "Invite people by email, allocate access, suspend or restore seats and collaborate without sharing passwords." },
  { icon: BriefcaseBusiness, title: "Requirement command centre", text: "Create, edit, privately save, publish, close and assign every hiring requirement." },
  { icon: Users, title: "Unified candidate pipeline", text: "Direct applicants, recruiter submissions and JobiVerse candidates stay together with clear source labels." },
  { icon: CalendarDays, title: "Interview workspace", text: "Run multiple rounds, meeting details, reminders, feedback, ratings, outcomes and calendar exports." },
  { icon: FileCheck2, title: "Offers & placements", text: "Track CTC, joining date, acceptance, counteroffers, no-shows, replacements and completed placements." },
];

const qualityChecks = [
  "Salary, location, job type and experience clarity",
  "Skills, responsibilities and description strength",
  "Contradictory or excessive requirements",
  "Discriminatory, vague or coded language",
  "Candidate-fee, OTP and banking-information requests",
  "Scam-like wording and unsafe contact instructions",
];

const pipeline = [
  ["Applied", "Portal and sourced candidates"], ["Reviewed", "Card, resume and notes"],
  ["Shortlisted", "Folders and comparison"], ["Interview", "Rounds and feedback"],
  ["Offer", "CTC and joining terms"], ["Joined", "Placement and billing"],
];

const accessRows = [
  ["Create company workspace", "Included", "Included"],
  ["Publish jobs", "₹0 upfront", "Included"],
  ["Direct applicant pipeline", "Included", "Included"],
  ["Employer / recruiter seats", "Upgrade", "Included by scope"],
  ["Talent Search", "Upgrade", "Available"],
  ["JobiVerse sourcing & screening", "—", "Included"],
  ["Success commercial", "3% after direct hire joins", "Standard 5% after joining"],
];

export default function EmployerLandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <PageHeader eyebrow="JobiVerse for Employers" title="One workspace for every hire." description="Create a company workspace, give your hiring team controlled seats and run requirements, candidates, interviews, offers and placements without shared logins or scattered spreadsheets." />
      <PageSectionIndex items={[
        { label: "Workspace", href: "#workspace" }, { label: "Seats", href: "#seats" },
        { label: "Requirements", href: "#requirements" }, { label: "Pipeline", href: "#pipeline" },
        { label: "Hiring models", href: "#hiring-models" }, { label: "Upgrades", href: "#upgrades" },
        { label: "Interactive demo", href: "/employers/demo" },
      ]} />

      <section className="border-b border-zinc-800 bg-zinc-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-200"><Sparkles size={15} /> Free to start</span>
            <h2 className="mt-7 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Build the hiring team before buying the hiring stack.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">Publish a public role for ₹0 upfront, receive direct applications and manage the complete hiring journey. Add seats, Talent Search and managed recruitment only when you need them.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?role=employer" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">Create employer account <ArrowRight size={17} /></Link>
              <Link href="/employers/demo" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-semibold">Try workspace demo</Link>
            </div>
            <p className="mt-5 text-xs text-zinc-500">Candidates are never charged to apply or interview.</p>
          </div>
          <WorkspacePreview />
        </div>
      </section>

      <section id="workspace" className="py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle eyebrow="Company workspace" title="Every hiring responsibility has a clear owner." text="The master employer controls the company workspace while employers and recruiters receive individual, auditable access." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{workspaceFeatures.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[2rem] border border-zinc-200 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21} /></span><h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-zinc-600">{text}</p></article>)}</div>
      </div></section>

      <section id="seats" className="bg-[#f4f4f1] py-24"><div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
        <div><SectionTitle eyebrow="Controlled team access" title="Seats—not shared passwords." text="Keep company ownership with the master employer and distribute only the access each team member needs." />
          <div className="mt-8 space-y-4">{["Invite exact employer or recruiter emails", "Allocate recruiter allowance under employer seats", "Suspend, restore or remove access instantly", "Assign one or multiple recruiters to a requirement"].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-950 text-white"><Check size={14} /></span>{item}</div>)}</div>
          <Link href="/employers/team" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white">Open team workspace <ArrowRight size={17} /></Link>
        </div>
        <SeatMatrix />
      </div></section>

      <section id="requirements" className="py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div><SectionTitle eyebrow="Job Quality Assistant" title="Publish stronger, safer jobs." text="Every public requirement receives a stored 0–100 quality score. Critical safety issues are blocked server-side while the role can still be saved privately and corrected." />
            <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-7 text-white shadow-xl"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-200">Live quality score</p><p className="mt-2 text-6xl font-black">86<span className="text-2xl text-violet-200">/100</span></p></div><ShieldCheck size={48} /></div><p className="mt-5 text-sm leading-6 text-violet-100">Strong role. Add salary range and clarify interview mode before publishing.</p></div>
          </div>
          <div className="grid gap-3">{qualityChecks.map((item, index) => <div key={item} className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${index > 3 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{index > 3 ? <CircleAlert size={17} /> : <Check size={17} />}</span><p className="pt-2 text-sm font-semibold">{item}</p></div>)}</div>
        </div>
        <div className="mt-10 grid gap-4 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-4">{["Draft privately", "Publish publicly", "45-day lifecycle", "Close automatically"].map((item, index) => <div key={item} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black shadow-sm">{index + 1}</span><span className="text-sm font-semibold">{item}</span></div>)}</div>
      </div></section>

      <section id="pipeline" className="bg-zinc-950 py-24 text-white"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle dark eyebrow="Unified pipeline" title="One candidate journey, regardless of source." text="Direct portal applicants, recruiter submissions and JobiVerse Hiring Team candidates move through the same structured process." />
        <div className="mt-12 grid gap-4 md:grid-cols-3 xl:grid-cols-6">{pipeline.map(([label, detail], index) => <article key={label} className="rounded-3xl border border-white/10 bg-white/[.06] p-5"><span className="text-xs font-black text-violet-300">0{index + 1}</span><h3 className="mt-7 text-lg font-bold">{label}</h3><p className="mt-2 text-xs leading-5 text-zinc-400">{detail}</p></article>)}</div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{[
          { icon: UserCheck, title: "Candidate evaluation", text: "JobiVerse Card, secure resume, skills, source, comparison, folders and private notes." },
          { icon: MessageSquareText, title: "Candidate communication", text: "Application messages, attachments, offers, status alerts and candidate responses." },
          { icon: Clock3, title: "Automatic lifecycle", text: "Expiry, closure and candidate notifications reduce stale job inventory." },
        ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl bg-white p-6 text-zinc-950"><Icon size={22} /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p></article>)}</div>
      </div></section>

      <section id="hiring-models" className="py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle eyebrow="Two hiring models" title="Self-serve when you can. Managed support when you need it." text="Public hiring and JobiVerse-managed recruitment remain separate, transparent workflows." />
        <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-zinc-200 shadow-xl"><div className="grid grid-cols-[1.35fr_.8fr_.9fr] bg-zinc-950 px-5 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 sm:px-7"><span>Capability</span><span>Free portal</span><span>Managed hiring</span></div>{accessRows.map((row) => <div key={row[0]} className="grid grid-cols-[1.35fr_.8fr_.9fr] gap-2 border-b border-zinc-100 px-5 py-5 text-sm last:border-0 sm:px-7"><strong>{row[0]}</strong><span className="text-zinc-600">{row[1]}</span><span className="text-zinc-600">{row[2]}</span></div>)}</div>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Commercial clarity:</strong> 3% applies when a direct Jobs Portal applicant joins. Managed JobiVerse sourcing uses a standard 5% success fee, with negotiated commercials for volume partnerships.</div>
      </div></section>

      <section id="upgrades" className="bg-[#f4f4f1] py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle eyebrow="Paid upgrades" title="Add intelligence without replacing your workflow." text="Upgrade the same workspace with talent discovery, more seats, advanced reporting, hiring intelligence and 30-day Spotlight promotion." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[
          { icon: Gauge, title: "Hiring health", text: "Requirement activity, pipeline condition and quality scores." },
          { icon: BarChart3, title: "Advanced reports", text: "Requirement, recruiter, source and date-based exports." },
          { icon: FolderKanban, title: "Candidate folders", text: "Focused talent lists that keep full hiring context." },
          { icon: Search, title: "Talent Search", text: "Open-to-work professionals by skill, role, location and notice period." },
        ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[2rem] bg-white p-7 shadow-sm"><Icon size={23} /><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{text}</p></article>)}</div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/plans" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white">View upgrades <LockKeyhole size={17} /></Link><Link href="/employers/reports" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-4 font-semibold">Preview reports <BarChart3 size={17} /></Link></div>
      </div></section>

      <section className="bg-violet-700 py-24 text-white"><div className="mx-auto max-w-4xl px-6 text-center"><h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Your first job can go live for ₹0 upfront.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-violet-100">Create the workspace now, then grow into seats, Talent Search or managed hiring when the business case is clear.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/signup?role=employer" className="rounded-2xl bg-white px-7 py-4 font-bold text-violet-800">Create free workspace</Link><Link href="/consultations" className="rounded-2xl border border-white/25 px-7 py-4 font-semibold">Talk to JobiVerse</Link></div></div></section>
    </main>
  );
}

function WorkspacePreview() {
  return <div className="rounded-[2.5rem] border border-white/10 bg-white/[.06] p-5 shadow-2xl sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-500">Acme Technologies</p><h3 className="mt-1 text-xl font-semibold">Company hiring workspace</h3></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Workspace active</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><MiniStat label="Open roles" value="12" /><MiniStat label="Candidates" value="86" /><MiniStat label="Interviews" value="9" /></div><div className="mt-4 rounded-3xl bg-white p-5 text-zinc-950"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Seat control</p><p className="mt-1 font-semibold">8 of 12 seats assigned</p></div><Users size={24} /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full w-2/3 rounded-full bg-violet-600" /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-zinc-50 p-3"><p className="text-zinc-500">Employer seats</p><p className="mt-1 font-bold">3 / 4</p></div><div className="rounded-2xl bg-zinc-50 p-3"><p className="text-zinc-500">Recruiter seats</p><p className="mt-1 font-bold">5 / 8</p></div></div></div></div>;
}

function SeatMatrix() {
  return <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-xl"><div className="grid grid-cols-[1.2fr_.8fr_.8fr] bg-zinc-950 px-5 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400"><span>Access level</span><span>Control</span><span>Visibility</span></div>{[["Master employer", "All seats", "All hiring"], ["Employer seat", "Assigned team", "Company scope"], ["Recruiter seat", "Assigned roles", "Candidate scope"]].map((row) => <div key={row[0]} className="grid grid-cols-[1.2fr_.8fr_.8fr] gap-2 border-b border-zinc-100 px-5 py-5 text-sm last:border-0"><strong>{row[0]}</strong><span className="text-zinc-600">{row[1]}</span><span className="text-zinc-600">{row[2]}</span></div>)}</div>;
}

function SectionTitle({ eyebrow, title, text, dark = false }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return <div className="max-w-3xl"><p className={`text-xs font-bold uppercase tracking-[.2em] ${dark ? "text-violet-300" : "text-violet-700"}`}>{eyebrow}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">{title}</h2><p className={`mt-5 text-lg leading-8 ${dark ? "text-zinc-400" : "text-zinc-600"}`}>{text}</p></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}
