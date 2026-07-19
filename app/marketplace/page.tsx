import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  GraduationCap,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { serviceSlugForCategory } from "@/lib/marketplace/category-map";
import { customerPrice } from "@/lib/marketplace/pricing";
import { creatorServiceGroups } from "@/lib/marketplace/creator-service-options";
import type { ServiceAudience } from "@/lib/marketplace/service-catalog";

const groups: Array<{
  audience: ServiceAudience;
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    audience: "professional",
    id: "for-professionals",
    label: "For Professionals",
    title: "Services for your next career move.",
    description:
      "Optional expert and AI-assisted support for profiles, interviews, transitions and growth.",
    icon: UserRoundCheck,
  },
  {
    audience: "student",
    id: "for-students",
    label: "For Students & Graduates",
    title: "Start with direction and confidence.",
    description:
      "Practical support for first resumes, interviews, employability and career planning.",
    icon: GraduationCap,
  },
  {
    audience: "employer",
    id: "for-employers",
    label: "For Employers",
    title: "Expert support for better hiring.",
    description:
      "Focused professional services for requirements, screening and hiring strategy.",
    icon: Building2,
  },
];

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ search?: string; audience?: string }> }) {
  const { search = "", audience } = await searchParams;
  const audienceFilter=audience==="employer"||audience==="student"||audience==="professional"?audience:null;
  const visibleGroups=audienceFilter?groups.filter(group=>group.audience===audienceFilter):groups;
  const normalizedSearch = search.trim().toLowerCase();
  const supabase = await createServerSupabaseClient();
  let servicesQuery = supabase
    .from("marketplace_services")
    .select("id,provider_id,title,slug,category,audience,short_description,price,delivery_days,delivery_mode,average_rating,total_orders,is_featured,featured_until,quality_score")
    .eq("status", "published").or("is_editable.eq.false,template_review_status.eq.approved");
  if(audienceFilter)servicesQuery=servicesQuery.eq("audience",audienceFilter);
  const {data:publishedServices}=await servicesQuery.order("created_at",{ascending:false});
  const featuredServices=(publishedServices??[]).filter(service=>service.is_featured&&(!service.featured_until||new Date(service.featured_until)>new Date())).sort((a,b)=>Number(b.quality_score)-Number(a.quality_score)).slice(0,6);
  const featuredProviderIds=[...new Set(featuredServices.map(service=>service.provider_id))];
  const [{data:featuredPeople},{data:featuredVerification}]=await Promise.all([featuredProviderIds.length?supabase.from("users").select("id,full_name").in("id",featuredProviderIds):Promise.resolve({data:[]}),featuredProviderIds.length?supabase.from("creator_marketplace_profiles").select("creator_id,verification_status").in("creator_id",featuredProviderIds):Promise.resolve({data:[]})]);
  const featuredNames=new Map((featuredPeople??[]).map(person=>[person.id,person.full_name]));const verifiedCreators=new Set((featuredVerification??[]).filter(row=>row.verification_status==="verified").map(row=>row.creator_id));
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-zinc-950">
      <PageHeader
        eyebrow="JobiVerse Marketplace"
        title={audienceFilter==="employer"?"Specialist support for every hiring decision.":"Human Expertise. AI Possibilities. One Service Universe."}
        description={audienceFilter==="employer"?"Explore only employer-focused hiring, screening, research and recruitment consulting services.":"Explore verified professionals and future-ready AI services organized around the journey you are on."}
      />

      <div className="mx-auto max-w-[1450px] space-y-8 px-5 pb-24 sm:px-8">
        <form action="/marketplace" className="flex flex-col gap-3 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">{audienceFilter&&<input type="hidden" name="audience" value={audienceFilter}/>}<input name="search" defaultValue={search} className="min-h-14 flex-1 rounded-2xl bg-zinc-100 px-5 text-sm outline-none focus:ring-2 focus:ring-zinc-950" placeholder={audienceFilter==="employer"?"Search hiring consultation, screening, market mapping...":"Search resume writing, CV templates, interview support, hiring services..."}/><button className="rounded-2xl bg-zinc-950 px-7 py-4 font-semibold text-white">Search services</button>{search && <Link href={audienceFilter?`/marketplace?audience=${audienceFilter}`:"/marketplace"} className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 px-5 py-4 text-sm font-semibold">Clear</Link>}</form>
        {!!featuredServices.length&&<section className="overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-violet-950 via-zinc-950 to-zinc-900 p-7 text-white shadow-2xl sm:p-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Featured by JobiVerse</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Services worth discovering.</h2><p className="mt-2 text-sm text-zinc-400">Quality-reviewed creator listings with premium marketplace placement.</p></div><Sparkles className="text-violet-300"/></div><div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{featuredServices.map(service=><article key={service.id} className="rounded-[1.75rem] border border-white/10 bg-white/[.07] p-6"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold uppercase">Featured</span>{verifiedCreators.has(service.provider_id)&&<span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-emerald-300"><BadgeCheck size={12}/>Verified</span>}</div><h3 className="mt-5 text-xl font-semibold">{service.title}</h3><p className="mt-2 text-xs text-zinc-400">by {featuredNames.get(service.provider_id)??"JobiVerse Creator"}</p><p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-300">{service.short_description}</p><div className="mt-5 flex items-center justify-between"><p className="font-semibold">INR {customerPrice(Number(service.price)).toLocaleString("en-IN")}</p><Link href={`/marketplace/services/${service.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black">Explore <ArrowRight size={14}/></Link></div></article>)}</div></section>}
        {visibleGroups.map((group, index) => {
          const Icon = group.icon;
          const dark = index % 2 === 1;
          const services = (creatorServiceGroups.find(serviceGroup => serviceGroup.audience === group.audience)?.services ?? []).filter(service => !normalizedSearch || service.title.toLowerCase().includes(normalizedSearch) || service.description.toLowerCase().includes(normalizedSearch)).map(service => ({ ...service, slug: serviceSlugForCategory(service.title), category: service.title, providers: [] as Array<{rating:number}>, startingPrice: 0 }));
          const creatorServices: typeof publishedServices = [];

          return (
            <section
              id={group.id}
              key={group.id}
              className={`scroll-mt-28 overflow-hidden rounded-[2.75rem] border ${dark ? "border-white/10 bg-zinc-950 text-white" : "border-zinc-200 bg-white"}`}
            >
              <div
                className={`grid gap-6 border-b p-7 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-12 ${dark ? "border-white/10 bg-white/[.04]" : "border-zinc-200 bg-zinc-50"}`}
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-[1.35rem] ${dark ? "bg-white text-black" : "bg-black text-white"}`}
                >
                  <Icon size={28} />
                </span>
                <div>
                  <div className="flex items-center">
                    <p className={`text-2xl font-bold uppercase tracking-[.03em] sm:text-3xl ${dark ? "text-white" : "text-zinc-950"}`}>
                      {group.label}
                    </p>
                  </div>
                  <h2 className={`mt-3 text-lg font-semibold tracking-[-.015em] sm:text-xl ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                    {group.title}
                  </h2>
                  <p className={`mt-3 max-w-2xl text-sm leading-6 ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
                    {group.description}
                  </p>
                </div>
                <div className={`w-fit rounded-2xl px-5 py-3 text-sm font-semibold ${dark ? "bg-white/10 text-zinc-300" : "bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200"}`}>
                  {services.length} services available
                </div>
              </div>

              <div className="grid gap-4 p-7 sm:p-10 md:grid-cols-2 xl:grid-cols-3 lg:p-12">
                {creatorServices.map((service) => (
                  <article key={service.id} className={`rounded-[2rem] border p-7 ${dark ? "border-white/10 bg-white/[.05]" : "border-zinc-200 bg-zinc-50"}`}>
                    <div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-white text-black" : "bg-black text-white"}`}><UserRoundCheck size={19}/></span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${dark ? "bg-white/10 text-zinc-300" : "bg-emerald-50 text-emerald-700"}`}><BadgeCheck size={12}/> Creator service</span></div>
                    <h3 className="mt-7 text-xl font-semibold">{service.title}</h3><p className={`mt-3 min-h-12 text-sm leading-6 ${dark ? "text-zinc-400" : "text-zinc-600"}`}>{service.short_description}</p>
                    <div className={`mt-5 flex items-center gap-4 text-xs ${dark ? "text-zinc-500" : "text-zinc-500"}`}><span>{service.delivery_days} day delivery</span><span>{service.total_orders} orders</span>{Number(service.average_rating) > 0 && <span>{Number(service.average_rating).toFixed(1)} ★</span>}</div>
                    <div className={`my-5 h-px ${dark ? "bg-white/10" : "bg-zinc-200"}`}/><div className="flex items-center justify-between gap-3"><p className="font-semibold">₹{Number(service.price).toLocaleString("en-IN")}</p><Link href={`/marketplace/services/${service.slug}`} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}>Explore <ArrowRight size={14}/></Link></div>
                  </article>
                ))}
                {services.map((service) => (
                  <article
                    key={`${group.audience}-${service.category}`}
                    className={`rounded-[2rem] border p-7 ${dark ? "border-white/10 bg-white/[.05]" : "border-zinc-200 bg-zinc-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-white text-black" : "bg-black text-white"}`}>
                        <Sparkles size={19} />
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${dark ? "bg-white/10 text-zinc-400" : "bg-white text-zinc-500"}`}>
                        <Bot size={12} /> AI coming soon
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold">{service.title}</h3>
                    <p className={`mt-3 min-h-12 text-sm leading-6 ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {service.description}
                    </p>
                    <p className={`mt-4 text-xs font-semibold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>Creator-powered service</p>
                    <div className={`mt-5 flex items-center gap-4 text-xs ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
                      <span className="inline-flex items-center gap-1">
                        <UsersRound size={14} /> {countExperts(publishedServices ?? [], service.category)} available
                      </span>
                      {false && service.providers[0] && (
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck size={14} /> {service.providers[0].rating} ★
                        </span>
                      )}
                    </div>
                    <div className={`my-5 h-px ${dark ? "bg-white/10" : "bg-zinc-200"}`} />
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{publicStartingPrice(publishedServices ?? [], service.category) !== null ? `From ₹${publicStartingPrice(publishedServices ?? [], service.category)!.toLocaleString("en-IN")}` : "Creators joining soon"}</p>
                      <Link
                        href={`/marketplace/services/${service.slug}?type=${encodeURIComponent(service.category)}`}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}
                      >
                        Explore <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

type PublicListing = { provider_id: string; category: string; price: number | string };

function matchingListings(listings: PublicListing[], category: string) {
  return listings.filter(listing => listing.category === category);
}

function countExperts(listings: PublicListing[], category: string) {
  return matchingListings(listings, category).length + 1;
}

function publicStartingPrice(listings: PublicListing[], category: string) {
  const prices = matchingListings(listings, category).map(listing => customerPrice(Number(listing.price)));
  return prices.length ? Math.min(...prices) : null;
}
