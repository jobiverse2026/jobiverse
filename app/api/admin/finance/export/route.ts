import type { NextRequest } from "next/server";

import { requireRole } from "@/lib/auth/authorization";

const exportTypes = ["payments", "margins", "refunds", "payouts"] as const;
type ExportType = (typeof exportTypes)[number];

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireRole(["admin"]);
    const requested = request.nextUrl.searchParams.get("type") as ExportType | null;
    if (!requested || !exportTypes.includes(requested)) {
      return new Response("Invalid export type", { status: 400 });
    }

    let rows: Record<string, unknown>[] = [];
    if (requested === "payments") {
      const { data, error } = await supabase
        .from("payment_attempts")
        .select("id,user_id,target_type,target_id,local_order_id,amount,currency,status,gateway_order_id,gateway_payment_id,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }
    if (requested === "margins") {
      const { data, error } = await supabase
        .from("marketplace_orders")
        .select("id,customer_id,provider_id,service_title,amount,creator_earning,platform_margin,status,payout_status,paid_at,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }
    if (requested === "refunds") {
      const { data, error } = await supabase
        .from("marketplace_refund_requests")
        .select("id,customer_id,order_id,payment_attempt_id,amount,reason,status,gateway_refund_id,gateway_status,admin_note,requested_at,processed_at")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }
    if (requested === "payouts") {
      const { data, error } = await supabase
        .from("creator_payout_requests")
        .select("id,creator_id,amount,status,payment_reference,admin_note,requested_at,processed_at,processed_by")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }

    const csv = toCsv(rows);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jobiverse-${requested}-${date}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Admin access required", { status: 403 });
  }
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "No records\r\n";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\r\n");
}

function csvCell(value: unknown) {
  const normalized = value == null
    ? ""
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}
