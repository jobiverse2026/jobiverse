begin;
create table if not exists public.candidate_saved_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(candidate_user_id, requirement_id)
);
create index if not exists candidate_saved_jobs_user_created_idx on public.candidate_saved_jobs(candidate_user_id, created_at desc);
alter table public.candidate_saved_jobs enable row level security;
drop policy if exists "Candidates manage own saved jobs" on public.candidate_saved_jobs;
create policy "Candidates manage own saved jobs" on public.candidate_saved_jobs for all to authenticated using (candidate_user_id = auth.uid()) with check (candidate_user_id = auth.uid());
grant select, insert, delete on public.candidate_saved_jobs to authenticated;
commit;
