# JobiVerse Transactional Email Runbook

## Current state

The application creates in-app notifications and now mirrors eligible events into a durable email outbox. Email preferences are respected before queueing. No paid provider is required while development continues.

## Events covered

- Jobs and recruiter assignments
- Candidate applications, interviews, offers and placements
- Marketplace orders, negotiations, reviews and disputes
- Payments, receipts, refunds and creator payouts
- Order messages and JobiVerse Support messages

## Delivery activation

Before production launch:

1. Keep Supabase Auth connected to Brevo SMTP for signup, confirmation and password-reset emails.
2. Connect the JobiVerse notification worker to Brevo Transactional Email API.
3. Verify the JobiVerse sending domain and configure SPF, DKIM and DMARC.
4. Configure the sender address and reply-to address.
5. Deploy a protected queue worker using the Supabase service-role key only on the server.
6. Process queued rows in small batches and record provider message IDs.
7. Retry temporary failures with backoff; permanently fail invalid addresses after the retry limit.
8. Reconcile outbox status with `notifications.email_status`.

## Environment variables (activate later)

```env
NEXT_PUBLIC_SITE_URL=https://www.jobiverse.in
SUPABASE_AUTH_SMTP_READY=true
BREVO_API_KEY=your_brevo_api_key
TRANSACTIONAL_EMAIL_FROM=JobiVerse <jobiverse@outlook.com>
EMAIL_WORKER_SECRET=generate_a_long_random_secret
```

Call `POST /api/internal/email/process` from a protected cron job with `Authorization: Bearer <EMAIL_WORKER_SECRET>`. If provider variables are absent, the endpoint sends nothing and preserves the queue.

Never expose the service-role key, Brevo SMTP key, Brevo API key or any provider secret to browser code.
