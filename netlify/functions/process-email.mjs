export default async function processEmail() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const secret = process.env.EMAIL_WORKER_SECRET;
  if (!siteUrl || !secret) throw new Error("NEXT_PUBLIC_SITE_URL and EMAIL_WORKER_SECRET are required.");

  const response = await fetch(`${siteUrl}/api/internal/email/process`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error(`Email worker returned ${response.status}: ${await response.text()}`);
}
