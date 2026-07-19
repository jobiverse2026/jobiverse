import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { verifyRazorpayPayment } from "@/lib/payments/razorpay";

type PaymentAttempt = { id:string; user_id:string; target_type:string; target_id:string; local_order_id:string|null; amount:number; status:string };

export async function POST(request:Request){
  try{
    const supabase=await createServerSupabaseClient();
    const{data:{user}}=await supabase.auth.getUser();
    if(!user)return Response.json({error:"Unauthorized"},{status:401});
    const body=await request.json() as{razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
    const{data:attempt}=await adminSupabase.from("payment_attempts").select("id,user_id,target_type,target_id,local_order_id,amount,status").eq("gateway_order_id",body.razorpay_order_id).single();
    if(!attempt||attempt.user_id!==user.id)return Response.json({error:"Payment attempt not found."},{status:404});
    if(attempt.status!=="captured"){
      if(!verifyRazorpayPayment(body.razorpay_order_id,body.razorpay_payment_id,body.razorpay_signature))return Response.json({error:"Payment signature verification failed."},{status:400});
      const{error}=await adminSupabase.from("payment_attempts").update({status:"captured",gateway_payment_id:body.razorpay_payment_id}).eq("id",attempt.id);
      if(error)throw new Error(error.message);
    }
    await activatePurchase(attempt,body.razorpay_payment_id);
    return Response.json({success:true,redirectUrl:destination(attempt)});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Payment verification failed."},{status:500})}
}

async function activatePurchase(attempt:PaymentAttempt,paymentId:string){
  if(attempt.local_order_id){const{error}=await adminSupabase.from("marketplace_orders").update({status:"paid",paid_at:new Date().toISOString(),payment_reference:paymentId}).eq("id",attempt.local_order_id).eq("status","pending_payment");if(error)throw new Error(error.message);const{data:booking}=await adminSupabase.from("consultation_bookings").update({status:"requested",payment_status:"paid"}).eq("marketplace_order_id",attempt.local_order_id).eq("status","pending_payment").select("id,user_id").maybeSingle();if(booking){await adminSupabase.from("notifications").insert({user_id:booking.user_id,type:"consultation_payment",title:"Consultation payment confirmed",message:"Your JobiVerse consultation payment is verified. Meeting confirmation will follow.",href:"/consultations/my",reference_id:booking.id})}}
  if(attempt.target_type==="resume_download"){const{error}=await adminSupabase.from("resume_purchases").upsert({user_id:attempt.user_id,template_id:attempt.target_id,payment_attempt_id:attempt.id,amount:attempt.amount},{onConflict:"user_id,template_id",ignoreDuplicates:true});if(error)throw new Error(error.message)}
}

function destination(attempt:PaymentAttempt){return attempt.target_type==="resume_download"?`/candidates/resume-builder?template=${encodeURIComponent(attempt.target_id)}&download=1`:`/payments/receipts/${attempt.id}`}
