"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  accountHolderName: z.string().trim().min(2).max(120),
  bankName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().regex(/^\d{6,34}$/, "Enter a valid bank account number."),
  ifscCode: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
  upiId: z.string().trim().max(120).optional(),
});

export async function savePayoutProfile(formData: FormData) {
  const values = schema.parse({
    accountHolderName: formData.get("accountHolderName"),
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
    ifscCode: formData.get("ifscCode"),
    upiId: String(formData.get("upiId") ?? "") || undefined,
  });
  const { supabase, user } = await requireRole(["candidate", "creator"]);
  const { error } = await supabase.from("creator_payout_profiles").upsert(
    {
      creator_id: user.id,
      account_holder_name: values.accountHolderName,
      bank_name: values.bankName,
      account_number: values.accountNumber,
      ifsc_code: values.ifscCode,
      upi_id: values.upiId ?? null,
      status: "pending",
      admin_note: null,
      verified_by: null,
      verified_at: null,
    },
    { onConflict: "creator_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/earn-with-jobiverse/dashboard/payout-profile");
  revalidatePath("/admin/payout-accounts");
}
