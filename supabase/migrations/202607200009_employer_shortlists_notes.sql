create table if not exists public.employer_candidate_shortlists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  note text,
  created_at timestamp with time zone not null default now(),
  unique(company_id, employer_id, candidate_id)
);

create index if not exists employer_candidate_shortlists_company_idx
  on public.employer_candidate_shortlists(company_id, created_at desc);

create index if not exists employer_candidate_shortlists_candidate_idx
  on public.employer_candidate_shortlists(candidate_id);

alter table public.employer_candidate_shortlists enable row level security;

drop policy if exists employer_shortlists_owner_access on public.employer_candidate_shortlists;
create policy employer_shortlists_owner_access
  on public.employer_candidate_shortlists
  for all
  to authenticated
  using (
    employer_id = auth.uid()
    or public.current_user_role() in ('admin')
  )
  with check (
    employer_id = auth.uid()
    or public.current_user_role() in ('admin')
  );

create table if not exists public.employer_candidate_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  note text not null,
  is_jobiverse_protected boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create index if not exists employer_candidate_notes_company_idx
  on public.employer_candidate_notes(company_id, created_at desc);

create index if not exists employer_candidate_notes_candidate_idx
  on public.employer_candidate_notes(candidate_id, created_at desc);

alter table public.employer_candidate_notes enable row level security;

drop policy if exists employer_notes_owner_access on public.employer_candidate_notes;
create policy employer_notes_owner_access
  on public.employer_candidate_notes
  for all
  to authenticated
  using (
    employer_id = auth.uid()
    or public.current_user_role() in ('admin')
  )
  with check (
    employer_id = auth.uid()
    or public.current_user_role() in ('admin')
  );
