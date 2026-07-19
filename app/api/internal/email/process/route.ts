import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { renderTransactionalEmail } from "@/lib/email/transactional-template";

export const runtime = "nodejs";
export const maxDuration = 60;

type OutboxRow = {
  id: string;
  notification_id: string;
  recipient_email: string;
  subject: string;
  payload: Record<string, string | null>;
  attempts: number;
};

function authorized(request: Request) {
  const secret = process.env.EMAIL_WORKER_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function senderFrom(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (match) return { name: match[1]?.trim() || "JobiVerse", email: match[2]?.trim() };
  return { name: "JobiVerse", email: value.trim() };
}

async function sendEmail({
  rowId,
  recipient,
  subject,
  html,
  text,
}: {
  rowId: string;
  recipient: string;
  subject: string;
  html: string;
  text: string;
}) {
  const from = process.env.TRANSACTIONAL_EMAIL_FROM;
  if (!from) throw new Error("TRANSACTIONAL_EMAIL_FROM is not configured.");

  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: senderFrom(from),
        to: [{ email: recipient }],
        subject,
        htmlContent: html,
        textContent: text,
        tags: ["jobiverse", "notification"],
      }),
    });
    const result = await response.json().catch(() => ({})) as { messageId?: string; message?: string; code?: string };
    if (!response.ok || !result.messageId) throw new Error(result.message ?? result.code ?? `Brevo returned ${response.status}.`);
    return result.messageId;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json",
        "idempotency-key": `jobiverse-${rowId}`,
      },
      body: JSON.stringify({ from, to: [recipient], subject, html, text }),
    });
    const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok || !result.id) throw new Error(result.message ?? `Resend returned ${response.status}.`);
    return result.id;
  }

  throw new Error("Transactional email provider is not configured; queued emails were preserved.");
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.TRANSACTIONAL_EMAIL_FROM || (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY)) {
    return NextResponse.json({ error: "Transactional email provider is not configured; queued emails were preserved." }, { status: 503 });
  }

  // Release jobs left behind if a previous worker stopped after claiming them.
  const staleBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  const recoveredAt = new Date().toISOString();
  const { error: recoveryError } = await adminSupabase
    .from("transactional_email_outbox")
    .update({ status: "failed", next_attempt_at: recoveredAt, last_error: "Delivery worker lease expired; safely queued for retry.", updated_at: recoveredAt })
    .eq("status", "processing")
    .lt("processing_started_at", staleBefore);
  if (recoveryError) return NextResponse.json({ error: recoveryError.message }, { status: 500 });

  const { data, error } = await adminSupabase
    .from("transactional_email_outbox")
    .select("id,notification_id,recipient_email,subject,payload,attempts")
    .in("status", ["queued", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at")
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const row of (data ?? []) as OutboxRow[]) {
    const startedAt = new Date().toISOString();
    const { data: claimed } = await adminSupabase
      .from("transactional_email_outbox")
      .update({ status: "processing", processing_started_at: startedAt, updated_at: startedAt })
      .eq("id", row.id)
      .in("status", ["queued", "failed"])
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      const content = renderTransactionalEmail(row.payload);
      const providerMessageId = await sendEmail({ rowId: row.id, recipient: row.recipient_email, subject: row.subject, html: content.html, text: content.text });

      const completedAt = new Date().toISOString();
      await adminSupabase.from("transactional_email_outbox").update({ status: "sent", attempts: row.attempts + 1, provider_message_id: providerMessageId, last_error: null, sent_at: completedAt, updated_at: completedAt }).eq("id", row.id);
      await adminSupabase.from("notifications").update({ email_status: "sent" }).eq("id", row.notification_id);
      sent += 1;
    } catch (caught) {
      const attempts = row.attempts + 1;
      const retryMinutes = Math.min(24 * 60, 5 * 2 ** Math.min(attempts - 1, 8));
      const exhausted = attempts >= 5;
      await adminSupabase.from("transactional_email_outbox").update({
        status: "failed",
        attempts,
        last_error: caught instanceof Error ? caught.message.slice(0, 2000) : "Unknown delivery error.",
        next_attempt_at: new Date(Date.now() + (exhausted ? 3650 * 86400000 : retryMinutes * 60000)).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
      await adminSupabase.from("notifications").update({ email_status: "failed" }).eq("id", row.notification_id);
      failed += 1;
    }
  }

  return NextResponse.json({ processed: sent + failed, sent, failed, stale_jobs_recovered: true });
}
