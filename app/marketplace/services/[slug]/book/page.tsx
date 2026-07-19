import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customerPrice } from "@/lib/marketplace/pricing";
import { BookingForm } from "./booking-form";
import { canBuyMarketplaceService, requiredBuyerPortal } from "@/lib/marketplace/buyer-access";

export default async function BookServicePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ listing?: string }> }) {
  const { slug } = await params;
  const { listing: listingId } = await searchParams;
  if (!listingId) redirect(`/marketplace/services/${slug}`);
  const supabase = await createServerSupabaseClient();
  const { data: listing } = await supabase.from("marketplace_services").select("id,title,description,price,delivery_days,audience,status").eq("id", listingId).eq("status", "published").maybeSingle();
  if (!listing) redirect(`/marketplace/services/${slug}`);
  const requiredRole = requiredBuyerPortal(listing.audience);
  const returnPath = `/marketplace/services/${slug}/book?listing=${listing.id}`;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login/${requiredRole}?next=${encodeURIComponent(returnPath)}`);
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const activeRole = profile?.role ?? (typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null);
  if (!canBuyMarketplaceService(activeRole, listing.audience)) redirect(`/login/${requiredRole}?next=${encodeURIComponent(returnPath)}&error=wrong_role`);
  const finalPrice = customerPrice(Number(listing.price));

  return <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-5xl"><Link href={`/marketplace/services/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/> Back to experts</Link><div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Booking requirements</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Tell the expert what you need.</h1><p className="mt-4 text-zinc-500">Your exact selected creator service is secured for this booking.</p><BookingForm listingId={listing.id}/></section><aside className="h-fit rounded-[2.5rem] bg-zinc-950 p-7 text-white sm:p-9"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-zinc-500"><LockKeyhole size={15}/> Order summary</div><h2 className="mt-5 text-3xl font-semibold">{listing.title}</h2><p className="mt-4 text-sm leading-6 text-zinc-400">{listing.description}</p><div className="my-7 h-px bg-white/10"/><div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Delivery</span><strong>{listing.delivery_days} days</strong></div><div className="mt-4 flex items-center justify-between"><span className="text-sm text-zinc-400">Final price</span><strong className="text-2xl">₹{finalPrice.toLocaleString("en-IN")}</strong></div><p className="mt-6 text-xs leading-5 text-zinc-500">Payment activation is coming next. Your order will be created in pending-payment status.</p></aside></div></div></main>;
}
