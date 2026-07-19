import "server-only";

type EmailPayload = {
  recipient_name?: string;
  title?: string;
  message?: string;
  href?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function renderTransactionalEmail(payload: EmailPayload) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jobiverse.in").replace(/\/$/, "");
  const name = escapeHtml(payload.recipient_name ?? "JobiVerse member");
  const title = escapeHtml(payload.title ?? "JobiVerse update");
  const message = escapeHtml(payload.message ?? "You have a new update.");
  const rawHref = payload.href?.startsWith("/") ? `${siteUrl}${payload.href}` : siteUrl;
  const href = escapeHtml(rawHref);

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f4f2;font-family:Arial,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f4f2"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;overflow:hidden;border:1px solid #e4e4e7;border-radius:28px;background:#ffffff">
<tr><td style="padding:28px 32px;background:#09090b;color:#ffffff"><div style="font-size:22px;font-weight:800;letter-spacing:-.5px">JobiVerse</div><div style="margin-top:6px;font-size:12px;color:#a1a1aa">Every Hire. Every Career. One Universe.</div></td></tr>
<tr><td style="padding:36px 32px"><div style="font-size:14px;color:#71717a">Hello ${name},</div><h1 style="margin:14px 0 12px;font-size:30px;line-height:1.15;letter-spacing:-1px">${title}</h1><p style="margin:0;font-size:16px;line-height:1.7;color:#52525b">${message}</p><a href="${href}" style="display:inline-block;margin-top:28px;padding:14px 22px;border-radius:12px;background:#09090b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">View update</a></td></tr>
<tr><td style="padding:22px 32px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.6;color:#71717a">This transactional update was sent because activity occurred on your JobiVerse account. Manage optional email categories from Notification Preferences.<br>JobiVerse | Mumbai, Maharashtra | jobiverse@outlook.com</td></tr>
</table></td></tr></table></body></html>`;

  const text = `Hello ${payload.recipient_name ?? "JobiVerse member"},\n\n${payload.title ?? "JobiVerse update"}\n\n${payload.message ?? "You have a new update."}\n\nView update: ${rawHref}\n\nJobiVerse | Every Hire. Every Career. One Universe.`;
  return { html, text };
}
