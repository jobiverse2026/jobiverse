"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

export async function updatePayoutRequest(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("requestId"));
  const status = z.enum(["approved", "paid", "rejected"]).parse(formData.get("status"));
  const note = z.string().trim().max(1000).optional().parse(String(formData.get("adminNote") ?? "")) || null;
  const reference = z.string().trim().max(200).optional().parse(String(formData.get("paymentReference") ?? "")) || null;
  if (status === "paid" && !reference) throw new Error("Add the bank or payout transaction reference before marking paid.");
  const { supabase, user } = await requireRole(["admin"]);
  const { data: request, error: readError } = await supabase.from("creator_payout_requests").select("id,status,creator_payout_items(order_id)").eq("id", id).maybeSingle();
  if (readError || !request) throw new Error(readError?.message ?? "Payout request not found.");
  if (["paid", "rejected"].includes(request.status)) throw new Error("This payout request is already closed.");
  const { error } = await supabase.from("creator_payout_requests").update({ status, admin_note: note, payment_reference: reference, processed_by: user.id, processed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  const items = Array.isArray(request.creator_payout_items) ? request.creator_payout_items : [];
  const orderIds = items.map((item) => item.order_id);
  if (orderIds.length) {
    const payoutStatus = status === "paid" ? "paid" : status === "rejected" ? "eligible" : "processing";
    const { error: orderError } = await supabase.from("marketplace_orders").update({ payout_status: payoutStatus }).in("id", orderIds);
    if (orderError) throw new Error(orderError.message);
  }
  revalidatePath("/admin/finance");
  revalidatePath("/admin/marketplace");
  revalidatePath("/earn-with-jobiverse/dashboard/earnings");
}
