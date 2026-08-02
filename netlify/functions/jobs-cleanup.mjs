export default async function cleanUpJobs() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const secret = process.env.CRON_SECRET;
  if (!siteUrl || !secret) throw new Error("NEXT_PUBLIC_SITE_URL and CRON_SECRET are required.");

  const response = await fetch(`${siteUrl}/api/cron/jobs/cleanup`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error(`Job cleanup worker returned ${response.status}: ${await response.text()}`);
}
