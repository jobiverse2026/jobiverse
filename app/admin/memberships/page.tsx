import { BadgeCheck, CheckCircle2, Clock3, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { planChecklist } from "@/lib/plans/deliverables";
import { updateSubscription } from "./actions";

export default async function AdminMembershipsPage() {
  await requireRole(["admin"]);
  const [{ data: items, error }, { data: people }] = await Promise.all([
    adminSupabase
      .from("platform_subscriptions")
      .select("id,user_id,status,admin_note,starts_at,ends_at,created_at,platform_plans(slug,name,audience,price,billing_interval)")
      .order("created_at", { ascending: false }),
    adminSupabase.from("users").select("id,full_name,email,role"),
  ]);

  if (error) throw new Error(error.message);
  const names = new Map((people ?? []).map((item) => [item.id, item]));

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] bg-zinc-950 p-9 text-white">
        <BadgeCheck />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Plan operations</p>
        <h1 className="mt-3 text-4xl font-bold">Memberships & Employer Plans.</h1>
        <p className="mt-3 text-zinc-400">Every request now includes the JobiVerse delivery checklist, so the team knows exactly what to activate or provide.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Clock3 />} label="Activation requests" value={(items ?? []).filter((item) => item.status === "requested").length} />
        <Metric icon={<BadgeCheck />} label="Active plans" value={(items ?? []).filter((item) => item.status === "active").length} />
        <Metric icon={<UsersRound />} label="Total records" value={items?.length ?? 0} />
      </section>

      <section className="space-y-4">
        {items?.length ? (
          items.map((item) => {
            const person = names.get(item.user_id);
            const plan = Array.isArray(item.platform_plans) ? item.platform_plans[0] : item.platform_plans;
            const checklist = planChecklist(plan?.slug, plan?.name);

            return (
              <article key={item.id} className="rounded-3xl border border-zinc-200 bg-white p-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{plan?.audience} | {plan?.billing_interval}</p>
                    <h2 className="mt-2 text-xl font-bold">{plan?.name ?? "Plan"}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {person?.full_name || person?.email} | {person?.email} | ₹{Number(plan?.price ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase">{item.status.replaceAll("_", " ")}</span>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700">What JobiVerse needs to do</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800">{checklist.summary}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {checklist.deliverables.map((deliverable) => (
                      <p key={deliverable} className="flex gap-2 text-sm leading-6 text-zinc-700">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                        {deliverable}
                      </p>
                    ))}
                  </div>
                </div>

                <form action={updateSubscription} className="mt-5 grid gap-3 border-t pt-5 lg:grid-cols-[210px_1fr_auto]">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} className="h-11 rounded-xl border px-3">
                    <option value="requested">Requested</option>
                    <option value="pending_payment">Pending payment</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input name="adminNote" defaultValue={item.admin_note ?? ""} placeholder="Payment verification, custom terms or decision" className="h-11 rounded-xl border px-4" />
                  <button className="cursor-pointer rounded-xl bg-zinc-950 px-6 font-semibold text-white">Save</button>
                </form>
              </article>
            );
          })
        ) : (
          <p className="rounded-3xl border border-dashed bg-white p-12 text-center text-zinc-500">No membership activity yet.</p>
        )}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="rounded-3xl border bg-white p-6">
      {icon}
      <p className="mt-5 text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}
