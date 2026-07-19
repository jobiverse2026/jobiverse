"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

export async function changeCreatorServiceStatus(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("serviceId"));
  const status = z.enum(["published", "paused", "archived"]).parse(formData.get("status"));
  const { supabase, user } = await requireRole(["candidate", "creator"]);
  const { error } = await supabase.from("marketplace_services").update({ status }).eq("id", id).eq("provider_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/earn-with-jobiverse/dashboard");
  revalidatePath("/marketplace");
}
