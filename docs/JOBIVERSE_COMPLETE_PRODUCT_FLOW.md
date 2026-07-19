# JobiVerse — Complete Product Description and Platform Flow

## 1. Product overview

JobiVerse is an Indian recruitment, career-services and creator-commerce platform designed around one connected employment ecosystem.

It serves five primary participants:

1. Candidates, including experienced professionals.
2. Students, fresh graduates and first-time job seekers.
3. Employers and hiring companies.
4. Recruiters managing requirements and candidate pipelines.
5. Creators providing career and business services.

Administrators control platform operations, finance, safety, support and compliance.

The long-term positioning is **India's Hiring & Career Platform**. The platform connects recruitment expertise, career support, editable CV products, professional services and future AI tools.

Core brand statement:

> From the first step of a career journey to leadership roles, JobiVerse connects talent with opportunity through human expertise and intelligent technology.

Core ecosystem slogan:

> Every Hire. Every Career. One Universe.

## 2. Who uses JobiVerse

### Candidates and professionals

Candidates use JobiVerse to:

- Create and maintain a professional profile.
- Upload, view and replace their resume.
- Discover jobs without paying for job access.
- Save jobs and track applications.
- Review interviews, offers and career activity.
- Purchase editable JobiVerse or creator CV templates.
- Book resume, interview and career services.
- Negotiate eligible service prices.
- Communicate with creators and JobiVerse Support.
- Register as a creator using an eligible candidate account.

### Students and recent graduates

Students use the public platform to discover:

- First-job support.
- Resume and CV services.
- Interview preparation.
- Career guidance.
- Skill-roadmap and employability services.
- Editable CV templates.
- Future AI career tools.

Student and professional services can overlap where the same service is useful to both audiences. Booking requires a Candidate account.

### Employers

Employers use JobiVerse to:

- Create and maintain a company profile.
- Submit hiring requirements.
- Track open and historical requirements.
- Review candidates submitted for their roles.
- View interviews, offers and placement progress.
- Access recruitment billing and commercial statements.
- Book employer-only consulting and business services.
- Negotiate eligible marketplace services.
- Communicate through notifications, messages and JobiVerse Support.

### Recruiters

Recruiters use JobiVerse to:

- View requirements assigned to them.
- Add sourced candidates against a requirement.
- Upload and view resumes.
- Move candidates through the recruitment pipeline.
- Add notes and maintain activity history.
- Schedule interviews and record outcomes.
- Manage offers, joining and replacement coverage.
- Receive notifications when roles or workflows change.

Recruiters cannot sell creator services or access employer/candidate-only purchasing flows.

### Creators

Creators use JobiVerse to:

- Select one or multiple service categories.
- Create detailed service listings.
- Set their private creator earning amount.
- Upload editable CV templates where applicable.
- Manage availability and delivery capacity.
- Receive customer negotiations.
- Accept, reject or counter an offer.
- Work on paid orders.
- Submit delivery messages, files or links.
- Monitor views, negotiations, orders and earnings.
- Configure a payout account.
- Request payouts for eligible earnings.

Candidate accounts may access the Creator portal because professionals can also sell legitimate expertise. Employer, Recruiter and Admin accounts remain separated from Creator access.

### Administrators

Administrators use JobiVerse to:

- Monitor platform-wide statistics.
- Manage requirements, companies, candidates and recruiters.
- Verify company profiles.
- Suspend or restore recruiter access.
- Review candidate pipeline status.
- Moderate marketplace services and editable CV templates.
- Verify creator profiles and feature suitable listings.
- Review disputes, reports and message-safety cases.
- Process refunds and monitor Razorpay transactions.
- Verify payout accounts and process creator payouts.
- Access finance exports and reconciliation ledgers.
- Answer JobiVerse Support conversations.
- Monitor transactional-email delivery and retry failed emails.
- Review production launch readiness without exposing secret values.

## 3. Main-site structure

The public website introduces every side of the JobiVerse ecosystem.

### Home

The Home page explains the overall universe and directs users toward hiring, career, student and creator journeys.

### Services

The Services page groups available solutions by audience:

- Employers.
- Professionals.
- Students and graduates.

It introduces services without replacing the detailed Marketplace. Explore actions take users to the appropriate Marketplace audience filter.

### Professionals

The Professionals page focuses on jobs, career progress, CV support and professional services. Job discovery remains separate from paid services.

### Students

The Students page explains first-career support and links to relevant student services.

### Employers

The Employers page combines recruitment solutions, hiring advantages, consulting support and employer-service discovery.

### Earn

The Earn page explains how qualified users can provide services and earn through JobiVerse. Creator creation and management happens after login.

### About Us and Contact

These pages explain the complete multi-audience universe, company details, mission, vision and official contact channels.

### Legal and resource pages

The platform includes Terms, Privacy, Refund Policy, creator-template terms, Resources, Industries and Career Services pages.

## 4. Authentication and access flow

### Sign-up flow

Public sign-up supports:

- Candidate.
- Employer.
- Creator.

Recruiter and Admin access is privileged and must already be authorized by JobiVerse. Public OAuth must never grant elevated roles.

Standard flow:

1. User chooses a role.
2. User enters name, email and password or uses an enabled OAuth provider.
3. Supabase creates the authentication identity.
4. A corresponding platform user profile is created.
5. In production, email confirmation is completed.
6. The user is redirected to the correct role dashboard.

### Login flow

1. User chooses the correct portal.
2. Credentials are verified by Supabase Auth.
3. JobiVerse checks the stored platform role and active status.
4. Unauthorized role portals are rejected.
5. Suspended accounts are denied access.
6. The user is redirected to the intended protected page or role dashboard.

### Password recovery

1. User requests a recovery email.
2. Supabase returns through the dedicated recovery callback.
3. The recovery session remains on the password page.
4. User saves a new password.
5. The active session continues unless the user explicitly logs out.

### Logout

Logout clears the active browser session, displays a success message and returns the user to the Home page. Protected features require login again.

## 5. Recruitment flow

### Step 1: Company profile

An Employer creates a company profile containing business identity, location, website, GST information, logo and contact details.

Admin can review and verify the company.

### Step 2: Hiring requirement

The Employer creates a requirement containing:

- Job title and department.
- Employment type and work mode.
- Experience and vacancies.
- Budget and location.
- Notice period and education.
- Primary and secondary skills.
- Job description and additional information.
- Priority, target date and commercial terms where applicable.

### Step 3: Recruiter assignment

Admin or an authorized workflow assigns the requirement to a Recruiter. The Recruiter receives a notification and the role appears in the Recruiter workspace.

### Step 4: Candidate sourcing

The Recruiter adds candidates against the requirement, uploads resumes and records professional details, sourcing consent and internal remarks.

### Step 5: Candidate pipeline

The canonical pipeline is:

`Submitted → Screening → Client Submitted → Interview → Selected → Offered → Joined`

Alternative exits are:

- Rejected.
- Withdrawn.

Every important status change can create activities and notifications for appropriate participants.

### Step 6: Interview workflow

Recruiter or Employer schedules an interview with:

- Interview round.
- Date and time.
- Online, call, onsite, document or hybrid mode where supported.
- Meeting link or location.
- Interviewer information.
- Notes.

Outcome, feedback and rating are recorded. Candidate status is updated through controlled workflow rules.

### Step 7: Offer and placement

When selected, placement details can include:

- Offered CTC.
- Joining date.
- Offer/acceptance/joining status.
- Placement fee percentage.
- Replacement coverage end date.
- Invoice and payment status.

Employer, Recruiter and Admin see role-appropriate information. Candidate receives relevant status notifications.

### Step 8: Recruitment billing

Commercial terms generate billing visibility after a successful placement. The system tracks invoice number, invoice date, due date, placement fee and payment status.

Statutory GST invoice activation remains dependent on CA-confirmed tax and SAC mapping.

## 6. Candidate career flow

1. Candidate signs up and enters the Candidate Dashboard.
2. Candidate completes the professional profile.
3. Candidate uploads or replaces a resume.
4. Candidate browses job opportunities.
5. Candidate saves or applies for a job.
6. Applications appear in Career Activity.
7. Recruitment changes appear through notifications and application history.
8. Candidate can separately browse paid career services and CV templates.

Job discovery and ordinary job applications are not paid features.

## 7. Marketplace service flow

### Service catalogue

The Marketplace uses the same master service catalogue as Creator service creation. Services are grouped for:

- Professionals.
- Students and graduates.
- Employers.

Search and audience filters help users find the correct service. Creator count and availability are based on real published listings. JobiVerse Personal can appear as a highlighted default provider where configured.

### Creator listing flow

1. Creator selects one or multiple services.
2. Creator proceeds to service-specific forms.
3. Creator enters title, description, delivery method, timeline, price and other category details.
4. Editable CV Template listings require an uploaded editable file.
5. Published listings become available in the related Marketplace category.
6. Creator can edit, pause or archive listings.

### Price calculation

The Creator's entered price is their private base earning amount.

The customer sees a JobiVerse customer price containing the configured platform markup. The customer does not see the creator's private earning or JobiVerse internal margin breakdown.

### Negotiation flow

1. Customer opens an eligible service.
2. Customer selects **Negotiate** and enters a proposed customer-facing amount.
3. The system calculates the creator's net amount after the JobiVerse markup rule.
4. Creator sees the customer request and the amount relevant to their earning decision.
5. Creator accepts, rejects or sends a counter-offer.
6. Customer sees the named provider's response.
7. Accepted customer or creator counter-offers become payable amounts.
8. Customer continues directly to payment.

### Booking and payment flow

1. Customer selects a provider or JobiVerse Personal.
2. Correct role login is required: Candidate for professional/student services and Employer for employer services.
3. Booking creates or prepares an order.
4. Customer is taken directly to checkout.
5. Razorpay creates the payment order.
6. Payment signature is verified server-side.
7. The Marketplace order becomes paid.
8. Customer receives a receipt and order access.
9. Creator receives a notification and the order enters their workspace.

### Fulfilment flow

1. Paid order becomes ready to start.
2. Creator and customer can communicate through the order workspace.
3. Attachments and unread counts are tracked.
4. Scheduling can be proposed and confirmed for appointment-based services.
5. Creator marks work in progress and submits delivery.
6. Delivery may include a message, file or URL.
7. Customer accepts delivery, requests an allowed revision or raises a dispute.
8. Accepted work becomes completed.

### Order states

Depending on the service and workflow, an order may move through:

- Pending payment.
- Paid.
- Ready to start.
- In progress.
- Delivered.
- Revision requested.
- Completed.
- Cancelled.
- Disputed.
- Refunded.

Colour differentiation and notifications help users identify changed and important orders.

## 8. Refund and dispute flow

### Refunds

1. Customer opens an eligible paid order.
2. Customer submits a refund request with a reason.
3. Admin reviews the request in Refund Center.
4. If approved, Razorpay refund processing is initiated.
5. Gateway refund identifiers and status are stored.
6. Customer billing and order status are updated.
7. Receipt/history remains available for audit.

### Disputes

1. Customer or Creator raises a dispute with evidence.
2. The order and payout can be held.
3. Admin reviews order history, messages and evidence.
4. Admin records a permanent resolution or rejection note.
5. Order, refund and payout states are updated accordingly.

### Safety reports

Users can report marketplace services, reviews and individual messages. Admin can review, hide, restore, reject or resolve reports without publicly exposing private conversations.

## 9. Creator earnings and payout flow

1. A customer payment records customer amount, platform margin and creator earning separately.
2. Completed and accepted orders become payout-eligible after applicable protection rules.
3. Creator configures bank or UPI payout details.
4. Admin verifies or rejects the payout account.
5. Creator requests payout for eligible orders.
6. Admin approves, holds, rejects or records payment with a transaction reference.
7. Creator receives status notifications and can download payout statements.

Current creator payout completion is manual. A production payout API/provider can later automate bank transfers without changing the core ledger flow.

## 10. CV template and resume flow

### JobiVerse templates

- The catalogue contains 500 categorized template compositions.
- Layout families include executive, technical, creative, academic, healthcare, finance, operations, photo and multi-page styles.
- JobiVerse template prices range from INR 50 to INR 500 based on complexity.

### Creator templates

- Creator chooses Editable CV Template as a service.
- Creator uploads the editable source file.
- Creator accepts ownership and customer-use terms.
- Admin reviews the template file and may approve, reject or pause it.
- Approved templates can be sold through the Marketplace/CV catalogue.

### Purchase and editing

1. Candidate opens a template preview.
2. Preview and editor use the same selected layout.
3. Candidate can edit text, headings, sections, fonts, sizes and formatting through the dedicated editor.
4. Candidate can add pages while retaining the template style.
5. Download sends an unowned paid template through checkout.
6. Successful Razorpay verification activates ownership.
7. Candidate is redirected back to the builder and the download/print flow opens.
8. Owned CVs remain available under the Owned CVs tab.
9. Saved versions, duplication and version history remain accessible.

PDF output preserves colours, design, A4 dimensions and multi-page page breaks.

## 11. Messaging and support

### Global messages

Authenticated users see a Messages control with a real unread count.

The inbox behaves like a two-panel messaging workspace:

- Conversation names on the left.
- Active chat on the right.
- Text and attachment support.
- Unread/read tracking.
- Relevant order links.

Only users involved in a conversation appear in the list.

### JobiVerse Support

A pinned official JobiVerse conversation connects every non-admin role directly to the Admin Support Inbox. Users can send text and supported attachments.

## 12. Notification system

Notifications are generated for appropriate users when important events occur, including:

- New or assigned requirements.
- Candidate submissions and pipeline changes.
- Applications, interviews, offers and placements.
- Negotiations, payments, deliveries, revisions and completion.
- Refunds, disputes and payouts.
- Payout-account verification.
- Messages and support updates.

Each notification includes the relevant participant name where appropriate and links directly to the related workspace.

Users can control notification preferences by category and channel.

### Transactional email

Database notifications create durable email-outbox records. The worker supports:

- Queued delivery.
- Preference-based skipping.
- Retry backoff.
- Attempt limits.
- Provider message IDs.
- Failure recording.
- Recovery of stale processing records.

Admin can monitor queued, sent, failed and skipped emails and safely retry failed deliveries. Production email starts after a provider and verified sender domain are configured.

## 13. Billing and financial records

Customer Billing & Purchases combines:

- Marketplace purchases.
- CV purchases.
- Payment status.
- Receipts.
- Refund information.

Admin Finance includes:

- Captured collections.
- Marketplace margins.
- CV revenue.
- Creator payout liability.
- Completed payouts.
- Razorpay transaction ledger.
- CSV exports for payments, margins, refunds and payouts.

Sensitive creator pricing, internal margin and payout data are never exposed to ordinary customers.

## 14. Admin control model

Admin Sidebar modules include:

- Dashboard.
- Requirements.
- Companies.
- Candidates.
- Recruiters.
- Analytics.
- Billing.
- Marketplace Control.
- CV Templates.
- Finance & Payouts.
- Payout Accounts.
- Refund Center.
- Message Safety.
- Support Inbox.
- Email Delivery.
- Settings and Launch Readiness.

Operational badges show real pending or unread workload where relevant.

## 15. Security model

JobiVerse uses:

- Supabase Auth for identity.
- PostgreSQL and Row Level Security for data isolation.
- Server-side role authorization for protected actions.
- Service-role access only for privileged queues and selected administration.
- Owner-scoped Storage policies for private uploads.
- Signed URLs for protected files.
- Server-side Razorpay signature verification.
- Safe internal redirect validation.
- Active-account checks for suspended users.
- File type and size restrictions.
- Audit-oriented status history and retained finance records.

Public-read surfaces are limited to information intentionally needed for the public marketplace, such as reviews, creator verification indicators and public profile images.

## 16. Technology architecture

### Frontend

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Shadcn/Base UI components.
- Framer Motion.
- Lucide icons plus custom social icons.

### Backend

- Next.js Server Actions and Route Handlers.
- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Row Level Security.
- Database functions and triggers for controlled workflows.

### Payments and email

- Razorpay Test Mode is integrated; Live Mode requires owner KYC and production credentials.
- Transactional email is provider-ready; production delivery requires Resend/SMTP configuration.

### Quality gates

- ESLint passes.
- TypeScript passes.
- Production build compiles all 111 routes.
- Public smoke and protected-access regression coverage is available through Playwright.

## 17. AI roadmap

The planned AI layer includes:

- AI Resume Builder.
- Resume Analyzer and ATS checker.
- Interview preparation and feedback.
- Smart candidate-job matching.
- Career Coach AI.
- Employer hiring assistance.

The codebase keeps AI launch surfaces marked as coming soon. Activation requires an approved provider budget, usage limits, user consent, privacy controls and monitoring. API keys must remain in secure environment variables and must never be exposed in chat, browser code or source control.

## 18. Complete platform lifecycle

The overall JobiVerse lifecycle is:

1. A company joins and creates a hiring requirement.
2. JobiVerse assigns a recruiter.
3. Recruiter sources and evaluates candidates.
4. Employer interviews and selects talent.
5. Candidate receives an offer and joins.
6. JobiVerse records placement, billing and replacement coverage.
7. Candidates and students improve their careers using free opportunities and optional paid services.
8. Qualified professionals become Creators and sell expertise.
9. JobiVerse collects customer payments, retains the platform margin and records creator earnings.
10. Admin manages quality, safety, refunds, payouts, support and compliance.
11. Notifications and transactional email connect every participant to the correct next action.

This creates one connected universe where a student can start a career, a professional can grow or earn, a company can build a team, a recruiter can work efficiently and JobiVerse can operate the complete relationship through one platform.
