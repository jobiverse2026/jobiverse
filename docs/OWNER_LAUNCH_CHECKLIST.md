# JobiVerse Owner Launch Checklist

The repository-side product work is complete. These remaining actions require owner accounts, professional approval, production credentials or commercial decisions.

## 1. Production Supabase authentication

- Create or select the final production Supabase project.
- Complete every item in `docs/PRODUCTION_AUTH_CHECKLIST.md`.
- Add the final HTTPS site URL and callback URLs.
- Enable email confirmation, CAPTCHA and appropriate rate limits.
- Configure production Google and LinkedIn OAuth credentials if these providers will launch.

## 2. Production email

- Use Brevo as the selected production SMTP/email provider.
- Verify the JobiVerse sending domain and sender address.
- Configure Supabase Auth SMTP with Brevo for signup/password-reset emails.
- Configure `SUPABASE_AUTH_SMTP_READY=true`, `BREVO_API_KEY`, `TRANSACTIONAL_EMAIL_FROM` and `EMAIL_WORKER_SECRET` in the production host.
- Test signup confirmation, password recovery and transactional notification delivery.

## 3. Razorpay Live Mode

- Complete Razorpay KYC and activate Live Mode.
- Add live key ID and secret to the production host; never share them in chat or commit them.
- Create the production webhook using `/api/payments/razorpay/webhook` on the final HTTPS domain.
- Enable payment and refund events and configure the webhook signing secret.
- Perform one controlled real payment, receipt, refund and reconciliation test.

## 4. Tax and legal approval

- Ask a Chartered Accountant to confirm GST rates and SAC codes for recruitment, marketplace, career services and CV templates.
- Confirm creator TDS/tax-information requirements and payout documentation.
- Activate statutory tax invoices only after written tax confirmation.
- Obtain final legal review of Terms, Privacy, Refund, Cancellation and creator-template terms.

## 5. Production deployment and operations

- Deploy the verified production build and connect the final JobiVerse domain.
- Configure uptime monitoring, application-error alerts and webhook monitoring.
- Enable Supabase database and Storage backups appropriate for live customer data.
- Perform a documented restore/recovery test.
- Complete real-phone testing on Android and iPhone plus tablet and desktop browser checks.

## 6. Commercial decisions

- Select a payout provider/API before replacing manual creator payout completion.
- Create the official X, Facebook and YouTube accounts when ready.
- Approve an AI budget, model/provider, per-user limits, consent language and privacy controls before enabling paid AI features. Until then, AI remains clearly marked as coming soon.

## Final owner acceptance test

Run one complete journey for each role using production test accounts: Candidate, Employer, Recruiter, Creator and Admin. Verify authentication, navigation, notification email, payment/refund, creator delivery/payout, recruitment pipeline and mobile behavior before inviting real users.
