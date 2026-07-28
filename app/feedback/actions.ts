"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  category: z.enum(["issue", "feature", "service_request", "experience"]),
  area: z.string().min(2).max(80),
  subject: z.string().trim().min(3).max(140),
  details: z.string().trim().min(10).max(4000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  pageUrl: z.string().trim().max(500).optional(),
});

export async function submitFeedback(formData: FormData) {
  const { supabase, user, profile } = await requireRole(["candidate", "employer", "recruiter", "creator", "admin"]);
  const ratingValue = String(formData.get("rating") ?? "");
  const parsed = schema.parse({
    category: formData.get("category"),
    area: formData.get("area"),
    subject: formData.get("subject"),
    details: formData.get("details"),
    rating: ratingValue ? ratingValue : undefined,
    pageUrl: formData.get("pageUrl") || undefined,
  });
  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    role_snapshot: profile.role,
    category: parsed.category,
    area: parsed.area,
    subject: parsed.subject,
    details: parsed.details,
    rating: parsed.rating ?? null,
    page_url: parsed.pageUrl || null,
  });
  if (error) throw new Error(error.message);
  redirect("/feedback?submitted=1");
}

