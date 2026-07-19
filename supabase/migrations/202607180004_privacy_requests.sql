begin;

create table if not exists public.user_privacy_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  profile_discovery boolean not null default false,
  career_recommendations boolean not null default true,
  marketing_research boolean not null default false,
  consent_version text not null default '2026-07',
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  request_type text not null check (request_type in ('access','correction','deletion','consent_withdrawal','grievance')),
  details text not null check (char_length(trim(details)) between 10 and 2000),
  status text not null default 'submitted' check (status in ('submitted','in_review','completed','rejected')),
  admin_note text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists privacy_requests_one_active_type_idx on public.privacy_requests(user_id, request_type) where status in ('submitted','in_review');
create index if not exists privacy_requests_status_idx on public.privacy_requests(status, created_at);

alter table public.user_privacy_preferences enable row level security;
alter table public.privacy_requests enable row level security;

drop policy if exists "Users manage own privacy preferences" on public.user_privacy_preferences;
create policy "Users manage own privacy preferences" on public.user_privacy_preferences for all to authenticated using (user_id=auth.uid() or public.current_user_role()='admin') with check (user_id=auth.uid() or public.current_user_role()='admin');

drop policy if exists "Users submit own privacy requests" on public.privacy_requests;
create policy "Users submit own privacy requests" on public.privacy_requests for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "Users view own privacy requests" on public.privacy_requests;
create policy "Users view own privacy requests" on public.privacy_requests for select to authenticated using (user_id=auth.uid() or public.current_user_role()='admin');

grant select,insert,update on public.user_privacy_preferences to authenticated;
grant select,insert on public.privacy_requests to authenticated;
grant all on public.user_privacy_preferences,public.privacy_requests to service_role;

commit;
