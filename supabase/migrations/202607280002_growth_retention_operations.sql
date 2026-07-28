create table if not exists public.lifecycle_automation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  automation_key text not null,
  reference_key text not null default 'platform',
  cycle_key text not null,
  notification_id uuid references public.notifications(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, automation_key, reference_key, cycle_key)
);

create index if not exists lifecycle_automation_log_created_idx
  on public.lifecycle_automation_log(created_at desc);

alter table public.lifecycle_automation_log enable row level security;
revoke all on public.lifecycle_automation_log from public, anon, authenticated;
grant select, insert, update, delete on public.lifecycle_automation_log to service_role;

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_snapshot text,
  category text not null check (category in ('issue','feature','service_request','experience')),
  area text not null,
  subject text not null check (char_length(subject) between 3 and 140),
  details text not null check (char_length(details) between 10 and 4000),
  rating smallint check (rating between 1 and 5),
  page_url text,
  status text not null default 'new' check (status in ('new','reviewing','planned','resolved','dismissed')),
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_feedback_user_created_idx on public.user_feedback(user_id, created_at desc);
create index if not exists user_feedback_admin_queue_idx on public.user_feedback(status, created_at desc);
alter table public.user_feedback enable row level security;

drop policy if exists "Users submit own feedback" on public.user_feedback;
create policy "Users submit own feedback" on public.user_feedback
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users view own feedback" on public.user_feedback;
create policy "Users view own feedback" on public.user_feedback
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Admins manage feedback" on public.user_feedback;
create policy "Admins manage feedback" on public.user_feedback
  for all to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin' and u.is_active = true))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin' and u.is_active = true));

grant select, insert, update on public.user_feedback to authenticated;
grant update, delete on public.user_feedback to service_role;

create or replace function public.touch_user_feedback_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'resolved' and old.status is distinct from 'resolved' then new.resolved_at := now(); end if;
  return new;
end;
$$;

drop trigger if exists user_feedback_touch_updated_at on public.user_feedback;
create trigger user_feedback_touch_updated_at before update on public.user_feedback
for each row execute function public.touch_user_feedback_updated_at();

create or replace function public.notify_admins_about_feedback()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id, type, title, message, href)
  select u.id, 'platform_feedback', 'New JobiVerse feedback',
    coalesce(p.full_name, u.full_name, 'A platform member') || ' submitted ' || replace(new.category, '_', ' ') || ': ' || new.subject,
    '/admin/feedback?id=' || new.id::text
  from public.users u
  left join public.profiles p on p.auth_user_id = u.id
  where u.role = 'admin' and u.is_active = true;
  return new;
end;
$$;

drop trigger if exists user_feedback_notify_admins on public.user_feedback;
create trigger user_feedback_notify_admins after insert on public.user_feedback
for each row execute function public.notify_admins_about_feedback();

create or replace function public.queue_lifecycle_notification(
  target_user uuid,
  automation_key_input text,
  reference_key_input text,
  cycle_key_input text,
  title_input text,
  message_input text,
  href_input text,
  notification_type_input text default 'lifecycle_nudge'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
  created_notification_id uuid;
begin
  insert into public.lifecycle_automation_log(user_id, automation_key, reference_key, cycle_key)
  values (target_user, automation_key_input, coalesce(reference_key_input, 'platform'), cycle_key_input)
  on conflict do nothing
  returning id into log_id;
  if log_id is null then return false; end if;

  insert into public.notifications(user_id, type, title, message, href)
  values (target_user, notification_type_input, title_input, message_input, href_input)
  returning id into created_notification_id;

  update public.lifecycle_automation_log set notification_id = created_notification_id where id = log_id;
  return true;
end;
$$;

revoke all on function public.queue_lifecycle_notification(uuid,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.queue_lifecycle_notification(uuid,text,text,text,text,text,text,text) to service_role;
