import Link from "next/link";
import { BadgeCheck, Check, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cancelPlan, requestPlan } from "./actions";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: unknown;
};

const coreEmployerPlans = new Set(["employer-starter", "employer-growth", "employer-enterprise"]);

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ success?: string; audience?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(params.audience === "employer" ? "/login/employer?next=/plans" : "/login/candidate?next=/plans");

  const { data: person } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!["candidate", "employer"].includes(person?.role ?? "")) redirect("/dashboard");

  const [{ data: plans }, { data: subscriptions }] = await Promise.all([
    supabase.from("platform_plans").select("*").eq("audience", person!.role).eq("is_active", true).order("sort_order"),
    supabase.from("platform_subscriptions").select("id,plan_id,status,starts_at,ends_at,created_at,platform_plans(name,slug)").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const employer = person!.role === "employer";
  const allPlans = (plans ?? []) as Plan[];
  const corePlans = employer ? allPlans.filter((plan) => coreEmployerPlans.has(plan.slug)) : allPlans;
  const addOnPlans = employer ? allPlans.filter((plan) => !coreEmployerPlans.has(plan.slug)) : [];

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12">
          <Sparkles />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">{person!.role} plans</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Choose support, not restrictions.</h1>
          <p className="mt-4 max-w-3xl text-zinc-300">
            {employer
              ? "Job posting and direct applicant management remain free. Subscriptions unlock submitted profiles, team seats, reporting and hiring intelligence; Talent Search is a separate add-on."
              : "Job discovery and applications remain free. Paid plans cover optional guidance and acceleration."}
          </p>
        </section>

        {params.success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
            {params.success === "plan_cancelled" ? "Plan request cancelled successfully." : "Plan request sent to JobiVerse successfully. We will verify the plan and activate approved access."}
          </div>
        )}

        {employer && (
          <section className="mt-7 grid gap-5 rounded-[2.5rem] border border-emerald-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-[.15em] text-emerald-800">Free forever to start</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">Free Hiring Workspace</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">Post public roles, receive direct applications and manage direct applicant interviews and offers for ₹0 upfront. A 3% annual-CTC success fee applies only after a direct Jobs Portal applicant joins.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-zinc-600">
                {["Free job posting", "Direct applicants", "Interview workflow", "No subscription required"].map((item) => <span key={item} className="rounded-full bg-zinc-100 px-3 py-2">{item}</span>)}
              </div>
            </div>
            <Link href="/employers/requirements/new" className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-bold text-white">Post a job free</Link>
          </section>
        )}

        <PlanGroup title={employer ? "Employer subscriptions" : "Career subscriptions"} description={employer ? "These plans unlock the paid company workspace after JobiVerse approval." : "Optional plans for deeper career support."} plans={corePlans} />

        {employer && addOnPlans.length > 0 && (
          <PlanGroup title="Employer add-ons" description="Add-ons extend an active company workspace. Talent Search activates only after payment and admin approval." plans={addOnPlans} addOn />
        )}

        <section className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-7">
          <div className="flex items-center gap-3"><ShieldCheck /><h2 className="text-2xl font-bold">Plan history</h2></div>
          <div className="mt-5 space-y-3">
            {subscriptions?.length ? subscriptions.map((item) => {
              const plan = Array.isArray(item.platform_plans) ? item.platform_plans[0] : item.platform_plans;
              return (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4">
                  <div><p className="font-semibold">{plan?.name ?? "Plan"}</p><p className="mt-1 text-xs text-zinc-500">Requested {new Date(item.created_at).toLocaleDateString("en-IN")}</p></div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${item.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-white text-zinc-700"}`}>{item.status.replaceAll("_", " ")}</span>
                    {["requested", "active"].includes(item.status) && <form action={cancelPlan}><input type="hidden" name="subscriptionId" value={item.id} /><button className="cursor-pointer text-xs font-semibold text-red-600">Cancel</button></form>}
                  </div>
                </div>
              );
            }) : <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-zinc-500">No plan history yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function PlanGroup({ title, description, plans, addOn = false }: { title: string; description: string; plans: Plan[]; addOn?: boolean }) {
  return (
    <section className="mt-10">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[.18em] text-zinc-400">{addOn ? "Optional access" : "Core access"}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-zinc-950">{title}</h2>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const features = Array.isArray(plan.features) ? plan.features.map(String) : [];
          const featured = plan.slug.includes("growth") || plan.slug.includes("plus") || plan.slug === "employer-talent-search";
          return (
            <article key={plan.id} className={`rounded-[2rem] border bg-white p-7 ${featured ? "border-zinc-950 shadow-xl" : "border-zinc-200"}`}>
              <div className="flex items-center justify-between gap-3">
                {addOn ? <LockKeyhole /> : <BadgeCheck />}
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-600">{addOn ? "Add-on" : "Subscription"}</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">{plan.name}</h3>
              <p className="mt-3 min-h-16 text-sm leading-6 text-zinc-500">{plan.description}</p>
              <p className="mt-6 text-4xl font-bold">{plan.billing_interval === "custom" ? "Let's talk" : plan.price ? `₹${Number(plan.price).toLocaleString("en-IN")}` : "Free"}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">{plan.billing_interval}</p>
              <div className="mt-6 space-y-3">{features.map((feature) => <p key={feature} className="flex gap-2 text-sm"><Check className="shrink-0 text-emerald-600" size={17} />{feature}</p>)}</div>
              <form action={requestPlan} className="mt-7">
                <input type="hidden" name="planId" value={plan.id} />
                <button className="w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">{plan.billing_interval === "custom" ? "Request proposal" : "Request activation"}</button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
