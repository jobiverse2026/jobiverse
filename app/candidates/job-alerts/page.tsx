import Link from "next/link";
import { ArrowLeft, BellRing, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { saveJobAlerts } from "./actions";
import { JOB_SECTORS } from "@/lib/jobs/sectors";

export default async function CandidateJobAlertsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { supabase, user } = await requireRole(["candidate"]);
  const { data: preferences } = await supabase.from("candidate_job_alert_preferences").select("*").eq("user_id", user.id).maybeSingle();
  const workModes = new Set<string>(preferences?.work_modes ?? []);
  const selectedSectors = new Set<string>(preferences?.sectors ?? []);
  const selectedJobTypes = new Set<string>(preferences?.job_types ?? []);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/candidates/dashboard" className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm"><ArrowLeft size={16}/>Talent Dashboard</Link>
        <section className="mt-7 rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12">
          <BellRing />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Job alerts preferences</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Let the right roles find you.</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">Tell JobiVerse what matters. Matching direct roles can reach your notification bell and, when enabled in account settings, your email—without flooding you with every vacancy.</p>
        </section>
        {saved && <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Job alert preferences saved successfully.</p>}
        <form action={saveJobAlerts} className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="roleTitles" label="Preferred role titles" icon={<BriefcaseBusiness size={16}/>} defaultValue={preferences?.role_titles ?? ""} placeholder="React Developer, HR Executive, Data Analyst" />
            <Field name="locations" label="Preferred locations" icon={<MapPin size={16}/>} defaultValue={preferences?.locations ?? ""} placeholder="Mumbai, Pune, Remote" />
            <Field name="experienceRange" label="Experience range" defaultValue={preferences?.experience_range ?? ""} placeholder="2-5 years" />
            <Field name="salaryExpectation" label="Salary expectation" defaultValue={preferences?.salary_expectation ?? ""} placeholder="8-12 LPA" />
          </div>
          <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
            <p className="text-sm font-semibold">Work mode</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {["Remote", "Hybrid", "Office"].map((mode) => (
                <label key={mode} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold">
                  <input type="checkbox" name="workModes" value={mode} defaultChecked={workModes.has(mode)} /> {mode}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-zinc-50 p-5">
            <p className="text-sm font-semibold">Preferred sectors</p>
            <div className="mt-3 flex flex-wrap gap-2">{JOB_SECTORS.map((sector) => <label key={sector.value} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold"><input type="checkbox" name="sectors" value={sector.value} defaultChecked={selectedSectors.has(sector.value)}/>{sector.label}</label>)}</div>
          </div>
          <div className="mt-5 rounded-2xl bg-zinc-50 p-5">
            <p className="text-sm font-semibold">Employment types</p>
            <div className="mt-3 flex flex-wrap gap-3">{["Full-time","Part-time","Contract","Internship"].map((type) => <label key={type} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold"><input type="checkbox" name="jobTypes" value={type} defaultChecked={selectedJobTypes.has(type)}/>{type}</label>)}</div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block text-sm font-semibold">Alert frequency
              <select name="frequency" defaultValue={preferences?.frequency ?? "instant"} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4">
                <option value="instant">Instant</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-5 py-4 text-sm font-semibold">
              <input name="isActive" type="checkbox" defaultChecked={preferences?.is_active ?? true} /> Alerts active
            </label>
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500">Email delivery follows your account notification preferences. You can change those anytime from your profile menu.</p>
          <button className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-7 py-3 font-semibold text-white">
            Save job alerts <Sparkles size={16}/>
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ name, label, defaultValue, placeholder, icon }: { name: string; label: string; defaultValue?: string; placeholder?: string; icon?: React.ReactNode }) {
  return <label className="block text-sm font-semibold">{label}<span className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4">{icon}<input name={name} defaultValue={defaultValue} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent font-normal outline-none"/></span></label>;
}
