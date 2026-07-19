"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

const termsSchema = z.object({
  requirementId: z.string().uuid(),
  feePercentage: z.coerce.number().positive().max(100),
  minimumFee: z.coerce.number().min(0),
  replacementDays: z.coerce.number().int().min(0).max(365),
});

export async function updateCommercialTerms(values: unknown) {
  const result = termsSchema.safeParse(values);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Please check the commercial terms.");
  const parsed = result.data;
  const { supabase } = await requireRole(["admin"]);

  const { error } = await supabase.from("requirements").update({
    fee_percentage: parsed.feePercentage,
    minimum_fee: parsed.minimumFee,
    replacement_days: parsed.replacementDays,
  }).eq("id", parsed.requirementId);
  if (error) throw new Error(error.message);

  const { data: placements } = await supabase.from("placements").select("id, offered_ctc, joining_date, status").eq("requirement_id", parsed.requirementId);
  for (const placement of placements ?? []) {
    if (!placement.offered_ctc) continue;
    const fee = Math.max((placement.offered_ctc * parsed.feePercentage) / 100, parsed.minimumFee);
    await supabase.from("placements").update({
      fee_percentage: parsed.feePercentage,
      placement_fee: fee,
      gst_amount: fee * 0.18,
      replacement_end_date: placement.joining_date ? new Date(new Date(placement.joining_date).getTime() + parsed.replacementDays * 86400000).toISOString().slice(0, 10) : null,
    }).eq("id", placement.id);
  }

  revalidatePath(`/admin/requirements/${parsed.requirementId}`);
  revalidatePath("/admin/billing");
}

const billingSchema = z.object({
  placementId: z.string().uuid(),
  invoiceNumber: z.string().trim().max(100).optional(),
  invoiceDate: z.string().optional(),
  paymentDueDate: z.string().optional(),
  paymentStatus: z.enum(["not_invoiced", "invoiced", "partially_paid", "paid", "overdue", "cancelled"]),
});

export async function updatePlacementBilling(values: unknown) {
  const result = billingSchema.safeParse(values);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Please check the invoice details.");
  const parsed = result.data;
  const { supabase } = await requireRole(["admin"]);
  const { error } = await supabase.from("placements").update({
    invoice_number: parsed.invoiceNumber || null,
    invoice_date: parsed.invoiceDate || null,
    payment_due_date: parsed.paymentDueDate || null,
    payment_status: parsed.paymentStatus,
  }).eq("id", parsed.placementId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/billing");
}
