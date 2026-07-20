-- Adds recruiter attribution fields used by recruiter/admin submissions and reports.

begin;

alter table public.candidates
  add column if not exists recruiter_name text,
  add column if not exists recruiter_email text;

update public.candidates c
set
  recruiter_name = coalesce(c.recruiter_name, u.full_name),
  recruiter_email = coalesce(c.recruiter_email, u.email)
from public.users u
where c.recruiter_id = u.id
  and (c.recruiter_name is null or c.recruiter_email is null);

create index if not exists candidates_recruiter_email_idx
  on public.candidates (lower(recruiter_email));

comment on column public.candidates.recruiter_name is
  'Snapshot of the recruiter or JobiVerse Hiring Team name at submission time.';

comment on column public.candidates.recruiter_email is
  'Snapshot of the recruiter email at submission time for reports and attribution.';

notify pgrst, 'reload schema';

commit;
