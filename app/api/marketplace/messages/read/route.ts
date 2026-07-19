import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request:Request){try{const{orderId}=z.object({orderId:z.string().uuid()}).parse(await request.json());const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return Response.json({error:"Unauthorized"},{status:401});const{data,error}=await supabase.rpc("mark_marketplace_messages_read",{target_order:orderId});if(error)throw new Error(error.message);return Response.json({success:true,updated:data});}catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to mark messages read."},{status:400});}}
