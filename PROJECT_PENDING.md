# JobiVerse Pending Work Tracker

Last updated: 18 July 2026

## P0 - Required Before Production Launch

- [x] Complete production RLS/security audit for every public table and storage bucket. Verified with 0 critical and 0 high findings; five intentional public-read surfaces remain documented as medium findings.
- [ ] Replace development authentication setup with final production auth configuration. Code-side PKCE recovery, role validation and safe return redirects are ready; complete `docs/PRODUCTION_AUTH_CHECKLIST.md` in the production Supabase project.
- [ ] Complete production Brevo email setup. Supabase Auth SMTP is connected for signup/password reset testing; before launch, verify sender/domain authentication, set `SUPABASE_AUTH_SMTP_READY=true`, configure `BREVO_API_KEY`, `TRANSACTIONAL_EMAIL_FROM`, and `EMAIL_WORKER_SECRET`, then rerun confirmation/recovery/notification email tests.
- [ ] Move Razorpay from Test Mode to Live Mode after KYC and live credentials are ready.
- [ ] Configure the public production webhook URL and enable payment/refund events.
- [ ] Run complete production payment, refund and webhook reconciliation tests.
- [ ] Confirm GST rate and SAC mapping with a CA for each service category.
- [ ] Activate statutory GST tax invoices only after the tax mapping is confirmed.
- [x] Add buyer billing name, address, state, pincode and GSTIN fields where applicable.
- [ ] Final legal review of Terms, Privacy, Refund and Cancellation policies.
- [ ] Production deployment, domain connection, monitoring, backups and recovery checks.

## P1 - Active Product Work

- [x] Improve customer-creator order messaging: attachments, unread count and read status.
- [x] Add order-message notification deep links and admin conversation audit access.
- [x] Add spam/report controls for marketplace conversations.
- [x] Add customer cancellation policy windows and clearer refund eligibility rules.
- [x] Add admin historical receipt links directly inside the Finance transaction ledger.
- [x] Add creator bank/payout profile and secure payout-account verification.
- [ ] Replace manual creator payout completion with a production payout provider/API.
- [x] Add downloadable creator payout statements and reconciliation reports.
- [x] Add customer billing history containing marketplace and CV purchases.
- [x] Add admin CSV exports for payments, margins, refunds and creator payouts.

## P1 - Marketplace and Creator Platform

- [x] Final creator service moderation rules and quality controls without mandatory approval.
- [x] Creator service edit, pause, archive and preview improvements.
- [x] Booking cancellation, rescheduling and service-specific delivery policies.
- [x] Creator availability/calendar and delivery-capacity controls.
- [x] Marketplace search ranking, featured listings and verified-provider indicators.
- [x] Service reviews: reporting, abuse prevention and richer creator reputation metrics.
- [ ] Creator tax information and TDS/compliance workflow after professional advice.

## P1 - Recruitment Platform

- [x] Final employer dashboard and requirement tracking polish.
- [x] Final recruiter assignment, pipeline and interview workflow audit.
- [x] Employer candidate pipeline visibility and complete offer/placement tracking.
- [x] Candidate application history, saved jobs and job alerts.
- [x] Real recruitment analytics across requirements, interviews, offers and placements.
- [x] Employer commercial terms, success-fee calculation, billing visibility and printable commercial-statement workflow. Statutory tax activation remains dependent on CA-approved SAC/GST mapping.

## P2 - Resume and Career Services

- [x] Finalise paid JobiVerse CV template pricing at INR 50-500 by template complexity. Creator-uploaded template pricing remains creator-controlled; other resume-service rates remain separately managed through marketplace listings.
- [x] Add purchase history and receipt access through the unified Billing & Purchases account page.
- [x] Complete representative PDF export QA across all 10 supported layout families, including multi-page rendering, exact A4 sizing, print colours and overlay exclusion.
- [x] Add saved resume versions, duplication and version history.
- [x] Add creator-uploaded editable CV template moderation and sales reporting.
- [x] Add versioned creator ownership declarations, customer personal-use licence terms and admin approval enforcement for uploaded templates.

## P2 - AI Features (Code Ready / Launch Later)

- [ ] AI Resume Builder.
- [ ] AI Resume Analyzer and ATS checker.
- [ ] AI interview preparation and feedback.
- [ ] Smart candidate-job matching.
- [ ] Career Coach AI.
- [ ] AI-assisted employer hiring tools.
- [ ] Activate only after an AI budget, usage limits, consent and privacy controls are approved.

## P2 - Notifications and Communications

- [x] Connect database notifications to preference-aware transactional email outbox delivery, including durable retries, idempotency and stale-worker recovery. Provider activation remains covered by the production SMTP item above.
- [x] Add an admin-only Email Delivery monitor with queued, sent, failed and preference-skipped visibility plus secure failed-delivery retry.
- [x] Add user-level notification preferences by event and channel.
- [x] Add provider-ready transactional email templates and a durable delivery outbox for jobs, recruitment, marketplace, payments and messages.
- [x] Add notification retention, archive and bulk mark-as-read controls.
- [x] Add retry backoff, attempt limits, provider message IDs and delivery-status tracking for failed transactional emails.
- [x] Add a unified inbox and direct JobiVerse Support chat for every authenticated role.
- [x] Add real unread counts to the global Messages button and admin operational badges.

## P3 - Growth and Operations

- [x] Add privacy-first analytics consent controls and consent-gated Google Analytics loading. Measurement ID and final event taxonomy remain production configuration tasks.
- [x] SEO metadata, structured data, sitemap and robots foundation. Search Console connection remains a production-domain task.
- [ ] Social accounts still to create: X, Facebook and YouTube.
- [x] Final production content, contact details, encoding and brand-asset consistency audit.
- [x] Accessibility and responsive interaction foundation: keyboard focus, skip navigation, reduced motion, touch targets and mobile-dialog semantics. Final device lab audit remains pre-launch.
- [x] Add automated end-to-end regression coverage for public pages, role workspaces, access control, marketplace filtering and finance.

## Confirmed Business Details

- Legal name: MOHAMMAD AMIR MOHAMMAD ASLAM ANSARI
- Trade name: JobiVerse
- Constitution: Proprietorship
- GSTIN: 27DEFPA6843P1Z1
- Registered address: Room No. 25, Plot No. 70, Malad (W), Mumbai, Maharashtra - 400095
- Recruitment SAC candidates: 998511, 998512 and 998513-998519 depending on service type
- GST rate and non-recruitment SAC mapping: awaiting CA confirmation

## Recently Completed

- [x] Replace unfinished Admin Companies, Candidates and Recruiters placeholders with live searchable management workspaces, company verification, recruiter workload/access control and candidate pipeline updates.
- [x] Replace non-functional Admin Requirement filters with a live searchable and status-filtered requirement directory.
- [x] Enforce suspended-account denial in both route protection and server authorization.
- [x] Complete responsive mobile drawers and compact topbars for Admin and Recruiter workspaces, plus role-correct global mobile dashboard navigation.
- [x] Add the JobiVerse universe-mark browser favicon and installable-app icon metadata.
- [x] Add an admin Launch Readiness Center and secure Email Delivery monitor with failed-message retry.
- [x] Final repository quality gate: full ESLint and TypeScript checks pass, production build compiles 111 routes, public smoke coverage passes and anonymous protected-route redirects pass.
- [x] Production build readiness verified on Next.js 16: lint exits successfully, TypeScript passes, and all 111 application routes compile/prerender after adding required password-page Suspense boundaries.
- [x] Razorpay Test Mode for marketplace services and premium CV downloads.
- [x] Verified payment receipts with GSTIN identification.
- [x] Direct checkout after service booking.
- [x] Creator earnings ledger and payout-request workflow.
- [x] Admin Finance & Payouts dashboard.
- [x] Customer refund requests, admin review and Razorpay refund processing.
- [x] Refund webhook handling and localhost manual status sync.
- [x] Role-based login redirects and production login build fix.
