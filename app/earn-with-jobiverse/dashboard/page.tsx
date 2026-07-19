import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, CircleDollarSign, Clock3, FilePlus2, PackageOpen, Sparkles, WalletCards } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreatorListingStats } from "@/components/marketplace/creator-listing-stats";

type DashboardProps = { searchParams: Promise<{ published?: string; updated?: string; featured?: string }> };

export default async function CreatorDashboardPage({ searchParams }: DashboardProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/earn-with-jobiverse/dashboard");
  const { data: profile } = await supabase.from("users").select("full_name, role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["candidate", "creator"].includes(profile.role)) redirect("/login/creator?error=creator_required");

  const [{ data: listings }, { data: orders }] = await Promise.all([
    supabase.from("marketplace_services").select("id,title,slug,audience,price,status,total_orders,view_count,is_featured,featured_until,created_at").eq("provider_id", user.id).order("created_at", { ascending: false }),
    supabase.from("marketplace_orders").select("service_id,amount:creator_earning,status").eq("provider_id", user.id),
  ]);
  const completedOrders = (orders ?? []).filter(order => order.status === "completed");
  const totalEarnings = completedOrders.reduce((sum, order) => sum + Number(order.amount), 0);
  const pendingEarnings = (orders ?? []).filter(order => ["paid", "in_progress", "delivered"].includes(order.status)).reduce((sum, order) => sum + Number(order.amount), 0);
  const orderCountByListing = new Map<string, number>();
  for (const order of orders ?? []) {
    if (order.service_id && !["cancelled", "refunded"].includes(order.status)) {
      orderCountByListing.set(order.service_id, (orderCountByListing.get(order.service_id) ?? 0) + 1);
    }
  }
  for (const listing of listings ?? []) {
    listing.total_orders = orderCountByListing.get(listing.id) ?? 0;
  }
  const stats = [["Total earnings", `INR ${totalEarnings.toLocaleString("en-IN")}`, CircleDollarSign], ["Total sales", String(completedOrders.length), BarChart3], ["Active listings", String((listings ?? []).filter(item => item.status === "published").length), PackageOpen], ["Pending earnings", `INR ${pendingEarnings.toLocaleString("en-IN")}`, WalletCards]] as const;
  const { published, updated, featured } = await searchParams;

  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-7xl">
    {published === "1" && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">Service published successfully and is now live on the marketplace.</div>}{updated === "1" && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">Service listing updated successfully.</div>}{featured === "1" && <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-semibold text-violet-800">Featured placement activated for 30 days.</div>}
    <section className="relative overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white shadow-2xl sm:p-12"><div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10"/><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-400"><Sparkles size={14}/> Creator workspace</div><h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Welcome, {profile.full_name ?? "Creator"}.</h1><p className="mt-4 max-w-2xl text-zinc-400">Publish services, manage customer work and track your earnings from one place.</p></div><Link href="/earn-with-jobiverse/dashboard/services/new" className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black">Create a service <FilePlus2 size={18}/></Link></div></section>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,Icon])=><article key={label} className="rounded-[1.75rem] border border-zinc-200 bg-white p-6"><Icon className="text-zinc-400"/><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></article>)}</section>
    <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-[2rem] border border-zinc-200 bg-white p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Your marketplace</p><h2 className="mt-2 text-2xl font-semibold">Your service listings</h2></div><FilePlus2/></div>{listings?.length ? <div className="mt-7 space-y-3">{listings.map(listing => <CreatorListingStats key={listing.id} id={listing.id} slug={listing.slug} title={listing.title} audience={listing.audience} status={listing.status} creatorEarning={Number(listing.price)} totalOrders={listing.total_orders} viewCount={Number(listing.view_count)} isFeatured={listing.is_featured} featuredUntil={listing.featured_until} createdAt={listing.created_at}/>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-10 text-center"><PackageOpen className="mx-auto text-zinc-300" size={38}/><p className="mt-4 font-semibold">No listings yet</p><p className="mt-2 text-sm text-zinc-500">Create your first offering and publish it directly to the marketplace.</p><Link href="/earn-with-jobiverse/dashboard/services/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Create a service <ArrowRight size={16}/></Link></div>}</div><aside className="rounded-[2rem] border border-zinc-200 bg-white p-7"><Clock3/><h2 className="mt-5 text-2xl font-semibold">Recent activity</h2><p className="mt-8 rounded-2xl bg-zinc-50 p-6 text-sm leading-6 text-zinc-500">New bookings, deliveries, completed orders and payout updates will appear here as customers engage with your services.</p></aside></section>
  </div></main>;
}




