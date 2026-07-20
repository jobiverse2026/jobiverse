-- JobiVerse canonical development schema.
-- This migration intentionally replaces the current development-only schema.

begin;

create extension if not exists pgcrypto;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.activities cascade;
drop table if exists public.candidate_activities cascade;
drop table if exists public.candidate_notes cascade;
drop table if exists public.interviews cascade;
drop table if exists public.placements cascade;
drop table if exists public.requirement_notes cascade;
drop table if exists public.candidates cascade;
drop table if exists public.job_requirements cascade;
drop table if exists public.requirements cascade;
drop table if exists public.employer_contacts cascade;
drop table if exists public.companies cascade;
drop table if exists public.recruiters cascade;
drop table if exists public.profiles cascade;
drop table if exists public.users cascade;

drop type if exists public.user_role cascade;
drop type if exists public.requirement_status cascade;
drop type if exists public.candidate_status cascade;
drop type if exists public.interview_status cascade;
drop type if exists public.placement_status cascade;
drop type if exists public.payment_status cascade;
drop type if exists public.ai_analysis_type cascade;

create type public.user_role as enum ('admin', 'recruiter', 'employer', 'candidate');
create type public.requirement_status as enum ('New', 'Open', 'Assigned', 'Sourcing', 'Interview', 'Offer', 'Joined', 'Closed', 'Cancelled');
create type public.candidate_status as enum ('Submitted', 'Screening', 'Client Submitted', 'Interview', 'Selected', 'Offered', 'Joined', 'Rejected', 'Withdrawn');
create type public.interview_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');
create type public.placement_status as enum ('offered', 'accepted', 'joined', 'declined', 'no_show', 'replacement', 'completed');
create type public.payment_status as enum ('not_invoiced', 'invoiced', 'partially_paid', 'paid', 'overdue', 'cancelled');
create type public.ai_analysis_type as enum ('resume_parse', 'resume_analysis', 'ats_score', 'candidate_match', 'interview_prep', 'career_coach', 'job_description');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'candidate',
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete restrict,
  company_name text not null,
  company_email text,
  phone text,
  website text,
  industry text,
  company_size text,
  location text,
  gst_number text,
  address text,
  city text,
  state text,
  country text not null default 'India',
  pincode text,
  logo_url text,
  linkedin_url text,
  description text,
  is_verified boolean not null default false,
  recruiter_seat_limit integer not null default 0 check (recruiter_seat_limit >= 0 and recruiter_seat_limit <= 500),
  employer_seat_limit integer not null default 0 check (employer_seat_limit >= 0 and employer_seat_limit <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  assigned_recruiter uuid references public.users(id) on delete set null,
  job_title text not null,
  department text,
  employment_type text,
  work_mode text,
  experience text,
  vacancies integer not null default 1 check (vacancies > 0),
  budget_ctc text,
  location text,
  notice_period text,
  primary_skills text,
  secondary_skills text,
  education text,
  job_description text not null,
  additional_information text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status public.requirement_status not null default 'Open',
  target_date date,
  fee_percentage numeric(5,2),
  minimum_fee numeric(12,2),
  replacement_days integer not null default 60 check (replacement_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  recruiter_id uuid not null references public.users(id) on delete restrict,
  recruiter_name text,
  recruiter_email text,
  full_name text not null,
  email text not null,
  phone text,
  current_location text,
  total_experience text,
  current_company text,
  current_ctc text,
  expected_ctc text,
  notice_period text,
  primary_skills text,
  secondary_skills text,
  resume_path text,
  linkedin text,
  remarks text,
  status public.candidate_status not null default 'Submitted',
  source text not null default 'recruiter',
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(requirement_id, email)
);

create table public.requirement_notes (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  note text not null,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  note text not null,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.candidate_activities (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  actor_id uuid not null references public.users(id) on delete restrict,
  action text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  interview_round text not null,
  interview_date timestamptz not null,
  interview_mode text,
  meeting_link text,
  interviewer_name text,
  status public.interview_status not null default 'scheduled',
  feedback text,
  rating smallint check (rating between 1 and 5),
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  candidate_id uuid not null unique references public.candidates(id) on delete restrict,
  joining_date date,
  offered_ctc numeric(14,2),
  fee_percentage numeric(5,2),
  placement_fee numeric(14,2),
  gst_amount numeric(14,2),
  invoice_number text,
  invoice_date date,
  payment_due_date date,
  payment_status public.payment_status not null default 'not_invoiced',
  replacement_end_date date,
  status public.placement_status not null default 'offered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  requirement_id uuid references public.requirements(id) on delete cascade,
  analysis_type public.ai_analysis_type not null,
  model text not null,
  input_hash text not null,
  result jsonb not null,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz not null default now(),
  unique(user_id, analysis_type, input_hash)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index requirements_employer_idx on public.requirements(employer_id);
create index requirements_recruiter_idx on public.requirements(assigned_recruiter);
create index requirements_status_idx on public.requirements(status);
create index candidates_requirement_idx on public.candidates(requirement_id);
create index candidates_recruiter_idx on public.candidates(recruiter_id);
create index candidates_email_idx on public.candidates(lower(email));
create index candidates_status_idx on public.candidates(status);
create index interviews_candidate_idx on public.interviews(candidate_id);
create index placements_requirement_idx on public.placements(requirement_id);
create index notifications_user_unread_idx on public.notifications(user_id, read_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger requirements_updated_at before update on public.requirements for each row execute function public.set_updated_at();
create trigger candidates_updated_at before update on public.candidates for each row execute function public.set_updated_at();
create trigger interviews_updated_at before update on public.interviews for each row execute function public.set_updated_at();
create trigger placements_updated_at before update on public.placements for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    else 'candidate'::public.user_role
  end;
  insert into public.users (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data->>'full_name', requested_role);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill auth accounts that existed before a development schema reset.
insert into public.users (id, email, full_name, role)
select
  id,
  coalesce(email, ''),
  raw_user_meta_data->>'full_name',
  case
    when raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    else 'candidate'::public.user_role
  end
from auth.users
on conflict (id) do nothing;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role::text from public.users where id = auth.uid() $$;
revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.requirements enable row level security;
alter table public.candidates enable row level security;
alter table public.requirement_notes enable row level security;
alter table public.candidate_notes enable row level security;
alter table public.candidate_activities enable row level security;
alter table public.interviews enable row level security;
alter table public.placements enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy users_read on public.users for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');
create policy users_update on public.users for update to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (id = auth.uid() or public.current_user_role() = 'admin');

create policy companies_read on public.companies for select to authenticated
using (owner_id = auth.uid() or public.current_user_role() in ('admin','recruiter'));
create policy companies_create on public.companies for insert to authenticated
with check (owner_id = auth.uid() and public.current_user_role() = 'employer');
create policy companies_update on public.companies for update to authenticated
using (owner_id = auth.uid() or public.current_user_role() = 'admin')
with check (owner_id = auth.uid() or public.current_user_role() = 'admin');

create policy requirements_read on public.requirements for select to authenticated
using (employer_id = auth.uid() or assigned_recruiter = auth.uid() or public.current_user_role() = 'admin');
create policy requirements_create on public.requirements for insert to authenticated
with check (employer_id = auth.uid() and public.current_user_role() = 'employer');
create policy requirements_update on public.requirements for update to authenticated
using (employer_id = auth.uid() or assigned_recruiter = auth.uid() or public.current_user_role() = 'admin')
with check (employer_id = auth.uid() or assigned_recruiter = auth.uid() or public.current_user_role() = 'admin');
create policy requirements_delete on public.requirements for delete to authenticated
using (employer_id = auth.uid() or public.current_user_role() = 'admin');

create policy candidates_read on public.candidates for select to authenticated
using (
  recruiter_id = auth.uid() or user_id = auth.uid() or public.current_user_role() = 'admin'
  or exists (select 1 from public.requirements r where r.id = requirement_id and r.employer_id = auth.uid())
);
create policy candidates_create on public.candidates for insert to authenticated
with check ((recruiter_id = auth.uid() and public.current_user_role() = 'recruiter') or public.current_user_role() = 'admin');
create policy candidates_update on public.candidates for update to authenticated
using (recruiter_id = auth.uid() or user_id = auth.uid() or public.current_user_role() = 'admin')
with check (recruiter_id = auth.uid() or user_id = auth.uid() or public.current_user_role() = 'admin');

create policy requirement_notes_access on public.requirement_notes for all to authenticated
using (exists (select 1 from public.requirements r where r.id = requirement_id and (r.assigned_recruiter = auth.uid() or r.employer_id = auth.uid() or public.current_user_role() = 'admin')))
with check (created_by = auth.uid());
create policy candidate_notes_access on public.candidate_notes for all to authenticated
using (exists (select 1 from public.candidates c where c.id = candidate_id and (c.recruiter_id = auth.uid() or public.current_user_role() = 'admin')))
with check (created_by = auth.uid());
create policy candidate_activities_read on public.candidate_activities for select to authenticated
using (exists (select 1 from public.candidates c where c.id = candidate_id and (c.recruiter_id = auth.uid() or c.user_id = auth.uid() or public.current_user_role() = 'admin')));
create policy candidate_activities_create on public.candidate_activities for insert to authenticated
with check (actor_id = auth.uid());

create policy interviews_read on public.interviews for select to authenticated
using (exists (select 1 from public.requirements r where r.id = requirement_id and (r.employer_id = auth.uid() or r.assigned_recruiter = auth.uid() or public.current_user_role() = 'admin')));
create policy interviews_manage on public.interviews for all to authenticated
using (created_by = auth.uid() or public.current_user_role() = 'admin')
with check (created_by = auth.uid() or public.current_user_role() = 'admin');
create policy placements_read on public.placements for select to authenticated
using (exists (select 1 from public.requirements r where r.id = requirement_id and (r.employer_id = auth.uid() or r.assigned_recruiter = auth.uid() or public.current_user_role() = 'admin')));
create policy placements_admin on public.placements for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy ai_analyses_owner on public.ai_analyses for all to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin')
with check (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy notifications_owner on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_admin on public.audit_logs for select to authenticated using (public.current_user_role() = 'admin');

insert into storage.buckets (id, name, public)
values ('candidate-resumes', 'candidate-resumes', false)
on conflict (id) do update set public = false;

drop policy if exists "Allow candidate resume uploads" on storage.objects;
drop policy if exists "Allow candidate resume viewing" on storage.objects;
drop policy if exists resume_upload on storage.objects;
drop policy if exists resume_read on storage.objects;
drop policy if exists resume_delete on storage.objects;
create policy resume_upload on storage.objects for insert to authenticated
with check (bucket_id = 'candidate-resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy resume_read on storage.objects for select to authenticated
using (bucket_id = 'candidate-resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() in ('admin','recruiter')));
create policy resume_delete on storage.objects for delete to authenticated
using (bucket_id = 'candidate-resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() = 'admin'));

commit;
