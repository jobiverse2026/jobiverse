"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  serviceId: z.string().uuid(),
  title: z.string().trim().min(3).max(100),
  shortDescription: z.string().trim().min(20).max(240),
  description: z.string().trim().min(40).max(4000),
  fitReason: z.string().trim().min(60, "Please explain why you are fit for this service.").max(1200),
  relevantExperience: z.string().trim().min(40, "Please add your relevant experience for this service.").max(1200),
  price: z.coerce.number().min(0).max(1000000),
  deliveryDays: z.coerce.number().int().min(1).max(90),
  deliveryMode: z.enum(["online", "call", "document", "hybrid"], { error: "Please select a delivery mode." }),
});

export async function updateCreatorService(formData: FormData) {
  const values = schema.parse({
    serviceId: formData.get("serviceId"),
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    fitReason: formData.get("fitReason"),
    relevantExperience: formData.get("relevantExperience"),
    price: formData.get("price"),
    deliveryDays: formData.get("deliveryDays"),
    deliveryMode: formData.get("deliveryMode"),
  });
  const { supabase, user } = await requireRole(["candidate", "creator"]);
  const { data, error } = await supabase.from("marketplace_services").update({
    title: values.title,
    short_description: values.shortDescription,
    description: values.description,
    creator_fit_reason: values.fitReason,
    creator_relevant_experience: values.relevantExperience,
    price: values.price,
    delivery_days: values.deliveryDays,
    delivery_mode: values.deliveryMode,
  }).eq("id", values.serviceId).eq("provider_id", user.id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Service listing not found or access denied.");
  revalidatePath("/earn-with-jobiverse/dashboard");
  revalidatePath("/marketplace");
  redirect("/earn-with-jobiverse/dashboard?updated=1");
}
