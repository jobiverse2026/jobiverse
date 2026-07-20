import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, Video } from "lucide-react";

import { formatIndiaDate, formatIndiaDateTime, formatIndiaTime, getTodayIstRange } from "@/lib/format/date-time";
import type { InterviewCalendarItem } from "@/lib/hiring/interview-calendar";

export function InterviewCalendarView({ interviews, role }: { interviews: InterviewCalendarItem[]; role: "employer" | "recruiter" }) {
  const { start, end } = getTodayIstRange();
  const todaysCount = interviews.filter((item) => {
    const time = new Date(item.interviewDate).getTime();
    return time >= start.getTime() && time < end.getTime();
  }).length;
  const grouped = interviews.reduce<Record<string, InterviewCalendarItem[]>>((acc, item) => {
    const key = formatIndiaDate(item.interviewDate);
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.15),transparent_20rem),linear-gradient(135deg,#09090b,#18181b_55%,#3f3f46)] p-8 text-white shadow-2xl sm:p-12">
          <CalendarDays className="text-zinc-300" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">{role === "employer" ? "Employer interview command center" : "Recruiter interview command center"}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Upcoming interviews.</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">See interviews grouped by date, open candidate context quickly and receive same-day reminders in your notification bell.</p>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <Metric title="Next 30 days" value={interviews.length} />
          <Metric title="Today" value={todaysCount} />
          <Metric title="Active calendar" value={interviews.length ? "Live" : "Empty"} />
        </section>

        <section className="mt-7 space-y-6">
          {Object.entries(grouped).length ? Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Interview date</p>
                  <h2 className="mt-1 text-2xl font-semibold">{day}</h2>
                </div>
                <span className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white">{items.length} interview{items.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[.14em] text-zinc-400">{item.interviewRound}</p>
                        <h3 className="mt-2 text-xl font-semibold">{item.candidateName}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{item.jobTitle}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${item.status === "scheduled" ? "bg-emerald-100 text-emerald-700" : item.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-zinc-200 text-zinc-600"}`}>{item.status}</span>
                    </div>
                    <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2"><Clock3 size={15} /> {formatIndiaTime(item.interviewDate)}</p>
                      <p className="flex items-center gap-2"><Video size={15} /> {item.interviewMode || "Mode not set"}</p>
                      <p className="flex items-center gap-2"><MapPin size={15} /> {item.interviewerName || "Panel not set"}</p>
                      <p className="font-semibold">Candidate: {item.candidateStatus}</p>
                    </div>
                    <p className="mt-4 rounded-xl bg-white p-3 text-xs font-semibold text-zinc-500">{formatIndiaDateTime(item.interviewDate)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={item.href} className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white">Open candidate <ArrowRight size={13} /></Link>
                      {item.meetingLink && <Link href={item.meetingLink} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold">Open meeting</Link>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )) : <p className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-14 text-center text-zinc-500">No upcoming interviews in the next 30 days.</p>}
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </article>
  );
}
