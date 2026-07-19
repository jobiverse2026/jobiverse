begin;

alter table public.marketplace_services
  add column if not exists quality_score integer not null default 0,
  add column if not exists moderation_note text,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz;

alter table public.marketplace_services drop constraint if exists marketplace_services_quality_score_check;
alter table public.marketplace_services add constraint marketplace_services_quality_score_check check (quality_score between 0 and 100);

create table if not exists public.marketplace_service_reports (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.marketplace_services(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('misleading','duplicate','prohibited','copyright','pricing','other')),
  details text not null check (char_length(trim(details)) between 10 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(service_id, reporter_id)
);

alter table public.marketplace_service_reports enable row level security;
drop policy if exists "Users can submit service reports" on public.marketplace_service_reports;
create policy "Users can submit service reports" on public.marketplace_service_reports for insert to authenticated with check (reporter_id=auth.uid());
drop policy if exists "Users can view own service reports" on public.marketplace_service_reports;
create policy "Users can view own service reports" on public.marketplace_service_reports for select to authenticated using (reporter_id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Admins can update service reports" on public.marketplace_service_reports;
create policy "Admins can update service reports" on public.marketplace_service_reports for update to authenticated using (public.current_user_role()='admin') with check (public.current_user_role()='admin');
grant select,insert,update on public.marketplace_service_reports to authenticated;

update public.marketplace_services
set quality_score = least(100,
  35
  + case when char_length(trim(coalesce(short_description,''))) >= 35 then 15 else 0 end
  + case when char_length(trim(coalesce(description,''))) >= 120 then 25 else 0 end
  + case when price >= 0 then 10 else 0 end
  + case when delivery_days between 1 and 30 then 15 else 5 end
)
where quality_score=0;

commit;
