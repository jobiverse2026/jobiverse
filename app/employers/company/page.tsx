import CompanyProfileForm from "@/components/employer/company/CompanyProfileForm";
import { getCompany } from "@/actions/company";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";

export default async function CompanyPage() {
  const company = await getCompany();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_32%),linear-gradient(to_bottom_right,#fafafa,#f4f4f5)] px-6 py-12 lg:px-10">
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
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

      <CompanyProfileForm company={company} />
      </div>
    </main>
  );
}
