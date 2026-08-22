import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function JoviEmptyState({ title, text, href, action }: { title:string; text:string; href?:string; action?:string }) {
  return <div className="jv-empty-state rounded-[2rem] border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center"><Image src="/images/branding/jovi-guide.png" alt="Jovi guide" width={112} height={112} className="jv-empty-jovi mx-auto h-24 w-24 object-contain"/><h2 className="mt-3 text-xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{text}</p>{href&&<Link href={href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white">{action??"Take the next step"}<ArrowRight size={15}/></Link>}</div>;
}
