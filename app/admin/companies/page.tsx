import { BadgeCheck, Building2, MapPin, ShieldCheck, UsersRound } from "lucide-react";

import { updateCompanySeatLimits, updateCompanyVerification } from "@/app/admin/directory-actions";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; seats?: string; verified?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const { q = "" } = params;
  const now = new Date().toISOString();

  const [
    { data: companies, error },
    { data: owners },
    { data: requirements },
    { data: members },
    { data: invites },
  ] = await Promise.all([
    adminSupabase
      .from("companies")
      .select("id,owner_id,company_name,industry,company_size,location,city,state,is_verified,recruiter_seat_limit,employer_seat_limit,created_at")
      .order("created_at", { ascending: false })
      .limit(250),
    adminSupabase.from("users").select("id,full_name,email").eq("role", "employer"),
    adminSupabase.from("requirements").select("id,company_id,status"),
    adminSupabase.from("employer_team_members").select("id,company_id,status,role").eq("status", "active"),
    adminSupabase.from("employer_team_invitations").select("id,company_id,status,expires_at,role").eq("status", "pending").gt("expires_at", now),
  ]);

  if (error) throw new Error(error.message);

  const ownerMap = new Map((owners ?? []).map((owner) => [owner.id, owner]));
  const activeSeatMap = countByCompany(members ?? []);
  const pendingSeatMap = countByCompany(invites ?? []);
  const normalized = q.trim().toLowerCase();
  const rows = (companies ?? []).filter((company) =>
    !normalized ||
    [company.company_name, company.industry, company.location, company.city, company.state]
      .some((value) => value?.toLowerCase().includes(normalized))
  );
  const verifiedCount = (companies ?? []).filter((company) => company.is_verified).length;
  const successMessage = params.seats
    ? "Company seat limits updated successfully."
    : params.verified === "1"
      ? "Company verified successfully."
      : params.verified === "0"
        ? "Company verification removed successfully."
        : null;

  return (
    <div className="space-y-8">
      <Hero
        icon={<Building2 />}
        eyebrow="Employer directory"
        title="Company Management"
        description="Review companies, verification status, live hiring activity and recruiter seat access."
      />

      {successMessage && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Companies" value={(companies ?? []).length} />
        <Metric label="Verified" value={verifiedCount} />
        <Metric label="Awaiting verification" value={(companies ?? []).length - verifiedCount} />
      </section>

      <form className="rounded-3xl border border-zinc-200 bg-white p-5">
        <label className="text-sm font-semibold">
          Search companies
          <input
            name="q"
            defaultValue={q}
            placeholder="Company, industry or location"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500"
          />
        </label>
      </form>

      <section className="grid gap-5 xl:grid-cols-2">
        {rows.length ? (
          rows.map((company) => {
            const owner = ownerMap.get(company.owner_id);
            const companyRequirements = (requirements ?? []).filter((item) => item.company_id === company.id);
            const active = companyRequirements.filter((item) => !["Closed", "Cancelled", "On Hold"].includes(item.status)).length;
            const activeRecruiterSeats = activeSeatMap.get(`${company.id}:recruiter`) ?? 0;
            const pendingRecruiterSeats = pendingSeatMap.get(`${company.id}:recruiter`) ?? 0;
            const usedRecruiterSeats = activeRecruiterSeats + pendingRecruiterSeats;
            const recruiterSeatLimit = company.recruiter_seat_limit ?? 0;
            const recruiterSeatsLeft = Math.max(0, recruiterSeatLimit - usedRecruiterSeats);
            const activeEmployerSeats = activeSeatMap.get(`${company.id}:employer`) ?? 0;
            const pendingEmployerSeats = pendingSeatMap.get(`${company.id}:employer`) ?? 0;
            const usedEmployerSeats = activeEmployerSeats + pendingEmployerSeats;
            const employerSeatLimit = company.employer_seat_limit ?? 0;
            const employerSeatsLeft = Math.max(0, employerSeatLimit - usedEmployerSeats);

            return (
              <article key={company.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${company.is_verified ? "border-emerald-200" : "border-zinc-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {company.industry || "Industry not provided"}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">{company.company_name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Employer: {owner?.full_name || owner?.email || "Owner not linked"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${company.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {company.is_verified ? <BadgeCheck size={14} /> : <ShieldCheck size={14} />}
                    {company.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Small label="Requirements" value={String(companyRequirements.length)} />
                  <Small label="Active roles" value={String(active)} />
                  <Small label="Recruiter seats" value={`${usedRecruiterSeats} used / ${recruiterSeatsLeft} left`} />
                  <Small label="Employer seats" value={`${usedEmployerSeats} used / ${employerSeatsLeft} left`} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info icon={<MapPin size={15} />} label="Location" value={[company.location, company.city, company.state].filter(Boolean).join(", ") || "Location not provided"} />
                  <Info icon={<UsersRound size={15} />} label="Company size" value={company.company_size || "Not provided"} />
                </div>

                <form action={updateCompanySeatLimits} className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <input type="hidden" name="companyId" value={company.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Employer invite seats
                      <input
                        name="employerSeatLimit"
                        type="number"
                        min="0"
                        max="500"
                        defaultValue={employerSeatLimit}
                        className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-zinc-500"
                      />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Recruiter invite seats
                      <input
                        name="recruiterSeatLimit"
                        type="number"
                        min="0"
                        max="500"
                        defaultValue={recruiterSeatLimit}
                        className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-zinc-500"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Employer usage: {activeEmployerSeats} active + {pendingEmployerSeats} pending. Recruiter usage: {activeRecruiterSeats} active + {pendingRecruiterSeats} pending.
                  </p>
                  <button className="mt-3 cursor-pointer rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
                    Save seats
                  </button>
                </form>

                <form action={updateCompanyVerification} className="mt-5 border-t border-zinc-100 pt-5">
                  <input type="hidden" name="companyId" value={company.id} />
                  <button
                    name="verified"
                    value={company.is_verified ? "false" : "true"}
                    className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${company.is_verified ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-zinc-950 text-white hover:bg-zinc-800"}`}
                  >
                    {company.is_verified ? "Remove verification" : "Verify company"}
                  </button>
                </form>
              </article>
            );
          })
        ) : (
          <Empty text="No companies match this search." />
        )}
      </section>
    </div>
  );
}

function countByCompany(rows: { company_id: string | null; role?: string | null }[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    if (!row.company_id) return;
    const role = row.role === "employer" ? "employer" : "recruiter";
    const key = `${row.company_id}:${role}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}

function Hero({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <section className="rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-10">{icon}<p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">{eyebrow}</p><h1 className="mt-3 text-4xl font-bold">{title}</h1><p className="mt-3 text-zinc-400">{description}</p></section>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="rounded-3xl border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>;
}

function Small({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase text-zinc-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"><div className="flex items-center gap-2 text-zinc-500">{icon}<p className="text-[10px] font-bold uppercase tracking-wider">{label}</p></div><p className="mt-2 text-sm font-semibold text-zinc-800">{value}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-500 xl:col-span-2">{text}</p>;
}
