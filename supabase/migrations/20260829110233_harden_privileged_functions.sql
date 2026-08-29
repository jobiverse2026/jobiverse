-- Restrict privileged RPCs to their real callers and collapse the Admin sidebar
-- badge workload into one server-only database round trip.

alter function public.update_updated_at_column() set search_path = '';
alter function public.set_updated_at() set search_path = '';
alter function public.set_creator_payout_profile_updated_at() set search_path = '';
alter function public.touch_user_feedback_updated_at() set search_path = '';

create or replace function public.admin_pending_counts()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    '/admin', (select count(*)::int from public.notifications where read_at is null),
    '/admin/requirements', (select count(*)::int from public.requirements where hiring_team_requested = true and status not in ('Closed', 'Cancelled')),
    '/admin/free-hiring', (select count(*)::int from public.notifications where type in ('free_employer_joined', 'free_job_published', 'external_application_new', 'direct_hire_fee_due') and read_at is null),
    '/admin/analytics', 0,
    '/admin/custom-portals', (select count(*)::int from public.custom_portal_requests where status = 'new'),
    '/admin/growth', 0,
    '/admin/campus', (select count(*)::int from public.campus_partnership_enquiries where status = 'new'),
    '/admin/memberships', (select count(*)::int from public.platform_subscriptions where status = 'requested'),
    '/admin/credentials', (select count(*)::int from public.career_passport_items where item_type = 'credential' and verification_status in ('self_declared', 'pending') and evidence_url is not null),
    '/admin/billing', (select count(*)::int from public.placements where payment_status in ('not_invoiced', 'invoiced', 'partially_paid', 'overdue')),
    '/admin/marketplace', (
      (select count(*)::int from public.marketplace_orders where status = 'completed' and payout_status in ('eligible', 'held')) +
      (select count(*)::int from public.marketplace_service_reports where status in ('open', 'reviewing')) +
      (select count(*)::int from public.marketplace_review_reports where status in ('open', 'reviewing'))
    ),
    '/admin/templates', (select count(*)::int from public.marketplace_services where is_editable = true and template_review_status = 'pending'),
    '/admin/finance', (
      (select count(*)::int from public.creator_payout_requests where status in ('requested', 'approved')) +
      (select count(*)::int from public.notifications where type = 'payment_captured' and read_at is null)
    ),
    '/admin/payout-accounts', (select count(*)::int from public.creator_payout_profiles where status = 'pending'),
    '/admin/refunds', (select count(*)::int from public.marketplace_refund_requests where status = 'requested'),
    '/admin/message-reports', (select count(*)::int from public.marketplace_message_reports where status = 'open'),
    '/admin/trust-safety', (select count(*)::int from public.job_reports where status in ('open', 'reviewing')),
    '/admin/consultations', (select count(*)::int from public.consultation_bookings where status = 'requested'),
    '/admin/privacy-requests', (select count(*)::int from public.privacy_requests where status in ('submitted', 'in_review')),
    '/admin/support', (select coalesce(sum(unread_for_admin), 0)::int from public.support_conversations),
    '/admin/email-delivery', (select count(*)::int from public.transactional_email_outbox where status = 'failed'),
    '/admin/feedback', (select count(*)::int from public.user_feedback where status in ('new', 'reviewing', 'planned')),
    '/admin/business-health', (
      (select count(*)::int from public.user_feedback where status in ('new', 'reviewing', 'planned')) +
      (select count(*)::int from public.transactional_email_outbox where status = 'failed')
    )
  );
$$;

do $$
declare
  function_signature text;
begin
  for function_signature in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', function_signature);
  end loop;
end;
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.get_or_create_support_conversation() to authenticated;
grant execute on function public.manage_candidate_placement(uuid, public.placement_status, numeric, date) to authenticated;
grant execute on function public.mark_marketplace_messages_read(uuid) to authenticated;
grant execute on function public.mark_support_read(uuid) to authenticated;
grant execute on function public.reopen_marketplace_dispute(uuid, text) to authenticated;
grant execute on function public.request_creator_payout() to authenticated;
grant execute on function public.schedule_candidate_interview(uuid, text, timestamptz, text, text, text) to authenticated;
grant execute on function public.update_interview_outcome(uuid, public.interview_status, text, smallint, public.candidate_status, timestamptz) to authenticated;

grant execute on function public.admin_pending_counts() to service_role;
grant execute on function public.cleanup_old_notifications(integer, integer) to service_role;
grant execute on function public.enqueue_transactional_email() to service_role;
grant execute on function public.increment_marketplace_service_view(text) to service_role;
grant execute on function public.queue_lifecycle_notification(uuid, text, text, text, text, text, text, text) to service_role;
