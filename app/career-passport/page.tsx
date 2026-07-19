import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, ExternalLink, Globe2, Plus, Sparkles, Trash2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { JobiVerseCard } from "@/components/candidate/jobiverse-card";
import { savePassport, addPassportItem, removePassportItem } from "./actions";

export default async function JobiVerseCardPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=%2Fcareer-passport");

  const { data: account } = await supabase.from("users").select("id,role,is_active,full_name,avatar_url").eq("id", user.id).maybeSingle();
  if (!account || account.is_active === false || account.role !== "candidate") redirect("/login/candidate?next=%2Fcareer-passport&error=wrong_role");

  const [{ data: passport }, { data: profile }, { data: items }] = await Promise.all([
    supabase.from("career_passports").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("candidate_profiles").select("headline,current_location,total_experience,primary_skills,preferred_roles,role_level,industry,functional_area,work_mode,open_to_work,profile_completion").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_passport_items").select("*").eq("user_id", user.id).order("item_type").order("sort_order"),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">JobiVerse Card updated successfully.</div>}
        <section className="relative overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.15),transparent_20rem),linear-gradient(135deg,#09090b,#18181b_55%,#3f3f46)] p-8 text-white shadow-2xl sm:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <Globe2 className="relative z-10 text-zinc-300" />
          <p className="relative z-10 mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Universal professional identity</p>
          <h1 className="relative z-10 mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Your JobiVerse Card.</h1>
          <p className="relative z-10 mt-4 max-w-3xl text-zinc-400">A premium profile card that travels with every job application, talent search result and public share link across JobiVerse.</p>
          {passport?.visibility === "public" && (
            <Link href={`/p/${passport.public_slug}`} target="_blank" className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950">View public card <ExternalLink size={16} /></Link>
          )}
        </section>

        <div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-6">
            <JobiVerseCard person={account} profile={profile} passport={passport} items={items} editable />
            <form action={savePassport} className="rounded-[2rem] border bg-white p-7">
              <h2 className="text-2xl font-bold">Card settings</h2>
              <input name="headline" defaultValue={passport?.headline ?? ""} placeholder="Professional headline / current job title" className="mt-5 h-12 w-full rounded-xl border bg-zinc-50 px-4" />
              <textarea name="summary" defaultValue={passport?.summary ?? ""} maxLength={1200} placeholder="Professional story, career direction and strongest outcomes" className="mt-3 min-h-32 w-full rounded-xl border bg-zinc-50 p-4" />
              <select name="visibility" defaultValue={passport?.visibility ?? "private"} className="mt-3 h-12 w-full rounded-xl border bg-zinc-50 px-3"><option value="private">Private inside JobiVerse</option><option value="public">Public and shareable</option></select>
              <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border p-4 text-sm font-semibold"><input type="checkbox" name="openToOpportunities" defaultChecked={passport?.open_to_opportunities} />Open to relevant opportunities</label>
              <Link href="/candidates/profile" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold">Edit experience, skills and search filters</Link>
              <button className="mt-3 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">Save card</button>
            </form>

            <form action={addPassportItem} className="rounded-[2rem] border bg-white p-7">
              <div className="flex items-center gap-3"><Plus /><h2 className="text-2xl font-bold">Add evidence</h2></div>
              <select name="type" className="mt-5 h-12 w-full rounded-xl border bg-zinc-50 px-3">{["skill", "project", "achievement", "experience", "education", "credential"].map((type) => <option key={type} value={type}>{type}</option>)}</select>
              <input name="title" required minLength={2} placeholder="Title" className="mt-3 h-12 w-full rounded-xl border bg-zinc-50 px-4" />
              <input name="issuer" placeholder="Company, institution or issuer" className="mt-3 h-12 w-full rounded-xl border bg-zinc-50 px-4" />
              <textarea name="description" maxLength={1200} placeholder="Context, responsibility, result or learning" className="mt-3 min-h-24 w-full rounded-xl border bg-zinc-50 p-4" />
              <input name="evidence" type="url" placeholder="Evidence URL (optional)" className="mt-3 h-12 w-full rounded-xl border bg-zinc-50 px-4" />
              <button className="mt-5 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">Add to card</button>
            </form>
          </div>

          <section className="rounded-[2rem] border bg-white p-7">
            <div className="flex items-center gap-3"><Sparkles className="text-zinc-400" /><h2 className="text-2xl font-bold">Card evidence</h2></div>
            <div className="mt-6 space-y-4">
              {items?.length ? items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-zinc-200 p-5">
                  <div className="flex justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{item.item_type}</p><h3 className="mt-2 text-lg font-bold">{item.title}</h3><p className="mt-1 text-sm text-zinc-500">{item.issuer}</p></div><span className={`h-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${item.verification_status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{item.verification_status === "verified" && <BadgeCheck className="mr-1 inline" size={12} />} {item.verification_status.replaceAll("_", " ")}</span></div>
                  {item.description && <p className="mt-4 text-sm leading-6 text-zinc-600">{item.description}</p>}
                  <div className="mt-4 flex gap-3">{item.evidence_url && <a href={item.evidence_url} target="_blank" className="text-xs font-semibold underline">View evidence</a>}{item.verification_status !== "verified" && <form action={removePassportItem}><input type="hidden" name="id" value={item.id} /><button className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-600"><Trash2 size={13} /> Remove</button></form>}</div>
                </article>
              )) : <p className="rounded-2xl border border-dashed p-12 text-center text-zinc-500">Add your first skill, project or credential.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
