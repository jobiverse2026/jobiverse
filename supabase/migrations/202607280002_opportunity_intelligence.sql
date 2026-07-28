begin;

create table if not exists public.candidate_tracked_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null default 'partner' check (source_type in ('partner','manual')),
  provider text,
  external_job_id text,
  job_title text not null,
  company_name text,
  location text,
  apply_url text,
  status text not null default 'Applied' check (status in ('Saved','Applied','Response awaited','Interview','Offer','Rejected','Withdrawn','Joined')),
  applied_at timestamptz not null default now(),
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists candidate_tracked_applications_source_unique
  on public.candidate_tracked_applications(candidate_user_id, provider, external_job_id)
  where external_job_id is not null;
create index if not exists candidate_tracked_applications_user_idx
  on public.candidate_tracked_applications(candidate_user_id, updated_at desc);

alter table public.candidate_tracked_applications enable row level security;
drop policy if exists tracked_applications_owner_read on public.candidate_tracked_applications;
drop policy if exists tracked_applications_owner_insert on public.candidate_tracked_applications;
drop policy if exists tracked_applications_owner_update on public.candidate_tracked_applications;
drop policy if exists tracked_applications_owner_delete on public.candidate_tracked_applications;
create policy tracked_applications_owner_read on public.candidate_tracked_applications for select to authenticated
  using (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');
create policy tracked_applications_owner_insert on public.candidate_tracked_applications for insert to authenticated
  with check (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');
create policy tracked_applications_owner_update on public.candidate_tracked_applications for update to authenticated
  using (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate')
  with check (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');
create policy tracked_applications_owner_delete on public.candidate_tracked_applications for delete to authenticated
  using (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');

comment on table public.candidate_tracked_applications is
  'Candidate-owned tracker for applications completed outside JobiVerse on attributed partner sources.';

commit;
