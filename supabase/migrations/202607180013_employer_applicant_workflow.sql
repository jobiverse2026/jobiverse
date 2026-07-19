create table if not exists public.application_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.candidate_applications(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  employer_id uuid not null references public.users(id) on delete cascade,
  interview_round text not null,
  interview_date timestamptz not null,
  interview_mode text,
  meeting_link text,
  interviewer_name text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','rescheduled','no_show')),
  feedback text,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists application_interviews_application_idx on public.application_interviews(application_id,interview_date desc);
alter table public.application_interviews enable row level security;
drop policy if exists application_interviews_participants_read on public.application_interviews;
create policy application_interviews_participants_read on public.application_interviews for select to authenticated using (employer_id=auth.uid() or exists(select 1 from public.candidate_applications a where a.id=application_id and a.candidate_user_id=auth.uid()) or public.current_user_role() in ('admin','recruiter'));
grant select on public.application_interviews to authenticated;

create table if not exists public.talent_introductions (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  candidate_user_id uuid references public.users(id) on delete set null,
  candidate_id uuid references public.candidates(id) on delete set null,
  application_id uuid references public.candidate_applications(id) on delete set null,
  source text not null check(source in ('jobs_portal','jobiverse_hiring_team')),
  commercial_terms text not null,
  protection_starts_at timestamptz not null default now(),
  protection_ends_at timestamptz not null default (now()+interval '12 months'),
  hiring_status text not null default 'introduced' check(hiring_status in ('introduced','in_process','offered','joined','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  unique(application_id),
  unique(candidate_id,requirement_id)
);
alter table public.talent_introductions enable row level security;
drop policy if exists talent_introductions_employer_read on public.talent_introductions;
create policy talent_introductions_employer_read on public.talent_introductions for select to authenticated using(employer_id=auth.uid() or public.current_user_role() in ('admin','recruiter'));
grant select on public.talent_introductions to authenticated;

create or replace function public.record_talent_introduction() returns trigger language plpgsql security definer set search_path=public as $$
declare req public.requirements%rowtype;
begin
  select * into req from public.requirements where id=new.requirement_id;
  if tg_table_name='candidate_applications' then
    insert into public.talent_introductions(employer_id,requirement_id,candidate_user_id,application_id,source,commercial_terms)
    values(req.employer_id,new.requirement_id,new.candidate_user_id,new.id,'jobs_portal','3% one-time placement fee on annual CTC for a direct Jobs Portal joining.') on conflict(application_id) do nothing;
  else
    insert into public.talent_introductions(employer_id,requirement_id,candidate_user_id,candidate_id,source,commercial_terms)
    values(req.employer_id,new.requirement_id,new.user_id,new.id,'jobiverse_hiring_team','Standard JobiVerse Hiring Team success fee: fixed 5% of annual CTC, charged once after successful joining. A different negotiated rate applies only under a separately accepted formal partnership agreement.') on conflict(candidate_id,requirement_id) do nothing;
  end if;return new;
end;$$;
drop trigger if exists direct_application_introduction on public.candidate_applications;
create trigger direct_application_introduction after insert on public.candidate_applications for each row execute function public.record_talent_introduction();
drop trigger if exists jobiverse_candidate_introduction on public.candidates;
create trigger jobiverse_candidate_introduction after insert on public.candidates for each row when(new.requirement_id is not null) execute function public.record_talent_introduction();

insert into public.talent_introductions(employer_id,requirement_id,candidate_user_id,application_id,source,commercial_terms,protection_starts_at)
select r.employer_id,a.requirement_id,a.candidate_user_id,a.id,'jobs_portal','3% one-time placement fee on annual CTC for a direct Jobs Portal joining.',a.applied_at from public.candidate_applications a join public.requirements r on r.id=a.requirement_id on conflict(application_id) do nothing;
insert into public.talent_introductions(employer_id,requirement_id,candidate_user_id,candidate_id,source,commercial_terms,protection_starts_at)
select r.employer_id,c.requirement_id,c.user_id,c.id,'jobiverse_hiring_team','Standard JobiVerse Hiring Team success fee: fixed 5% of annual CTC, charged once after successful joining. A different negotiated rate applies only under a separately accepted formal partnership agreement.',c.created_at from public.candidates c join public.requirements r on r.id=c.requirement_id where c.requirement_id is not null on conflict(candidate_id,requirement_id) do nothing;
