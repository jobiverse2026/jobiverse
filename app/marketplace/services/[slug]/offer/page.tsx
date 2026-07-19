import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, HandCoins } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customerPrice } from "@/lib/marketplace/pricing";
import { OfferForm } from "./offer-form";

export default async function MakeOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ listing?: string }>;
}) {
  const { slug } = await params;
  const { listing: listingId } = await searchParams;

  if (!listingId) redirect(`/marketplace/services/${slug}`);

  const supabase = await createServerSupabaseClient();
  const { data: listing } = await supabase
    .from("marketplace_services")
    .select("id,title,description,price,audience,status")
    .eq("id", listingId)
    .eq("status", "published")
    .maybeSingle();

  if (!listing) redirect(`/marketplace/services/${slug}`);

  const requiredRole = listing.audience === "employer" ? "employer" : "candidate";
  const returnPath = `/marketplace/services/${slug}/offer?listing=${listing.id}`;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login/${requiredRole}?next=${encodeURIComponent(returnPath)}`);

  const listedPrice = customerPrice(Number(listing.price));

  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href={`/marketplace/services/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600">
          <ArrowLeft size={16} />
          Back to service
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Negotiate with creator</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Make a fair offer.</h1>
            <p className="mt-4 text-zinc-500">The creator can accept, counter or reject within 48 hours.</p>
            <OfferForm listingId={listing.id} listedPrice={listedPrice} serviceHref={`/marketplace/services/${slug}`} />
          </section>
          <aside className="h-fit rounded-[2.5rem] bg-zinc-950 p-8 text-white">
            <HandCoins size={26} />
            <h2 className="mt-5 text-2xl font-semibold">{listing.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{listing.description}</p>
            <div className="my-6 h-px bg-white/10" />
            <p className="text-xs text-zinc-500">Listed customer price</p>
            <p className="mt-2 text-3xl font-semibold">INR {listedPrice.toLocaleString("en-IN")}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
