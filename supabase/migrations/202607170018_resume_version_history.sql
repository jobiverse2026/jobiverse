begin;
create table if not exists public.candidate_resume_versions (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null default 'Resume.pdf',
  label text not null default 'Resume version',
  size_bytes bigint,
  source text not null default 'upload' check (source in ('upload','profile','duplicate','restore','builder')),
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists candidate_resume_versions_user_created_idx on public.candidate_resume_versions(candidate_user_id, created_at desc);
create unique index if not exists candidate_resume_versions_one_current_idx on public.candidate_resume_versions(candidate_user_id) where is_current;
alter table public.candidate_resume_versions enable row level security;
drop policy if exists "Candidates manage own resume versions" on public.candidate_resume_versions;
create policy "Candidates manage own resume versions" on public.candidate_resume_versions for all to authenticated using (candidate_user_id=auth.uid()) with check (candidate_user_id=auth.uid());
grant select,insert,update,delete on public.candidate_resume_versions to authenticated;

insert into public.candidate_resume_versions(candidate_user_id,storage_path,file_name,label,source,is_current)
select user_id,resume_path,'Current Resume.pdf','Current resume','profile',true from public.candidate_profiles p
where resume_path is not null and not exists(select 1 from public.candidate_resume_versions v where v.candidate_user_id=p.user_id);
commit;
