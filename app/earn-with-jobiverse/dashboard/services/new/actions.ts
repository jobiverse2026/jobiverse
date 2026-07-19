"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreateServiceState = { error?: string; success?: string };

const serviceSchema = z.object({
  title: z.string().trim().min(3, "Title must contain at least 3 characters.").max(100),
  audience: z.enum(["professional", "student", "employer"]),
  category: z.string().trim().min(2, "Please select a category.").max(80),
  shortDescription: z.string().trim().min(35, "Card description must contain at least 35 characters.").max(240),
  description: z.string().trim().min(120, "Complete service details must contain at least 120 characters.").max(4000),
  fitReason: z.string().trim().min(60, "Please explain why you are fit for this service.").max(1200),
  relevantExperience: z.string().trim().min(40, "Please add your relevant experience for this service.").max(1200),
  price: z.coerce.number().min(0).max(1000000),
  deliveryDays: z.coerce.number().int().min(1).max(90),
  deliveryMode: z.enum(["online", "call", "document", "hybrid"], {
    error: "Please select how you will deliver this service.",
  }),
});

function createSlug(title: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `${base || "service"}-${randomUUID().slice(0, 8)}`;
}

export async function createMarketplaceService(
  _previousState: CreateServiceState,
  formData: FormData,
): Promise<CreateServiceState> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to publish a service." };
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["candidate", "creator"].includes(profile.role)) return { error: "A Candidate or Creator account is required to publish services." };

  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    audience: formData.get("audience"),
    category: formData.get("category"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    fitReason: formData.get("fitReason"),
    relevantExperience: formData.get("relevantExperience"),
    price: formData.get("price"),
    deliveryDays: formData.get("deliveryDays"),
    deliveryMode: formData.get("deliveryMode"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the service details." };

  const service = parsed.data;
  const isCvTemplate = service.category === "Editable CV Template";
  const normalizedTitle=service.title.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const {data:existing}=await supabase.from("marketplace_services").select("id,title").eq("provider_id",user.id).eq("category",service.category).neq("status","archived");
  if(existing?.some(item=>item.title.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()===normalizedTitle))return{error:"You already have an active listing with this title in the selected category. Edit the existing service or use a genuinely different offer."};
  const qualityScore=Math.min(100,35+(service.shortDescription.length>=50?15:10)+(service.description.length>=250?25:20)+(service.deliveryDays<=30?15:5)+(service.title.toLowerCase()!==service.category.toLowerCase()?10:5));
  if(qualityScore<70)return{error:"Add clearer service details, a distinct listing title and a realistic delivery timeline before publishing."};
  const templateFile = formData.get("templateFile");
  let assetUrl: string | null = null;
  let assetName: string | null = null;

  if (isCvTemplate) {
    if (formData.get("templateRightsAccepted") !== "on") return { error: "Confirm that you own or are authorized to sell this template and accept the creator template terms." };
    if (templateFile instanceof File && templateFile.size > 0) {
      if (templateFile.size > 10 * 1024 * 1024) return { error: "Template file must be smaller than 10 MB." };
      const extension = templateFile.name.split(".").pop()?.toLowerCase();
      if (!extension || !["docx", "pptx"].includes(extension)) return { error: "Upload an editable DOCX or PPTX template." };
      const storagePath = `${user.id}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("creator-templates").upload(storagePath, templateFile, { contentType: templateFile.type, upsert: false });
      if (uploadError) return { error: uploadError.message };
      assetUrl = storagePath;
      assetName = templateFile.name;
    } else {
      const { data: uploadedFiles, error: listError } = await supabase.storage.from("creator-templates").list(user.id, { limit: 1, sortBy: { column: "created_at", order: "desc" } });
      if (listError || !uploadedFiles?.[0]) return { error: "Please upload an editable CV template before publishing." };
      assetUrl = `${user.id}/${uploadedFiles[0].name}`;
      assetName = uploadedFiles[0].name;
    }
  }

  const { error } = await supabase.from("marketplace_services").insert({
    provider_id: user.id,
    title: service.title,
    slug: createSlug(service.title),
    audience: service.audience,
    category: service.category,
    short_description: service.shortDescription,
    description: service.description,
    creator_fit_reason: service.fitReason,
    creator_relevant_experience: service.relevantExperience,
    price: service.price,
    delivery_days: service.deliveryDays,
    delivery_mode: service.deliveryMode,
    status: "published",
    asset_url: assetUrl,
    asset_name: assetName,
    is_editable: isCvTemplate,
    template_review_status:isCvTemplate?"pending":"not_applicable",
    template_rights_status:isCvTemplate?"accepted":"not_applicable",
    template_terms_version:isCvTemplate?"2026-07-18-v1":null,
    template_rights_accepted_at:isCvTemplate?new Date().toISOString():null,
    quality_score: qualityScore,
  });

  if (error) return { error: error.message };
  revalidatePath("/marketplace");
  revalidatePath("/earn-with-jobiverse/dashboard");
  return { success: `${service.title} published successfully. Your other selected forms are still available below.` };
}
