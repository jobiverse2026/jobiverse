import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMarketplaceService } from "@/lib/marketplace/service-catalog";
import { getJobiVerseOffer } from "@/lib/marketplace/jobiverse-offerings";
import { JobiVerseNegotiationForm, JobiVerseOrderForm } from "./forms";

export default async function JobiVerseCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug } = await params;
  const { type } = await searchParams;
  const service = getMarketplaceService(slug);
  const offer = getJobiVerseOffer(type ?? null);

  if (!service || !type || !offer) redirect(`/marketplace/services/${slug}`);

  const role = service.audiences.includes("employer") && !service.audiences.includes("student") && !service.audiences.includes("professional") ? "employer" : "candidate";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const next = `/marketplace/services/${slug}/jobiverse?type=${encodeURIComponent(type)}`;

  if (!user) redirect(`/login/${role}?next=${encodeURIComponent(next)}`);

  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">JobiVerse Personal</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{type}</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">{offer.description}</p>
        </section>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
            <h2 className="text-2xl font-semibold">Book at listed price</h2>
            <p className="mt-2 text-zinc-500">{offer.priceLabel ?? `INR ${offer.price.toLocaleString("en-IN")}`}</p>
            <JobiVerseOrderForm category={type} />
          </section>
          <section id="negotiate" className="rounded-[2rem] border border-zinc-200 bg-white p-7">
            <h2 className="text-2xl font-semibold">Negotiate</h2>
            <p className="mt-2 text-zinc-500">Suggest a commercial amount for JobiVerse to review.</p>
            <JobiVerseNegotiationForm category={type} serviceHref={`/marketplace/services/${slug}?type=${encodeURIComponent(type)}`} />
          </section>
        </div>
      </div>
    </main>
  );
}
