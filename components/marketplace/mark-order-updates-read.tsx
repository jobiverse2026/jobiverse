"use client";

import { useEffect, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function MarkOrderUpdatesRead({orderId,userId}:{orderId:string;userId:string}){const supabase=useMemo(()=>createBrowserSupabaseClient(),[]);useEffect(()=>{void supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",userId).eq("reference_id",orderId).is("read_at",null);},[orderId,supabase,userId]);return null;}
