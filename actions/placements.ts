"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

const placementSchema = z.object({
  candidateId: z.string().uuid(),
  status: z.enum(["offered", "accepted", "joined", "declined", "no_show", "replacement", "completed"]),
  offeredCtc: z.coerce.number().positive().optional(),
  joiningDate: z.string().optional(),
});

export async function managePlacement(values: unknown) {
  const result = placementSchema.safeParse(values);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Please check the offer details.");

  const parsed = result.data;
  if (["offered", "accepted", "joined"].includes(parsed.status) && !parsed.offeredCtc) {
    throw new Error("Please enter the annual offered CTC.");
  }
  if (parsed.status === "joined" && !parsed.joiningDate) {
    throw new Error("Please enter the confirmed joining date.");
  }

  const { supabase } = await requireRole(["recruiter", "admin"]);
  const { data, error } = await supabase.rpc("manage_candidate_placement", {
    p_candidate_id: parsed.candidateId,
    p_status: parsed.status,
    p_offered_ctc: parsed.offeredCtc ?? null,
    p_joining_date: parsed.joiningDate || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/recruiter/candidates/${parsed.candidateId}`);
  revalidatePath("/recruiter/candidates");
  revalidatePath("/recruiter");
  revalidatePath(`/employers/candidates/${parsed.candidateId}`);
  revalidatePath("/employers/dashboard");
  revalidatePath("/admin");

  return { placementId: data };
}
