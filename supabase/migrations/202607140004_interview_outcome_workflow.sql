begin;

create or replace function public.update_interview_outcome(
  p_interview_id uuid,
  p_status public.interview_status,
  p_feedback text default null,
  p_rating smallint default null,
  p_candidate_status public.candidate_status default null,
  p_rescheduled_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate_id uuid;
begin
  if public.current_user_role() not in ('recruiter', 'admin') then
    raise exception 'Only recruiters or admins can update interview outcomes';
  end if;

  select i.candidate_id into v_candidate_id
  from public.interviews i
  join public.requirements r on r.id = i.requirement_id
  where i.id = p_interview_id
    and (r.assigned_recruiter = auth.uid() or public.current_user_role() = 'admin');

  if v_candidate_id is null then
    raise exception 'Interview not found or access denied';
  end if;

  if p_rating is not null and (p_rating < 1 or p_rating > 5) then
    raise exception 'Rating must be between 1 and 5';
  end if;

  if p_status = 'rescheduled' and (p_rescheduled_date is null or p_rescheduled_date <= now()) then
    raise exception 'A future date is required when rescheduling';
  end if;

  if p_candidate_status in ('Selected', 'Rejected') and p_status <> 'completed' then
    raise exception 'Candidate selection decision requires a completed interview';
  end if;

  update public.interviews
  set status = p_status,
      feedback = nullif(trim(p_feedback), ''),
      rating = p_rating,
      interview_date = case when p_status = 'rescheduled' then p_rescheduled_date else interview_date end,
      updated_at = now()
  where id = p_interview_id;

  if p_candidate_status in ('Selected', 'Rejected') then
    update public.candidates
    set status = p_candidate_status, updated_at = now()
    where id = v_candidate_id;
  end if;

  insert into public.candidate_activities (candidate_id, actor_id, action, description, metadata)
  values (
    v_candidate_id,
    auth.uid(),
    'interview_outcome_updated',
    'Recruiter updated interview outcome',
    jsonb_build_object('interview_id', p_interview_id, 'status', p_status, 'candidate_status', p_candidate_status)
  );
end;
$$;

revoke all on function public.update_interview_outcome(uuid, public.interview_status, text, smallint, public.candidate_status, timestamptz) from public;
grant execute on function public.update_interview_outcome(uuid, public.interview_status, text, smallint, public.candidate_status, timestamptz) to authenticated;

commit;
