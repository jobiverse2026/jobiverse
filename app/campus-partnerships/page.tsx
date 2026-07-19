import { Building2, GraduationCap, Handshake, Presentation } from "lucide-react";

import { submitCampusEnquiry } from "./actions";

export default async function CampusPartnershipsPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const submitted = (await searchParams).submitted === "1";
  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12">
          <GraduationCap />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">JobiVerse Campus Connect</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Turn education into employability.</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">Structured career readiness, employer access, placement support and measurable outcomes for colleges, universities and training institutions.</p>
        </section>
        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <Card icon={<Presentation />} title="Career readiness" text="Resume labs, interview practice, workplace communication and industry orientation." />
          <Card icon={<Building2 />} title="Employer connection" text="Opportunity discovery, placement drives and role-aligned candidate preparation." />
          <Card icon={<Handshake />} title="Institution partnership" text="A tracked partnership desk with defined cohorts, outcomes and support ownership." />
        </section>
        <form action={submitCampusEnquiry} className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7 sm:p-9">
          <h2 className="text-3xl font-bold">Start a campus conversation</h2>
          <p className="mt-2 text-sm text-zinc-500">Our team will review the institution, cohort and required outcomes before proposing a programme.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Input name="institutionName" label="Institution name" /><Input name="institutionType" label="Institution type" />
            <Input name="contactName" label="Contact person" /><Input name="designation" label="Designation" required={false} />
            <Input name="email" label="Official email" type="email" /><Input name="phone" label="Phone" />
            <Input name="city" label="City" /><Input name="studentCount" label="Approximate student count" type="number" required={false} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">{["Placement support", "Career workshops", "Hiring drives", "Resume & interview labs"].map((value) => <label key={value} className="cursor-pointer rounded-full border px-4 py-2 text-sm"><input type="checkbox" name="interests" value={value} className="mr-2" />{value}</label>)}</div>
          <textarea name="message" maxLength={2000} placeholder="Programme goals, student profile and preferred timeline" className="mt-5 min-h-32 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4" />
          <button className="mt-5 cursor-pointer rounded-xl bg-zinc-950 px-7 py-4 font-semibold text-white">Submit partnership enquiry</button>
          {submitted && <div id="campus-enquiry-status" role="status" aria-live="polite" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-semibold text-emerald-800">Partnership enquiry submitted successfully. The JobiVerse team will review it and contact you.</div>}
        </form>
      </div>
    </main>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-3xl border border-zinc-200 bg-white p-7">{icon}<h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p></article>;
}

function Input({ name, label, type = "text", required = true }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-semibold">{label}<input name={name} type={type} required={required} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 font-normal" /></label>;
}
