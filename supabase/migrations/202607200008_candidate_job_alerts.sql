create table if not exists public.candidate_job_alert_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_titles text,
  locations text,
  work_modes text[],
  experience_range text,
  salary_expectation text,
  frequency text not null default 'instant',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.candidate_job_alert_preferences enable row level security;

drop policy if exists "Candidates can manage own job alerts" on public.candidate_job_alert_preferences;
create policy "Candidates can manage own job alerts"
on public.candidate_job_alert_preferences
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists candidate_job_alert_preferences_user_idx
on public.candidate_job_alert_preferences(user_id);
