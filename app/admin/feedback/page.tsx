import { MessageSquareText } from "lucide-react";

import { updateFeedback } from "./actions";
import { requireRole } from "@/lib/auth/authorization";

const statuses = ["new", "reviewing", "planned", "resolved", "dismissed"];

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ status?: string; id?: string }> }) {
  const [filters, { supabase }] = await Promise.all([searchParams, requireRole(["admin"])]);
  let query = supabase
    .from("user_feedback")
    .select("id,user_id,role_snapshot,category,area,subject,details,rating,page_url,status,admin_note,created_at")
    .order("created_at", { ascending: false });
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.id) query = query.eq("id", filters.id);

  const { data, error } = await query.limit(100);
  if (error) throw new Error(error.message);

  const userIds = [...new Set((data ?? []).map((item) => item.user_id).filter(Boolean))];
  const { data: users, error: usersError } = userIds.length
    ? await supabase.from("users").select("id,full_name,email").in("id", userIds)
    : { data: [], error: null };
  if (usersError) throw new Error(usersError.message);
  const userMap = new Map((users ?? []).map((user) => [user.id, user]));

  return (
    <div className="space-y-7">
      <section className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 to-zinc-700 p-8 text-white">
        <MessageSquareText />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Voice of user</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Feedback operations</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">Turn user issues, ideas and service requests into an accountable operating queue.</p>
      </section>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <select name="status" defaultValue={filters.status || "all"} className="rounded-xl border border-zinc-200 px-4 py-3">
          <option value="all">All statuses</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <button className="cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">Apply filter</button>
      </form>

      <section className="grid gap-5">
        {data?.length ? data.map((item) => {
          const owner = userMap.get(item.user_id);
          return (
            <article key={item.id} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">{item.category.replaceAll("_", " ")}</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold">{item.status}</span>
                    {item.rating && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{item.rating}/5</span>}
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{item.subject}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{owner?.full_name || owner?.email || "Platform member"} · {item.role_snapshot} · {item.area}</p>
                </div>
                <time className="text-xs text-zinc-400">{new Date(item.created_at).toLocaleString("en-IN")}</time>
              </div>
              <p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-600">{item.details}</p>
              {item.page_url && <p className="mt-3 text-xs text-zinc-400">Related page: {item.page_url}</p>}
              <form action={updateFeedback} className="mt-6 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-[180px_1fr_auto]">
                <input type="hidden" name="id" value={item.id} />
                <select name="status" defaultValue={item.status} className="rounded-xl border border-zinc-200 px-4 py-3">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <input name="adminNote" defaultValue={item.admin_note || ""} placeholder="Internal resolution note" className="rounded-xl border border-zinc-200 px-4 py-3" />
                <button className="cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-bold text-white">Save</button>
              </form>
            </article>
          );
        }) : <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">No feedback in this queue.</div>}
      </section>
    </div>
  );
}
