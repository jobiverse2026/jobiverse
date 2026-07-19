"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export function GlobalMessagesButton(){
  const{user,loading}=useAuthContext();const pathname=usePathname();const[count,setCount]=useState(0);
  useEffect(()=>{if(!user)return;let active=true;fetch("/api/messages/unread").then(response=>response.json()).then(data=>{if(active)setCount(Number(data.count)||0)}).catch(()=>{});return()=>{active=false}},[user,pathname]);
  if(loading||!user||pathname.startsWith("/login")||pathname.startsWith("/signup"))return null;
  return <Link href="/messages" aria-label="Open messages" className="fixed bottom-6 right-6 z-[75] inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-zinc-950 shadow-2xl ring-1 ring-zinc-200 transition hover:-translate-y-1 print:hidden"><MessageCircle size={19}/>Messages{count>0&&<span className="grid h-6 min-w-6 place-items-center rounded-full bg-red-600 px-1 text-[10px] text-white">{count>99?"99+":count}</span>}</Link>;
}
