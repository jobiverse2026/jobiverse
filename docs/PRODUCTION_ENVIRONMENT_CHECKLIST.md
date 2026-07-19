# JobiVerse Production Environment Checklist

## Required for the application

- `NEXT_PUBLIC_SITE_URL` — final HTTPS JobiVerse domain
- `NEXT_PUBLIC_SUPABASE_URL` — production Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — production publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only production service-role key

## Payments

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`


Keep Razorpay Test Mode credentials until KYC, legal pricing and production reconciliation are approved.

## Transactional email

- `SUPABASE_AUTH_SMTP_READY=true`
- `BREVO_API_KEY`
- `TRANSACTIONAL_EMAIL_FROM`
- `EMAIL_WORKER_SECRET`

Brevo SMTP is configured inside Supabase for auth emails. `BREVO_API_KEY` is used by the JobiVerse notification email worker. These may remain absent during development; app notification emails remain safely queued.

## AI (launch later)

- `ENABLE_PAID_AI=false`
- `OPENAI_API_KEY` — server-only; may remain absent while AI is Coming Soon
- `OPENAI_RESUME_MODEL` — configure only when AI activation is approved

## Deployment checks

1. Store secrets in the hosting provider environment, never in Git.
2. Configure separate Preview and Production values.
3. Deploy and open `/api/health`; expect `status: healthy` and `database: reachable`.
4. Confirm the response contains no credentials or infrastructure secrets.
5. Enable uptime monitoring against `/api/health` after domain connection.
6. Verify HTTPS, security headers, Supabase redirect URLs and Razorpay webhook URL.
7. Rotate any secret accidentally exposed in logs, screenshots or chat.

## Optional analytics

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — leave absent until analytics is approved and configured

The analytics script loads only after the visitor explicitly accepts analytics in the JobiVerse privacy manager.
