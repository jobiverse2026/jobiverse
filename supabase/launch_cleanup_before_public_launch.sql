-- JobiVerse admin-only launch cleanup script
-- Goal: keep ONLY admin accounts and JobiVerse/admin-owned services.
-- Deletes all candidate/employer/recruiter/creator/test users and their data.
--
-- IMPORTANT:
-- 1) Run the DRY RUN section first.
-- 2) Confirm admin accounts listed are the only accounts you want to keep.
-- 3) Then run the CLEANUP section.
-- 4) Real Razorpay payments are not deleted from Razorpay dashboard. Refund from Razorpay if needed.
-- 5) Storage files may still remain in Supabase Storage; remove those from Storage UI after SQL if desired.

-- =========================================================
-- DRY RUN
-- =========================================================

select id, email, full_name, role, is_active, created_at
from public.users
where role::text = 'admin'
order by created_at;

select role::text as role, count(*) as users
from public.users
group by role::text
order by role::text;

select 'auth_users_to_delete' as metric, count(*) as value
from auth.users au
where not exists (
  select 1
  from public.users pu
  where pu.id = au.id
    and pu.role::text = 'admin'
);

select 'companies' as table_name, count(*) as rows from public.companies
union all select 'employer_team_members', count(*) from public.employer_team_members
union all select 'employer_team_invitations', count(*) from public.employer_team_invitations
union all select 'requirements', count(*) from public.requirements
union all select 'candidates', count(*) from public.candidates
union all select 'candidate_applications', count(*) from public.candidate_applications
union all select 'marketplace_services_non_admin', count(*) from public.marketplace_services s where not exists (select 1 from public.users u where u.id = s.provider_id and u.role::text = 'admin')
union all select 'marketplace_orders', count(*) from public.marketplace_orders
union all select 'marketplace_offers', count(*) from public.marketplace_offers
union all select 'payment_attempts', count(*) from public.payment_attempts
union all select 'resume_purchases', count(*) from public.resume_purchases
union all select 'notifications', count(*) from public.notifications
union all select 'support_conversations', count(*) from public.support_conversations
union all select 'consultation_bookings', count(*) from public.consultation_bookings
union all select 'buyer_billing_profiles', count(*) from public.buyer_billing_profiles
union all select 'campus_partnership_enquiries', count(*) from public.campus_partnership_enquiries
union all select 'platform_events', count(*) from public.platform_events
union all select 'job_reports', count(*) from public.job_reports
union all select 'privacy_requests', count(*) from public.privacy_requests
union all select 'ai_outputs', (select count(*) from public.ai_analyses) + (select count(*) from public.resume_analyses) + (select count(*) from public.ai_interaction_audit)
order by table_name;

-- =========================================================
-- CLEANUP
-- =========================================================

begin;

-- Marketplace transactions, reviews, reports and payout activity
delete from public.marketplace_review_reports;
delete from public.marketplace_review_votes;
delete from public.marketplace_reviews;
delete from public.marketplace_service_reports;
delete from public.marketplace_message_reports;
delete from public.marketplace_dispute_events;
delete from public.marketplace_disputes;
delete from public.marketplace_refund_requests;
delete from public.creator_payout_items;
delete from public.creator_payout_requests;
delete from public.marketplace_order_messages;
delete from public.marketplace_orders;
delete from public.marketplace_offers;
delete from public.resume_purchases;
delete from public.payment_attempts;

-- Delete all non-JobiVerse creator services.
-- Admin-owned services are treated as JobiVerse services and kept.
delete from public.marketplace_services s
where not exists (
  select 1
  from public.users u
  where u.id = s.provider_id
    and u.role::text = 'admin'
);

-- Reset JobiVerse/admin-owned service counters and featured state.
update public.marketplace_services
set
  is_featured = false,
  featured_until = null,
  average_rating = 0,
  review_count = 0,
  total_orders = 0,
  view_count = 0,
  updated_at = now()
where true;

-- Creator/public marketplace profiles for non-admin users
delete from public.creator_marketplace_profiles p
where not exists (
  select 1
  from public.users u
  where u.id = p.creator_id
    and u.role::text = 'admin'
);

delete from public.creator_availability a
where not exists (
  select 1
  from public.users u
  where u.id = a.creator_id
    and u.role::text = 'admin'
);

delete from public.creator_payout_profiles p
where not exists (
  select 1
  from public.users u
  where u.id = p.creator_id
    and u.role::text = 'admin'
);

-- Hiring/applicant/recruitment activity
delete from public.employer_candidate_notes;
delete from public.employer_candidate_shortlists;
delete from public.talent_introductions;
delete from public.application_interviews;
delete from public.candidate_applications;
delete from public.candidate_saved_jobs;
delete from public.placements;
delete from public.interviews;
delete from public.candidate_activities;
delete from public.candidate_notes;
delete from public.requirement_recruiter_assignments;
delete from public.requirement_notes;
delete from public.candidates;
delete from public.requirements;

-- Candidate/profile/card/test career data
delete from public.candidate_card_views;
delete from public.candidate_job_alert_preferences;
delete from public.candidate_resume_versions;
delete from public.career_passport_items;
delete from public.career_passports;
delete from public.candidate_profiles;

-- Employer/company/team access data
delete from public.employer_team_invitations;
delete from public.employer_team_members;
delete from public.companies;

-- Communication, notifications, email queue, support and operational test data
delete from public.transactional_email_outbox;
delete from public.notifications;
delete from public.notification_preferences;
delete from public.buyer_billing_profiles;
delete from public.support_messages;
delete from public.support_conversations;
delete from public.consultation_bookings;
delete from public.event_registrations;
delete from public.platform_events;
delete from public.campus_partnership_enquiries;
delete from public.referrals;
delete from public.referral_profiles;
delete from public.job_reports;
delete from public.privacy_requests;
delete from public.user_privacy_preferences;
delete from public.audit_logs;

-- AI/resume analysis test outputs
delete from public.ai_interaction_audit;
delete from public.ai_analyses;
delete from public.resume_analyses;

-- Keep AI feature definitions, but clear reviewer references to non-admin users.
update public.ai_feature_registry
set
  last_reviewed_by = null,
  last_reviewed_at = null,
  updated_at = now()
where last_reviewed_by is not null
  and not exists (
    select 1
    from public.users u
    where u.id = ai_feature_registry.last_reviewed_by
      and u.role::text = 'admin'
  );

-- Membership/subscription test data, but keep plan definitions.
delete from public.platform_subscriptions;

-- Delete every non-admin auth user.
-- This cascades public.users rows because public.users.id references auth.users(id) on delete cascade.
delete from auth.users au
where not exists (
  select 1
  from public.users pu
  where pu.id = au.id
    and pu.role::text = 'admin'
);

-- Safety cleanup for public users that may not have matching auth rows.
delete from public.users
where role::text <> 'admin';

commit;

-- =========================================================
-- OPTIONAL after SQL
-- =========================================================
-- Supabase Storage UI:
-- Delete old files from test buckets if you want a fully clean storage surface:
-- candidate-resumes, creator-templates, marketplace-deliveries,
-- marketplace-disputes, marketplace-messages, support-attachments, user-avatars.
--
-- Keep branding assets in the app repo/public folder; this SQL does not touch repo files.
