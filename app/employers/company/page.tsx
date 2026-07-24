import CompanyProfileForm from "@/components/employer/company/CompanyProfileForm";
import { getCompany } from "@/actions/company";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";

export default async function CompanyPage() {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id).catch(() => null);
  const company = await getCompany();
  const canEdit = access?.isMasterEmployer ?? !company;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_32%),linear-gradient(to_bottom_right,#fafafa,#f4f4f5)] px-6 py-12 lg:px-10">
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
      {!company && (
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900 p-7 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Free employer onboarding</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your company workspace, then post jobs for free.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">There is no upfront job-posting charge. When a candidate applies directly through JobiVerse and successfully joins, a one-time success fee of 3% of the candidate&apos;s annual CTC applies.</p>
        </section>
      )}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
          <Sparkles size={16} /> Employer workspace
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
          Company Profile
        </h1>

        <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">
          Build a trusted company presence for faster, more relevant hiring.
        </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm">
            <Building2 size={18} /> Company identity
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            <ShieldCheck size={18} /> Secure profile
          </div>
        </div>
      </div>

      <CompanyProfileForm company={company} canEdit={canEdit} isOnboarding={!company} />
      </div>
    </main>
  );
}
