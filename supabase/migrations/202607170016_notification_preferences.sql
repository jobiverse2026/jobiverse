begin;

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_jobs boolean not null default true,
  in_app_recruitment boolean not null default true,
  in_app_marketplace boolean not null default true,
  in_app_payments boolean not null default true,
  in_app_messages boolean not null default true,
  email_jobs boolean not null default true,
  email_recruitment boolean not null default true,
  email_marketplace boolean not null default true,
  email_payments boolean not null default true,
  email_messages boolean not null default true,
  marketing_email boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
drop policy if exists "Users manage own notification preferences" on public.notification_preferences;
create policy "Users manage own notification preferences"
  on public.notification_preferences for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;

commit;
