import { notFound } from "next/navigation";
import { BadgeCheck, Globe2 } from "lucide-react";
import { JobiVerseCard } from "@/components/candidate/jobiverse-card";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function PublicPassport({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: passport } = await adminSupabase
    .from("career_passports")
    .select("user_id,headline,summary,open_to_opportunities,public_slug,visibility")
    .eq("public_slug", slug)
    .eq("visibility", "public")
    .maybeSingle();
  if (!passport) notFound();

  await adminSupabase.from("candidate_card_views").insert({
    candidate_user_id: passport.user_id,
    public_slug: passport.public_slug,
    source: "public_card",
  });

  const [{ data: person }, { data: profile }, { data: items }] = await Promise.all([
    adminSupabase.from("users").select("full_name,avatar_url").eq("id", passport.user_id).single(),
    adminSupabase.from("candidate_profiles").select("headline,current_location,total_experience,primary_skills,preferred_roles,role_level,industry,functional_area,work_mode,open_to_work,profile_completion").eq("user_id", passport.user_id).maybeSingle(),
    adminSupabase.from("career_passport_items").select("id,item_type,title,issuer,description,evidence_url,verification_status").eq("user_id", passport.user_id).order("item_type"),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,.16),transparent_22rem),linear-gradient(135deg,#09090b,#18181b_55%,#3f3f46)] p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <Globe2 className="relative z-10" />
          <p className="relative z-10 mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Verified-style professional identity</p>
          <h1 className="relative z-10 mt-3 text-4xl font-semibold sm:text-6xl">JobiVerse Card</h1>
          <p className="relative z-10 mt-4 max-w-3xl text-zinc-400">A portable career card combining skills, experience, evidence and opportunity status inside the JobiVerse ecosystem.</p>
        </section>
        <div className="mt-7"><JobiVerseCard person={person} profile={profile} passport={passport} items={items} /></div>
        <section className="mt-7">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Verified evidence</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Experience, skills and achievements.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          {items?.map((item) => (
            <article key={item.id} className="rounded-3xl border bg-white p-6">
              <div className="flex justify-between gap-3"><p className="text-xs font-bold uppercase text-zinc-400">{item.item_type}</p><span className={`text-[10px] font-bold uppercase ${item.verification_status === "verified" ? "text-emerald-700" : "text-zinc-400"}`}>{item.verification_status === "verified" && <BadgeCheck className="mr-1 inline" size={12} />} {item.verification_status?.replaceAll("_", " ")}</span></div>
              <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{item.issuer}</p>
              <p className="mt-4 text-sm leading-6 text-zinc-600">{item.description}</p>
              {item.evidence_url && <a href={item.evidence_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-semibold underline">View evidence</a>}
            </article>
          ))}
          </div>
        </section>
      </div>
    </main>
  );
}
