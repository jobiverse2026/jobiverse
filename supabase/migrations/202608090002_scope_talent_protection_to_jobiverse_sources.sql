begin;

create or replace function public.record_talent_introduction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.requirements%rowtype;
begin
  select * into req from public.requirements where id = new.requirement_id;

  if tg_table_name = 'candidate_applications' then
    insert into public.talent_introductions (
      employer_id, requirement_id, candidate_user_id, application_id, source, commercial_terms
    ) values (
      req.employer_id, new.requirement_id, new.candidate_user_id, new.id,
      'jobs_portal',
      '3% one-time placement fee on annual CTC for a direct Jobs Portal joining.'
    ) on conflict (application_id) do nothing;
  elsif coalesce(new.source, 'recruiter') = 'jobiverse_hiring_team' then
    insert into public.talent_introductions (
      employer_id, requirement_id, candidate_user_id, candidate_id, source, commercial_terms
    ) values (
      req.employer_id, new.requirement_id, new.user_id, new.id,
      'jobiverse_hiring_team',
      'Standard JobiVerse Hiring Team success fee: fixed 5% of annual CTC, charged once after successful joining. A different negotiated rate applies only under a separately accepted formal partnership agreement.'
    ) on conflict (candidate_id, requirement_id) do nothing;
  end if;

  return new;
end;
$$;

commit;
