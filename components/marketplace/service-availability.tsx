import Link from "next/link";
import { ArrowRight, Bot, BadgeCheck, UsersRound } from "lucide-react";
import { getMarketplaceService } from "@/lib/marketplace/service-catalog";

export function ServiceAvailability({ slug, dark = false }: { slug: string; dark?: boolean }) {
  const service = getMarketplaceService(slug);
  if (!service) return null;
  return <div className={`mt-6 border-t pt-5 ${dark ? "border-white/10" : "border-zinc-200"}`}>
    <div className="flex flex-wrap gap-2 text-[11px] font-semibold"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${dark ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-700"}`}><UsersRound size={13}/>{service.expertCount} experts</span><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${dark ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-700"}`}><Bot size={13}/>AI coming soon</span></div>
    <div className="mt-4 flex items-end justify-between gap-3"><div><p className={`text-[10px] uppercase tracking-[.15em] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Starting from</p><p className="mt-1 font-semibold">INR {service.startingPrice.toLocaleString("en-IN")}</p></div><Link href={`/marketplace/services/${service.slug}`} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}>Explore & book<ArrowRight size={14}/></Link></div>
    {service.providers[0] && <p className={`mt-4 flex items-center gap-1.5 text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}><BadgeCheck size={14}/>{service.providers[0].name} | {service.providers[0].rating} ★</p>}
  </div>;
}



