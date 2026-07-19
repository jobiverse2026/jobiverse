import "server-only";

export type ReadinessItem = {
  label: string;
  detail: string;
  ready: boolean;
};

const configured = (name: string) => Boolean(process.env[name]?.trim());

export function getLaunchReadiness() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const razorpayKey = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const hasBrevo = configured("BREVO_API_KEY");
  const hasResend = configured("RESEND_API_KEY");

  const groups: { title: string; description: string; items: ReadinessItem[] }[] = [
    {
      title: "Platform foundation",
      description: "Core server and public application configuration.",
      items: [
        { label: "Supabase project URL", detail: "Public database origin is configured.", ready: configured("NEXT_PUBLIC_SUPABASE_URL") },
        { label: "Supabase anonymous key", detail: "Browser authentication key is configured.", ready: configured("NEXT_PUBLIC_SUPABASE_ANON_KEY") },
        { label: "Supabase service role", detail: "Secure server-side operations are configured.", ready: configured("SUPABASE_SERVICE_ROLE_KEY") },
        { label: "Production site URL", detail: siteUrl ? "Must use the final HTTPS domain, not localhost." : "NEXT_PUBLIC_SITE_URL is missing.", ready: siteUrl.startsWith("https://") && !siteUrl.includes("localhost") },
      ],
    },
    {
      title: "Payments",
      description: "Razorpay live collection and webhook verification.",
      items: [
        { label: "Razorpay live key", detail: razorpayKey.startsWith("rzp_test_") ? "Test Mode is currently configured." : "Live key ID must begin with rzp_live_.", ready: razorpayKey.startsWith("rzp_live_") },
        { label: "Razorpay secret", detail: "Server-side payment secret is configured.", ready: configured("RAZORPAY_KEY_SECRET") },
        { label: "Webhook signing secret", detail: "Incoming payment and refund events can be verified.", ready: configured("RAZORPAY_WEBHOOK_SECRET") },
      ],
    },
    {
      title: "Transactional email",
      description: "Brevo/Supabase email delivery for auth and platform notifications.",
      items: [
        { label: "Supabase Auth SMTP", detail: "Configure Brevo SMTP inside Supabase Auth for signup, confirmation and password reset emails.", ready: configured("SUPABASE_AUTH_SMTP_READY") },
        { label: "Brevo transactional API", detail: hasBrevo ? "Brevo API key is configured for JobiVerse notification emails." : hasResend ? "Resend fallback key is configured. Brevo is preferred for this project." : "BREVO_API_KEY is missing for platform notification emails.", ready: hasBrevo || hasResend },
        { label: "Verified sender address", detail: "TRANSACTIONAL_EMAIL_FROM is configured, e.g. JobiVerse <jobiverse@outlook.com>.", ready: configured("TRANSACTIONAL_EMAIL_FROM") },
        { label: "Email worker secret", detail: "Internal queue processor is protected.", ready: configured("EMAIL_WORKER_SECRET") },
      ],
    },
  ];

  const items = groups.flatMap((group) => group.items);
  return {
    groups,
    ready: items.filter((item) => item.ready).length,
    total: items.length,
    missing: items.filter((item) => !item.ready).length,
  };
}
