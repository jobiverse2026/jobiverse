begin;

drop policy if exists candidates_read on public.candidates;
create policy candidates_read on public.candidates for select to authenticated
using (
  recruiter_id = auth.uid()
  or user_id = auth.uid()
  or public.current_user_role() = 'admin'
  or (
    status in ('Client Submitted', 'Interview', 'Selected', 'Offered', 'Joined', 'Rejected', 'Withdrawn')
    and exists (
      select 1 from public.requirements r
      where r.id = requirement_id and r.employer_id = auth.uid()
    )
  )
);

drop policy if exists resume_read on storage.objects;
create policy resume_read on storage.objects for select to authenticated
using (
  bucket_id = 'candidate-resumes'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.current_user_role() in ('admin', 'recruiter')
    or exists (
      select 1
      from public.candidates c
      join public.requirements r on r.id = c.requirement_id
      where c.resume_path = name
        and r.employer_id = auth.uid()
        and c.status in ('Client Submitted', 'Interview', 'Selected', 'Offered', 'Joined', 'Rejected', 'Withdrawn')
    )
  )
);

create or replace function public.schedule_candidate_interview(
  p_candidate_id uuid,
  p_interview_round text,
  p_interview_date timestamptz,
  p_interview_mode text default null,
  p_meeting_link text default null,
  p_interviewer_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requirement_id uuid;
  v_interview_id uuid;
begin
  if public.current_user_role() <> 'employer' then
    raise exception 'Only employers can schedule interviews through this workflow';
  end if;

  select c.requirement_id into v_requirement_id
  from public.candidates c
  join public.requirements r on r.id = c.requirement_id
  where c.id = p_candidate_id
    and r.employer_id = auth.uid()
    and c.status in ('Client Submitted', 'Interview');

  if v_requirement_id is null then
    raise exception 'Candidate not found or not available for interview';
  end if;

  insert into public.interviews (
    requirement_id, candidate_id, interview_round, interview_date,
    interview_mode, meeting_link, interviewer_name, created_by
  ) values (
    v_requirement_id, p_candidate_id, trim(p_interview_round), p_interview_date,
    nullif(trim(p_interview_mode), ''), nullif(trim(p_meeting_link), ''),
    nullif(trim(p_interviewer_name), ''), auth.uid()
  ) returning id into v_interview_id;

  update public.candidates
  set status = 'Interview', updated_at = now()
  where id = p_candidate_id;

  insert into public.candidate_activities (candidate_id, actor_id, action, description)
  values (p_candidate_id, auth.uid(), 'interview_scheduled', 'Employer scheduled an interview');

  return v_interview_id;
end;
$$;

revoke all on function public.schedule_candidate_interview(uuid, text, timestamptz, text, text, text) from public;
grant execute on function public.schedule_candidate_interview(uuid, text, timestamptz, text, text, text) to authenticated;

commit;
