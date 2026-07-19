begin;

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  resume_path text not null,
  model text not null,
  ats_score smallint not null check (ats_score between 0 and 100),
  impact_score smallint not null check (impact_score between 0 and 100),
  readability_score smallint not null check (readability_score between 0 and 100),
  keyword_score smallint not null check (keyword_score between 0 and 100),
  summary text not null,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  missing_keywords jsonb not null default '[]'::jsonb,
  suggested_roles jsonb not null default '[]'::jsonb,
  section_feedback jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resume_analyses_candidate_idx on public.resume_analyses(candidate_user_id, created_at desc);
alter table public.resume_analyses enable row level security;

drop policy if exists resume_analyses_read on public.resume_analyses;
drop policy if exists resume_analyses_create on public.resume_analyses;
create policy resume_analyses_read on public.resume_analyses for select to authenticated
using (candidate_user_id = auth.uid() or public.current_user_role() in ('admin', 'recruiter'));
create policy resume_analyses_create on public.resume_analyses for insert to authenticated
with check (candidate_user_id = auth.uid() and public.current_user_role() = 'candidate');

commit;
