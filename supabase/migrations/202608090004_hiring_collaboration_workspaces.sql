begin;

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.candidate_applications(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  attachment_url text,
  attachment_name text,
  created_at timestamptz not null default now()
);

create index if not exists application_messages_thread_idx
  on public.application_messages(application_id, created_at);

alter table public.application_messages enable row level security;

drop policy if exists application_messages_participants_read on public.application_messages;
create policy application_messages_participants_read on public.application_messages
for select to authenticated using (
  sender_id = auth.uid()
  or exists (
    select 1 from public.candidate_applications a
    join public.requirements r on r.id = a.requirement_id
    where a.id = application_messages.application_id
      and (a.candidate_user_id = auth.uid() or r.employer_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

drop policy if exists application_messages_participants_create on public.application_messages;
create policy application_messages_participants_create on public.application_messages
for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.candidate_applications a
    join public.requirements r on r.id = a.requirement_id
    where a.id = application_messages.application_id
      and (a.candidate_user_id = auth.uid() or r.employer_id = auth.uid())
  )
);

create table if not exists public.employment_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.candidate_applications(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  job_title text not null,
  annual_ctc numeric(14,2) not null check (annual_ctc > 0),
  work_location text,
  joining_date date,
  terms text,
  status text not null default 'sent' check (status in ('draft','sent','countered','accepted','declined','withdrawn')),
  candidate_response text,
  counter_annual_ctc numeric(14,2) check (counter_annual_ctc is null or counter_annual_ctc > 0),
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employment_offers enable row level security;

drop policy if exists employment_offers_participants_read on public.employment_offers;
create policy employment_offers_participants_read on public.employment_offers
for select to authenticated using (
  employer_id = auth.uid() or candidate_user_id = auth.uid() or public.current_user_role() = 'admin'
);

drop policy if exists employment_offers_employer_create on public.employment_offers;
create policy employment_offers_employer_create on public.employment_offers
for insert to authenticated with check (
  employer_id = auth.uid()
  and exists (
    select 1 from public.candidate_applications a
    join public.requirements r on r.id = a.requirement_id
    where a.id = employment_offers.application_id
      and a.candidate_user_id = employment_offers.candidate_user_id
      and r.employer_id = auth.uid()
  )
);

drop policy if exists employment_offers_participants_update on public.employment_offers;
create policy employment_offers_participants_update on public.employment_offers
for update to authenticated using (employer_id = auth.uid() or candidate_user_id = auth.uid())
with check (employer_id = auth.uid() or candidate_user_id = auth.uid());

create table if not exists public.interview_prep_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  application_id uuid references public.candidate_applications(id) on delete cascade,
  prompt_key text not null,
  answer text not null check (char_length(answer) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(candidate_user_id, application_id, prompt_key)
);

alter table public.interview_prep_notes enable row level security;
drop policy if exists interview_prep_notes_owner_all on public.interview_prep_notes;
create policy interview_prep_notes_owner_all on public.interview_prep_notes
for all to authenticated using (candidate_user_id = auth.uid()) with check (candidate_user_id = auth.uid());

grant select, insert on public.application_messages to authenticated;
grant select, insert on public.employment_offers to authenticated;
revoke update on public.employment_offers from authenticated;
grant update(status, candidate_response, counter_annual_ctc, responded_at, updated_at) on public.employment_offers to authenticated;
grant select, insert, update, delete on public.interview_prep_notes to authenticated;

commit;
