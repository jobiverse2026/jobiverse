import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Bot, Clock3, Sparkles, Star, UsersRound } from "lucide-react";
import { getMarketplaceService, marketplaceServices } from "@/lib/marketplace/service-catalog";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { categoriesForService, categoryBelongsToService } from "@/lib/marketplace/category-map";
import { customerPrice } from "@/lib/marketplace/pricing";
import { ListingViewTracker } from "@/components/marketplace/listing-view-tracker";
import { getJobiVerseOffer } from "@/lib/marketplace/jobiverse-offerings";
import { ReportServiceForm } from "@/components/marketplace/report-service-form";
import { ReviewActions } from "@/components/marketplace/review-actions";

export function generateStaticParams() {
  return marketplaceServices.map(service => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ type?: string }> }) {
  const { slug } = await params;
  const { type } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const catalogService = getMarketplaceService(slug);
  let service = catalogService ? { ...catalogService, providers: [...catalogService.providers] } : undefined;
  let trackedSlugs: string[] = [];
  const includedCategories = categoriesForService(slug);
  const selectedType = type && includedCategories.includes(type) ? type : null;
  const jobiVerseCategory = selectedType ?? includedCategories.find((category) => getJobiVerseOffer(category)) ?? null;
  const jobiVerseOffer = getJobiVerseOffer(jobiVerseCategory);
  if (!service) {
    const { data: listing } = await supabase.from("marketplace_services").select("id,provider_id,title,slug,short_description,creator_fit_reason,creator_relevant_experience,price,delivery_days,average_rating,review_count,total_orders,status,is_featured,featured_until").eq("slug", slug).eq("status", "published").or("is_editable.eq.false,template_review_status.eq.approved").maybeSingle();
    if (listing) {
      const [{ data: provider },{data:verification}] = await Promise.all([supabase.from("users").select("full_name").eq("id", listing.provider_id).maybeSingle(),supabase.from("creator_marketplace_profiles").select("verification_status").eq("creator_id",listing.provider_id).maybeSingle()]);
      service = {
        slug: listing.slug,
        title: listing.title,
        description: listing.short_description,
        audiences: [],
        modes: ["human"],
        expertCount: 1,
        startingPrice: Number(listing.price),
        aiStatus: "coming-soon",
        providers: [{ name: provider?.full_name ?? "JobiVerse Creator", title: "Independent Service Provider", fitReason: listing.creator_fit_reason, relevantExperience: listing.creator_relevant_experience, rating: Number(listing.average_rating),ratingCount:listing.review_count,reputation:reputationLevel(Number(listing.average_rating),listing.review_count,listing.total_orders,verification?.verification_status==="verified"), completedOrders: listing.total_orders, startingPrice: customerPrice(Number(listing.price)), delivery: `${listing.delivery_days} day${listing.delivery_days === 1 ? "" : "s"}`, verified: verification?.verification_status==="verified",isFeatured:listing.is_featured&&(!listing.featured_until||new Date(listing.featured_until)>new Date()),listingId:listing.id }],
      };
    }
  }
  if (!service) notFound();
  const bookingRole = service.audiences.includes("employer") && !service.audiences.includes("professional") && !service.audiences.includes("student") ? "employer" : "candidate";

  if (catalogService) {
    const { data: allListings } = await supabase.from("marketplace_services").select("id,provider_id,title,slug,category,audience,description,creator_fit_reason,creator_relevant_experience,price,delivery_days,average_rating,review_count,total_orders,quality_score,is_featured,featured_until").eq("status", "published").or("is_editable.eq.false,template_review_status.eq.approved");
    const relevantListings = (allListings ?? []).filter(listing => categoryBelongsToService(listing.category, slug) && catalogService.audiences.includes(listing.audience) && (!selectedType || listing.category === selectedType));
    if (relevantListings.length) {
      trackedSlugs = relevantListings.map(listing => listing.slug);
      const providerIds = [...new Set(relevantListings.map(listing => listing.provider_id))];
      const [{ data: profiles },{data:verificationRows}] = await Promise.all([supabase.from("users").select("id,full_name").in("id", providerIds),supabase.from("creator_marketplace_profiles").select("creator_id,verification_status").in("creator_id",providerIds)]);
      const profileNames = new Map((profiles ?? []).map(profile => [profile.id, profile.full_name]));
      const verificationMap=new Map((verificationRows??[]).map(row=>[row.creator_id,row.verification_status]));
      const rankedListings=[...relevantListings].sort((a,b)=>listingRank(b,verificationMap.get(b.provider_id)==="verified")-listingRank(a,verificationMap.get(a.provider_id)==="verified"));
      service.expertCount = providerIds.length;
      service.startingPrice = Math.min(...rankedListings.map(listing => customerPrice(Number(listing.price))));
      service.providers = rankedListings.map((listing, listingIndex) => ({
        name: profileNames.get(listing.provider_id) ?? `JobiVerse Creator ${listingIndex + 1}`,
        title: `${listing.title} - ${listing.description}`,
        fitReason: listing.creator_fit_reason,
        relevantExperience: listing.creator_relevant_experience,
        rating: Number(listing.average_rating),
        ratingCount:listing.review_count,
        reputation:reputationLevel(Number(listing.average_rating),listing.review_count,listing.total_orders,verificationMap.get(listing.provider_id)==="verified"),
        completedOrders: listing.total_orders,
        startingPrice: customerPrice(Number(listing.price)),
        delivery: `${listing.delivery_days} day${listing.delivery_days === 1 ? "" : "s"}`,
        verified: verificationMap.get(listing.provider_id)==="verified",
        isFeatured: listing.is_featured&&(!listing.featured_until||new Date(listing.featured_until)>new Date()),
        listingId: listing.id,
      }));
    } else {
      service.expertCount = 0;
      service.startingPrice = 0;
      service.providers = [];
    }
  }
  if (jobiVerseOffer) {
    service.providers = [{ name: "JobiVerse Personal", title: jobiVerseOffer.description, rating: 5, completedOrders: 0, startingPrice: jobiVerseOffer.price, priceLabel: jobiVerseOffer.priceLabel, delivery: jobiVerseOffer.delivery, verified: true, isJobiVerse: true, logoUrl: "/images/branding/jobiverse-logo.svg" }, ...service.providers];
    service.expertCount += 1;
    if (jobiVerseOffer.price > 0) service.startingPrice = service.startingPrice > 0 ? Math.min(service.startingPrice, jobiVerseOffer.price) : jobiVerseOffer.price;
  }
  const listingIds=service.providers.map(provider=>provider.listingId).filter((id):id is string=>Boolean(id));
  const {data:reviews}=listingIds.length?await supabase.from("marketplace_reviews").select("id,service_id,reviewer_id,rating,review,helpful_count,created_at").in("service_id",listingIds).eq("is_hidden",false).order("created_at",{ascending:false}).limit(24):{data:[]};
  const reviewerIds=[...new Set((reviews??[]).map(review=>review.reviewer_id))];const{data:reviewers}=reviewerIds.length?await supabase.from("users").select("id,full_name").in("id",reviewerIds):{data:[]};const reviewerNames=new Map((reviewers??[]).map(person=>[person.id,privateReviewerName(person.full_name)]));

  return <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-28 text-zinc-950 sm:px-8"><ListingViewTracker slugs={trackedSlugs}/>
    <section className="relative mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.18),transparent_23rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] px-7 py-16 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:px-12 lg:py-24"><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"/><div className="relative z-10 max-w-4xl"><Link href="/services" className="inline-flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft size={16}/>All services</Link><div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em]"><Sparkles size={14}/> Human expertise + intelligent technology</div><h1 className="mt-6 text-5xl font-semibold tracking-[-.05em] sm:text-7xl">{service.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">{service.description}</p><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full bg-white/10 px-4 py-2 text-sm">{service.expertCount} verified experts</span><span className="rounded-full bg-white/10 px-4 py-2 text-sm">From INR {service.startingPrice.toLocaleString("en-IN")}</span></div></div></section>

    <section className="mx-auto max-w-[1450px] py-20"><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Choose how you want help</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Human, AI or the best of both.</h2><p className="mt-5 leading-7 text-zinc-600">AI options are already designed into the experience and will activate when JobiVerse AI services launch.</p></div><div className="grid gap-4 sm:grid-cols-3"><ModeCard icon={UsersRound} title="Human expert" text="Personalized delivery by a verified specialist." active/><ModeCard icon={Bot} title="JobiVerse AI" text="Instant service with intelligent guidance."/><ModeCard icon={Sparkles} title="AI + Expert" text="AI speed followed by human review."/></div></div></section>

    {includedCategories.length > 0 && <section className="mx-auto max-w-[1450px] pb-20"><div className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Services included</p><div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-semibold tracking-[-.03em]">Choose the exact support you need.</h2><p className="mt-2 text-sm text-zinc-500">Every creator offering remains organized under this master category.</p></div><Link href={`/marketplace/services/${slug}`} className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${!selectedType ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"}`}>View all</Link></div><div className="mt-7 flex flex-wrap gap-2">{includedCategories.map(category => <Link key={category} href={`/marketplace/services/${slug}?type=${encodeURIComponent(category)}`} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${selectedType === category ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-950"}`}>{category}</Link>)}</div></div></section>}

    <section className="mx-auto max-w-[1450px] pb-12">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Available providers</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Choose your expert.</h2></div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {service.providers.length ? service.providers.map((provider, providerIndex) => <article key={`${provider.name}-${providerIndex}`} className={`relative overflow-hidden rounded-[2rem] border p-7 shadow-sm ${provider.isJobiVerse ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl" : provider.isFeatured?"border-violet-300 bg-gradient-to-br from-violet-50 to-white shadow-xl":"border-zinc-200 bg-white"}`}>
          {provider.isFeatured&&!provider.isJobiVerse&&<div className="absolute right-0 top-0 rounded-bl-2xl bg-violet-600 px-4 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-white">Featured</div>}{provider.isJobiVerse && <div className="absolute right-0 top-0 rounded-bl-2xl bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-black">Recommended | JobiVerse</div>}
          <div className="flex items-start justify-between"><div className={`grid h-14 w-14 place-items-center overflow-hidden rounded-2xl ${provider.logoUrl ? "bg-white" : "bg-zinc-950 text-xl font-semibold text-white"}`}>{provider.logoUrl ? <Image src={provider.logoUrl} alt={`${provider.name} logo`} width={48} height={48} className="h-12 w-12 object-contain"/> : provider.name.split(" ").map(word => word[0]).join("")}</div>{provider.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"><BadgeCheck size={14}/>Verified</span>}</div>
          <h3 className="mt-6 text-xl font-semibold">{provider.name}</h3><p className={`mt-1 text-sm leading-6 ${provider.isJobiVerse ? "text-zinc-400" : "text-zinc-500"}`}>{provider.title}</p>
          {(provider.fitReason || provider.relevantExperience) && <div className="mt-5 grid gap-3"><TrustNote title="Why this expert fits" text={provider.fitReason}/><TrustNote title="Relevant experience" text={provider.relevantExperience}/></div>}
          <div className="mt-5 flex gap-4 text-sm"><span className="inline-flex items-center gap-1"><Star size={15}/>{provider.ratingCount?`${provider.rating.toFixed(1)} (${provider.ratingCount})`:"New"}</span><span>{provider.completedOrders} orders</span>{provider.reputation&&<span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-600">{provider.reputation}</span>}</div><div className="my-6 h-px bg-zinc-200"/>
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-zinc-400">Service fee</p><p className="mt-1 font-semibold">{provider.priceLabel ?? `INR ${provider.startingPrice.toLocaleString("en-IN")}`}</p></div><span className={`inline-flex items-center gap-1 text-xs ${provider.isJobiVerse ? "text-zinc-400" : "text-zinc-500"}`}><Clock3 size={14}/>{provider.delivery}</span></div>
          <Link href={provider.isJobiVerse ? `/marketplace/services/${slug}/jobiverse?type=${encodeURIComponent(jobiVerseCategory ?? service.title)}` : user ? `/marketplace/services/${slug}/book?listing=${provider.listingId ?? ""}` : `/login/${bookingRole}?next=${encodeURIComponent(`/marketplace/services/${slug}/book?listing=${provider.listingId ?? ""}`)}`} className={`mt-6 flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold ${provider.isJobiVerse ? "bg-white text-black" : "bg-black text-white"}`}>{provider.isJobiVerse ? "Get it personally from JobiVerse" : "Book service"}<ArrowRight size={17}/></Link>
          {provider.isJobiVerse && <Link href={`/marketplace/services/${slug}/jobiverse?type=${encodeURIComponent(jobiVerseCategory ?? service.title)}#negotiate`} className="mt-3 flex items-center justify-center rounded-2xl border border-white/25 px-5 py-3.5 font-semibold text-white">Negotiate</Link>}
          {!provider.isJobiVerse && provider.listingId && <Link href={user ? `/marketplace/services/${slug}/offer?listing=${provider.listingId}` : `/login/${bookingRole}?next=${encodeURIComponent(`/marketplace/services/${slug}/offer?listing=${provider.listingId}`)}`} className="mt-3 flex items-center justify-center rounded-2xl border border-zinc-300 px-5 py-3.5 font-semibold text-zinc-700">Negotiate</Link>}
          {!provider.isJobiVerse&&provider.listingId&&(user?<ReportServiceForm serviceId={provider.listingId}/>:<Link href={`/login/${bookingRole}?next=${encodeURIComponent(`/marketplace/services/${slug}`)}`} className="mt-3 flex items-center justify-center text-xs font-semibold text-zinc-400">Log in to report this listing</Link>)}
        </article>) : <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-zinc-500">Creators for this service are joining soon.</div>}
      </div>
    </section>
    {!!reviews?.length&&<section className="mx-auto max-w-[1450px] pb-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Verified customer feedback</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Real reviews from completed orders.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reviews.map(review=><article key={review.id} className="rounded-[1.75rem] border border-zinc-200 bg-white p-6"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{reviewerNames.get(review.reviewer_id)??"Verified customer"}</p><span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><Star size={13}/>{review.rating}/5</span></div><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Completed-order review</p><p className="mt-4 text-sm leading-6 text-zinc-600">{review.review??"Rating submitted without a written review."}</p><p className="mt-4 text-xs text-zinc-400">{new Date(review.created_at).toLocaleDateString("en-IN")}</p>{user&&<ReviewActions reviewId={review.id} helpfulCount={review.helpful_count}/>}</article>)}</div></section>}
  </main>;
}

function ModeCard({icon:Icon,title,text,active=false}:{icon:React.ElementType;title:string;text:string;active?:boolean}){return <article className={`rounded-[2rem] border p-6 ${active?"border-zinc-950 bg-zinc-950 text-white":"border-zinc-200 bg-white"}`}><Icon size={23}/><h3 className="mt-8 font-semibold">{title}</h3><p className={`mt-2 text-sm leading-6 ${active?"text-zinc-400":"text-zinc-500"}`}>{text}</p>{!active&&<span className="mt-5 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-zinc-500">Coming soon</span>}</article>}

function TrustNote({title,text}:{title:string;text?:string|null}){if(!text)return null;return <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-zinc-400">{title}</p><p className="mt-2 line-clamp-4 text-xs leading-5 text-zinc-600">{text}</p></div>}





function listingRank(listing:{is_featured:boolean;featured_until:string|null;quality_score:number;average_rating:number|string;total_orders:number},verified:boolean){const featured=listing.is_featured&&(!listing.featured_until||new Date(listing.featured_until)>new Date());return(featured?1000:0)+(verified?150:0)+Number(listing.quality_score||0)*2+Number(listing.average_rating||0)*20+Math.min(Number(listing.total_orders||0),100)*3}






function reputationLevel(rating:number,reviews:number,orders:number,verified:boolean){if(verified&&reviews>=10&&rating>=4.7&&orders>=15)return"Top Rated";if(reviews>=5&&rating>=4.3&&orders>=5)return"Strong Track Record";if(verified)return"Verified Professional";if(orders>0)return"Growing Creator";return"New Creator"}



function privateReviewerName(name:string|null){if(!name)return"Verified customer";const parts=name.trim().split(/\s+/);return parts.length>1?`${parts[0]} ${parts.at(-1)?.[0]??""}.`:parts[0]}
