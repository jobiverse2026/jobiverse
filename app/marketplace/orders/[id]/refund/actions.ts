"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requestOrderRefund(formData:FormData){
  const orderId=z.string().uuid().parse(formData.get("orderId"));const reason=z.string().trim().min(10,"Please explain the refund reason in at least 10 characters.").max(1000).parse(formData.get("reason"));
  const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect(`/login/candidate?next=/marketplace/orders/${orderId}/refund`);
  const{data:order}=await supabase.from("marketplace_orders").select("id,customer_id,amount,status,payout_status").eq("id",orderId).eq("customer_id",user.id).maybeSingle();if(!order)throw new Error("Order not found.");if(!["paid","in_progress","delivered","revision_requested","completed"].includes(order.status))throw new Error("This order is not eligible for a refund request.");if(order.payout_status==="paid")throw new Error("Creator payout is already completed. Please open a dispute for manual review.");
  const{data:attempt}=await supabase.from("payment_attempts").select("id").eq("local_order_id",order.id).eq("status","captured").maybeSingle();if(!attempt)throw new Error("Captured payment record not found.");
  const{error}=await supabase.from("marketplace_refund_requests").insert({order_id:order.id,customer_id:user.id,payment_attempt_id:attempt.id,amount:order.amount,reason});if(error)throw new Error(error.code==="23505"?"A refund request already exists for this order.":error.message);
  redirect(`/marketplace/orders/${order.id}?refund=requested`);
}
