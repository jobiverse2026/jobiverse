alter table public.companies
add column if not exists recruiter_seat_limit integer not null default 0 check (recruiter_seat_limit >= 0 and recruiter_seat_limit <= 500);

create table if not exists public.employer_team_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  role text not null default 'recruiter' check (role in ('recruiter','manager')),
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, user_id),
  unique(company_id, email)
);

create table if not exists public.employer_team_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  invited_email text not null,
  token text not null unique,
  role text not null default 'recruiter' check (role in ('recruiter','manager')),
  status text not null default 'pending' check (status in ('pending','accepted','cancelled','expired')),
  invited_user_id uuid references public.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, invited_email, status)
);

create index if not exists employer_team_members_employer_idx on public.employer_team_members(employer_id, status);
create index if not exists employer_team_members_user_idx on public.employer_team_members(user_id, status);
create index if not exists employer_team_invitations_employer_idx on public.employer_team_invitations(employer_id, status);
create index if not exists employer_team_invitations_token_idx on public.employer_team_invitations(token);

alter table public.employer_team_members enable row level security;
alter table public.employer_team_invitations enable row level security;

drop policy if exists employer_team_members_owner_read on public.employer_team_members;
drop policy if exists employer_team_invitations_owner_read on public.employer_team_invitations;

create policy employer_team_members_owner_read on public.employer_team_members
for select to authenticated
using (employer_id = auth.uid() or user_id = auth.uid() or public.current_user_role() = 'admin');

create policy employer_team_invitations_owner_read on public.employer_team_invitations
for select to authenticated
using (employer_id = auth.uid() or invited_user_id = auth.uid() or public.current_user_role() = 'admin');
