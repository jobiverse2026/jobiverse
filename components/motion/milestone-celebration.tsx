"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

const milestoneValues=new Set(["application_submitted","joined","hired","offer_accepted","service_published","order_completed","1"]);

export function MilestoneCelebration(){
  const params=useSearchParams(); const reduced=useReducedMotion(); const [visible,setVisible]=useState(false);
  const milestone=useMemo(()=>["milestone","published","completed","joined","hired"].some(key=>milestoneValues.has(params.get(key)??""))||milestoneValues.has(params.get("success")??""),[params]);
  useEffect(()=>{if(!milestone)return;const show=window.setTimeout(()=>setVisible(true),0);const hide=window.setTimeout(()=>setVisible(false),2600);return()=>{clearTimeout(show);clearTimeout(hide)}},[milestone]);
  if(reduced)return null;
  return <AnimatePresence>{visible&&<div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[140] overflow-hidden"><motion.div initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="absolute left-1/2 top-28 -translate-x-1/2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-2xl"><span className="flex items-center gap-2"><Sparkles className="text-violet-300" size={17}/>Milestone unlocked</span></motion.div>{Array.from({length:22}).map((_,index)=><motion.i key={index} initial={{x:`${45+(index%7)*2}vw`,y:"15vh",opacity:1,rotate:0}} animate={{x:`${8+(index*17)%86}vw`,y:`${65+(index%4)*9}vh`,opacity:0,rotate:360+(index%3)*180}} transition={{duration:1.4+(index%5)*.15,ease:"easeOut"}} className={`absolute h-2 w-2 rounded-sm ${index%3===0?"bg-violet-500":index%3===1?"bg-emerald-400":"bg-amber-400"}`}/>)}</div>}</AnimatePresence>;
}
