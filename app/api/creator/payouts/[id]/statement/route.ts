import { requireRole } from "@/lib/auth/authorization";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireRole(["candidate", "creator"]);
    const { data: payout } = await supabase
      .from("creator_payout_requests")
      .select("id,creator_id,amount,status,payment_reference,admin_note,requested_at,processed_at")
      .eq("id", id)
      .eq("creator_id", user.id)
      .maybeSingle();
    if (!payout) return new Response("Payout statement not found", { status: 404 });

    const { data: items, error } = await supabase
      .from("creator_payout_items")
      .select("order_id,creator_earning,marketplace_orders(service_title,created_at,completed_at)")
      .eq("payout_request_id", payout.id)
      .order("id");
    if (error) throw error;

    const lines = [
      ["JobiVerse Creator Payout Statement"],
      ["Statement ID", payout.id],
      ["Status", payout.status],
      ["Requested", payout.requested_at],
      ["Processed", payout.processed_at ?? ""],
      ["Payment reference", payout.payment_reference ?? ""],
      ["Total payout", payout.amount],
      [],
      ["Order ID", "Service", "Order created", "Order completed", "Creator earning"],
      ...(items ?? []).map((item) => {
        const order = Array.isArray(item.marketplace_orders)
          ? item.marketplace_orders[0]
          : item.marketplace_orders;
        return [
          item.order_id,
          order?.service_title ?? "Service order",
          order?.created_at ?? "",
          order?.completed_at ?? "",
          item.creator_earning,
        ];
      }),
    ];
    const csv = lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jobiverse-payout-${payout.id.slice(0, 8)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Unable to generate payout statement", { status: 403 });
  }
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
