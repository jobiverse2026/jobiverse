import Link from "next/link";
import { ArrowLeft, BarChart3, Eye, Globe2, TrendingUp } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";

export default async function CandidateCardAnalyticsPage() {
  const { supabase, user } = await requireRole(["candidate"]);
  const [passportResult, viewsResult, weekResult] = await Promise.all([
    supabase.from("career_passports").select("public_slug,visibility").eq("user_id", user.id).maybeSingle(),
    supabase.from("candidate_card_views").select("id,created_at,source", { count: "exact" }).eq("candidate_user_id", user.id).order("created_at", { ascending: false }).limit(25),
    supabase.from("candidate_card_views").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const tableMissing = viewsResult.error?.code === "42P01" || weekResult.error?.code === "42P01";
  const recentViews = tableMissing ? [] : viewsResult.data ?? [];
  const totalViews = tableMissing ? 0 : viewsResult.count ?? 0;
  const weekViews = tableMissing ? 0 : weekResult.count ?? 0;
  const passport = passportResult.data;

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/candidates/dashboard" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">
          <ArrowLeft size={16} /> Talent dashboard
        </Link>
        <section className="mt-7 overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.15),transparent_20rem),linear-gradient(135deg,#09090b,#18181b_55%,#3f3f46)] p-8 text-white shadow-2xl sm:p-12">
          <Globe2 className="text-zinc-300" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Public card analytics</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">See who is discovering your JobiVerse Card.</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">Track public profile views so you understand whether your professional identity is getting attention.</p>
          {passport?.visibility === "public" && passport.public_slug && <Link href={`/p/${passport.public_slug}`} target="_blank" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950">Open public card</Link>}
        </section>

        {tableMissing && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">Analytics database is ready in code. Run the candidate public card analytics SQL migration to activate live counts.</p>}

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <Metric title="Total views" value={totalViews} icon={Eye} />
          <Metric title="Last 7 days" value={weekViews} icon={TrendingUp} />
          <Metric title="Visibility" value={passport?.visibility === "public" ? "Public" : "Private"} icon={BarChart3} />
        </section>

        <section className="mt-7 rounded-[2rem] border bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold">Recent public views</h2>
          <div className="mt-5 space-y-3">
            {recentViews.length ? recentViews.map((view) => (
              <article key={view.id} className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4">
                <div>
                  <p className="font-semibold">JobiVerse Card viewed</p>
                  <p className="mt-1 text-xs text-zinc-500">{view.source?.replaceAll("_", " ") ?? "public card"}</p>
                </div>
                <span className="text-sm font-semibold text-zinc-500">{new Date(view.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </article>
            )) : <p className="rounded-2xl border border-dashed p-10 text-center text-zinc-500">No public views yet. Share your JobiVerse Card after setting it to public.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number | string; icon: typeof Eye }) {
  return (
    <article className="rounded-[2rem] border bg-white p-7 shadow-sm">
      <Icon className="text-zinc-400" />
      <p className="mt-5 text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}
