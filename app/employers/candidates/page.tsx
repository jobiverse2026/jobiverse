import Link from "next/link";
import { ArrowLeft, BadgeIndianRupee, BriefcaseBusiness, CalendarCheck, MapPin, Users } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { firstRelation } from "@/lib/relations";

const clientVisibleStatuses = ["Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"];

export default async function EmployerCandidatesPage() {
  const { supabase, user } = await requireRole(["employer"]);

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, full_name, total_experience, current_location, primary_skills, notice_period, status, created_at, requirements!inner(job_title,employer_id), placements(status, offered_ctc, joining_date, replacement_end_date)")
    .eq("requirements.employer_id", user.id)
    .in("status", clientVisibleStatuses)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const offeredCandidates = (candidates ?? []).filter((candidate) => {
    const placement = firstRelation(candidate.placements);
    return placement ? ["offered", "accepted"].includes(placement.status.toLowerCase()) : false;
  });
  const stageSummary=clientVisibleStatuses.map(status=>({status,count:(candidates??[]).filter(candidate=>candidate.status===status).length})).filter(item=>item.count>0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_88%_22%,rgba(99,102,241,.11),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl">
        <Link href="/employers/dashboard" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition hover:-translate-x-1">
          <ArrowLeft size={16} /> Employer Dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.65)] sm:p-12 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Talent workspace</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Submitted candidates.</h1><p className="mt-5 max-w-2xl text-zinc-300">Review candidates shared by your JobiVerse recruitment team across active hiring mandates.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><Users size={20} /><span className="text-2xl font-semibold">{candidates?.length ?? 0}</span><span className="text-sm text-zinc-400">profiles</span></div>
        </div>

        {!!stageSummary.length&&<section className="mt-6 flex flex-wrap gap-3">{stageSummary.map(item=><div key={item.status} className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.status}</p><p className="mt-1 text-xl font-bold">{item.count}</p></div>)}</section>}

        {offeredCandidates.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Offer desk</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Active offers</h2></div><span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold">{offeredCandidates.length} active</span></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {offeredCandidates.map((candidate) => {
                const offer = firstRelation(candidate.placements);
                return <Link href={`/employers/candidates/${candidate.id}`} key={`offer-${candidate.id}`} className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 text-white shadow-xl transition hover:-translate-y-1"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><BadgeIndianRupee size={19} /></span><div><p className="font-semibold">{candidate.full_name}</p><p className="text-xs text-zinc-400">{candidate.requirements?.[0]?.job_title ?? "Hiring requirement"}</p></div></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize">{offer?.status}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-6"><div><p className="text-[10px] uppercase tracking-[.14em] text-zinc-400">Offered CTC</p><p className="mt-2 text-lg font-semibold">{offer?.offered_ctc ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(offer.offered_ctc) : "Pending"}</p></div><div><p className="text-[10px] uppercase tracking-[.14em] text-zinc-400">Joining</p><p className="mt-2 text-sm font-semibold">{offer?.joining_date ? new Date(offer.joining_date).toLocaleDateString("en-IN") : "To be confirmed"}</p></div></div></Link>;
              })}
            </div>
          </section>
        )}

        {!candidates?.length ? (
          <section className="mt-8 rounded-[2rem] border border-dashed border-zinc-300 bg-white/75 px-6 py-20 text-center backdrop-blur-xl">
            <Users className="mx-auto text-zinc-400" size={34} /><h2 className="mt-5 text-2xl font-semibold">No candidates shared yet</h2><p className="mx-auto mt-3 max-w-xl text-zinc-500">Profiles will appear here once your recruiter moves a candidate to Client Submitted.</p>
          </section>
        ) : (
          <section className="mt-12"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Talent pipeline</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">All candidates</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate) => (
              <Link href={`/employers/candidates/${candidate.id}`} key={candidate.id} className="block rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_24px_70px_-48px_rgba(0,0,0,.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 font-semibold text-white">{candidate.full_name.slice(0, 1).toUpperCase()}</div><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">{candidate.status}</span></div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight">{candidate.full_name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><BriefcaseBusiness size={15} /> {candidate.requirements?.[0]?.job_title ?? "Hiring requirement"}</p>
                <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5 text-sm text-zinc-600"><p>{candidate.total_experience || "Experience not specified"}</p><p className="flex items-center gap-2"><MapPin size={15} /> {candidate.current_location || "Location not specified"}</p><p className="line-clamp-2">{candidate.primary_skills || "Skills under review"}</p></div>
                {firstRelation(candidate.placements) && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-zinc-700 text-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2"><BadgeIndianRupee size={17} /><span className="text-xs font-bold uppercase tracking-[.16em]">Offer details</span></div><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold capitalize">{firstRelation(candidate.placements)?.status}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-5 py-5"><div><p className="text-[10px] uppercase tracking-wide text-zinc-400">Offered CTC</p><p className="mt-2 font-semibold">{firstRelation(candidate.placements)?.offered_ctc ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(firstRelation(candidate.placements)!.offered_ctc) : "Pending"}</p></div><div><p className="text-[10px] uppercase tracking-wide text-zinc-400">Joining</p><p className="mt-2 flex items-center gap-2 font-semibold"><CalendarCheck size={14} /> {firstRelation(candidate.placements)?.joining_date ? new Date(firstRelation(candidate.placements)!.joining_date).toLocaleDateString("en-IN") : "Pending"}</p></div></div>
                  </div>
                )}
                <p className="mt-6 text-sm font-semibold text-zinc-950">View profile →</p>
              </Link>
            ))}
          </div></section>
        )}
      </div>
    </main>
  );
}
