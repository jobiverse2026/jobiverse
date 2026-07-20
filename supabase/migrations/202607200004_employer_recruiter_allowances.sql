alter table public.employer_team_members
add column if not exists recruiter_seat_limit integer not null default 0
check (recruiter_seat_limit >= 0 and recruiter_seat_limit <= 500);

create index if not exists employer_team_members_manager_idx
on public.employer_team_members (company_id, employer_id, role, status);
