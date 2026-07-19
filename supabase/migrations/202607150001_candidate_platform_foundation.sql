begin;

do $$ begin
  create type public.application_status as enum ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected', 'Withdrawn');
exception when duplicate_object then null;
end $$;

alter table public.requirements add column if not exists is_public boolean not null default false;
alter table public.requirements add column if not exists published_at timestamptz;

create table if not exists public.candidate_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  headline text,
  phone text,
  current_location text,
  total_experience text,
  current_company text,
  current_ctc text,
  expected_ctc text,
  notice_period text,
  primary_skills text,
  secondary_skills text,
  preferred_locations text,
  preferred_roles text,
  linkedin text,
  portfolio_url text,
  bio text,
  resume_path text,
  profile_completion smallint not null default 0 check (profile_completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  status public.application_status not null default 'Applied',
  cover_note text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(candidate_user_id, requirement_id)
);

create index if not exists candidate_applications_user_idx on public.candidate_applications(candidate_user_id, applied_at desc);
create index if not exists candidate_applications_requirement_idx on public.candidate_applications(requirement_id, status);

alter table public.candidate_profiles enable row level security;
alter table public.candidate_applications enable row level security;

drop policy if exists candidate_profiles_read on public.candidate_profiles;
drop policy if exists candidate_profiles_write on public.candidate_profiles;
create policy candidate_profiles_read on public.candidate_profiles for select to authenticated
using (user_id = auth.uid() or public.current_user_role() in ('admin', 'recruiter'));
create policy candidate_profiles_write on public.candidate_profiles for all to authenticated
using (user_id = auth.uid() and public.current_user_role() = 'candidate')
with check (user_id = auth.uid() and public.current_user_role() = 'candidate');

drop policy if exists candidate_applications_read on public.candidate_applications;
drop policy if exists candidate_applications_create on public.candidate_applications;
drop policy if exists candidate_applications_update on public.candidate_applications;
create policy candidate_applications_read on public.candidate_applications for select to authenticated
using (
  candidate_user_id = auth.uid()
  or public.current_user_role() = 'admin'
  or exists (
    select 1 from public.requirements r
    where r.id = requirement_id
      and (r.assigned_recruiter = auth.uid() or r.employer_id = auth.uid())
  )
);
create policy candidate_applications_create on public.candidate_applications for insert to authenticated
with check (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');
create policy candidate_applications_update on public.candidate_applications for update to authenticated
using (
  candidate_user_id = auth.uid()
  or public.current_user_role() = 'admin'
  or exists (select 1 from public.requirements r where r.id = requirement_id and r.assigned_recruiter = auth.uid())
)
with check (
  candidate_user_id = auth.uid()
  or public.current_user_role() = 'admin'
  or exists (select 1 from public.requirements r where r.id = requirement_id and r.assigned_recruiter = auth.uid())
);

drop policy if exists requirements_read on public.requirements;
create policy requirements_read on public.requirements for select to authenticated
using (
  employer_id = auth.uid()
  or assigned_recruiter = auth.uid()
  or public.current_user_role() = 'admin'
  or (public.current_user_role() = 'candidate' and is_public = true and status not in ('Closed', 'Cancelled'))
);

commit;
