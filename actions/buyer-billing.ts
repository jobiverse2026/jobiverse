"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const billingSchema=z.object({
  billingName:z.string().trim().min(2,"Enter the billing name.").max(120),
  addressLine:z.string().trim().min(5,"Enter the complete billing address.").max(300),
  city:z.string().trim().min(2,"Enter the city.").max(80),
  state:z.string().trim().min(2,"Enter the state.").max(80),
  pincode:z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian pincode."),
  gstin:z.string().trim().toUpperCase().refine(value=>!value||/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value),"Enter a valid GSTIN or leave it blank."),
});

export async function saveBuyerBillingProfile(formData:FormData){
  const values=billingSchema.parse({billingName:formData.get("billingName"),addressLine:formData.get("addressLine"),city:formData.get("city"),state:formData.get("state"),pincode:formData.get("pincode"),gstin:formData.get("gstin")??""});
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)throw new Error("Please log in again.");
  const {error}=await supabase.from("buyer_billing_profiles").upsert({user_id:user.id,billing_name:values.billingName,address_line:values.addressLine,city:values.city,state:values.state,pincode:values.pincode,gstin:values.gstin||null},{onConflict:"user_id"});
  if(error)throw new Error(error.message);
  revalidatePath("/account/billing");
  revalidatePath("/marketplace/checkout");
  revalidatePath("/candidates/resume-checkout");
}
