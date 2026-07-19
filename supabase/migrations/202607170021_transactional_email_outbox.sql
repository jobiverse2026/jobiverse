-- Durable transactional-email outbox for JobiVerse notifications.
-- Delivery is intentionally service-role only and can be activated after SMTP/API setup.

create table if not exists public.transactional_email_outbox (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid unique references public.notifications(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  recipient_email text not null,
  category text not null check (category in ('jobs','recruitment','marketplace','payments','messages')),
  template_key text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','processing','sent','failed','skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  processing_started_at timestamptz,
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists transactional_email_outbox_pending_idx
  on public.transactional_email_outbox(status, next_attempt_at, created_at)
  where status in ('queued','failed');
create index if not exists transactional_email_outbox_user_idx
  on public.transactional_email_outbox(user_id, created_at desc);

alter table public.transactional_email_outbox enable row level security;
revoke all on public.transactional_email_outbox from public, anon, authenticated;
grant select, insert, update, delete on public.transactional_email_outbox to service_role;

create or replace function public.notification_email_category(notification_type text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select case
    when notification_type ~ '(job|requirement_assigned)' then 'jobs'
    when notification_type ~ '(application|candidate|interview|placement|offer_update)' then 'recruitment'
    when notification_type ~ '(payment|refund|payout|billing|receipt)' then 'payments'
    when notification_type ~ '(message|support|conversation)' then 'messages'
    else 'marketplace'
  end;
$$;

create or replace function public.enqueue_transactional_email()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  recipient public.users%rowtype;
  preferences public.notification_preferences%rowtype;
  email_category text;
  email_enabled boolean := true;
begin
  select * into recipient from public.users where id = new.user_id;
  if recipient.id is null or recipient.email is null or btrim(recipient.email) = '' then
    return new;
  end if;

  email_category := public.notification_email_category(new.type);
  select * into preferences from public.notification_preferences where user_id = new.user_id;

  if preferences.user_id is not null then
    email_enabled := case email_category
      when 'jobs' then preferences.email_jobs
      when 'recruitment' then preferences.email_recruitment
      when 'payments' then preferences.email_payments
      when 'messages' then preferences.email_messages
      else preferences.email_marketplace
    end;
  end if;

  insert into public.transactional_email_outbox(
    notification_id, user_id, recipient_email, category, template_key,
    subject, payload, status, last_error
  ) values (
    new.id,
    new.user_id,
    lower(btrim(recipient.email)),
    email_category,
    new.type,
    new.title,
    jsonb_build_object(
      'recipient_name', coalesce(nullif(btrim(recipient.full_name), ''), 'JobiVerse member'),
      'title', new.title,
      'message', new.message,
      'href', new.href,
      'reference_id', new.reference_id,
      'notification_created_at', new.created_at
    ),
    case when email_enabled then 'queued' else 'skipped' end,
    case when email_enabled then null else 'Disabled by user notification preferences.' end
  )
  on conflict (notification_id) do nothing;

  update public.notifications
  set email_status = case when email_enabled then 'pending' else 'disabled' end
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists enqueue_transactional_email_on_notification on public.notifications;
create trigger enqueue_transactional_email_on_notification
  after insert on public.notifications
  for each row execute function public.enqueue_transactional_email();

revoke all on function public.notification_email_category(text) from public, anon, authenticated;
revoke all on function public.enqueue_transactional_email() from public, anon, authenticated;
grant execute on function public.notification_email_category(text) to service_role;
grant execute on function public.enqueue_transactional_email() to service_role;

comment on table public.transactional_email_outbox is
  'Service-role-only durable queue for transactional notification emails.';
