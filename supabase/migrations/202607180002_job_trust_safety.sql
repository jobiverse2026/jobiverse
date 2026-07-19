begin;

create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('fee_request','misleading','expired','discrimination','suspicious_contact','other')),
  details text not null check (char_length(trim(details)) between 10 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(requirement_id, reporter_id)
);

create index if not exists job_reports_status_created_idx on public.job_reports(status, created_at desc);
alter table public.job_reports enable row level security;

drop policy if exists "Users can submit job reports" on public.job_reports;
create policy "Users can submit job reports" on public.job_reports for insert to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "Users can view own job reports" on public.job_reports;
create policy "Users can view own job reports" on public.job_reports for select to authenticated
using (reporter_id = auth.uid() or public.current_user_role() = 'admin');

grant select, insert on public.job_reports to authenticated;
grant select, insert, update, delete on public.job_reports to service_role;

comment on table public.job_reports is 'Candidate fraud and safety reports for public hiring requirements.';

commit;
