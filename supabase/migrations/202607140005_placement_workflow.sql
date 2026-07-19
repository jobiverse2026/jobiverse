begin;

create or replace function public.manage_candidate_placement(
  p_candidate_id uuid,
  p_status public.placement_status,
  p_offered_ctc numeric default null,
  p_joining_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requirement public.requirements%rowtype;
  v_placement_id uuid;
  v_fee_percentage numeric(5,2);
  v_placement_fee numeric(14,2);
  v_gst numeric(14,2);
begin
  if public.current_user_role() not in ('recruiter', 'admin') then
    raise exception 'Only recruiters or admins can manage placements';
  end if;

  select r.* into v_requirement
  from public.candidates c
  join public.requirements r on r.id = c.requirement_id
  where c.id = p_candidate_id
    and (r.assigned_recruiter = auth.uid() or public.current_user_role() = 'admin')
    and c.status in ('Selected', 'Offered', 'Joined');

  if v_requirement.id is null then
    raise exception 'Candidate not found, not selected, or access denied';
  end if;

  if p_status in ('offered', 'accepted', 'joined') and (p_offered_ctc is null or p_offered_ctc <= 0) then
    raise exception 'A valid annual offered CTC is required';
  end if;

  if p_status = 'joined' and p_joining_date is null then
    raise exception 'Joining date is required';
  end if;

  v_fee_percentage := v_requirement.fee_percentage;
  if p_offered_ctc is not null and v_fee_percentage is not null then
    v_placement_fee := greatest(
      round(p_offered_ctc * v_fee_percentage / 100, 2),
      coalesce(v_requirement.minimum_fee, 0)
    );
    v_gst := round(v_placement_fee * 0.18, 2);
  end if;

  insert into public.placements (
    requirement_id, candidate_id, joining_date, offered_ctc,
    fee_percentage, placement_fee, gst_amount, replacement_end_date, status
  ) values (
    v_requirement.id, p_candidate_id, p_joining_date, p_offered_ctc,
    v_fee_percentage, v_placement_fee, v_gst,
    case when p_status = 'joined' then p_joining_date + v_requirement.replacement_days else null end,
    p_status
  )
  on conflict (candidate_id) do update set
    joining_date = coalesce(excluded.joining_date, placements.joining_date),
    offered_ctc = coalesce(excluded.offered_ctc, placements.offered_ctc),
    fee_percentage = coalesce(excluded.fee_percentage, placements.fee_percentage),
    placement_fee = coalesce(excluded.placement_fee, placements.placement_fee),
    gst_amount = coalesce(excluded.gst_amount, placements.gst_amount),
    replacement_end_date = coalesce(excluded.replacement_end_date, placements.replacement_end_date),
    status = excluded.status,
    updated_at = now()
  returning id into v_placement_id;

  update public.candidates
  set status = case
    when p_status in ('offered', 'accepted') then 'Offered'::public.candidate_status
    when p_status in ('joined', 'completed') then 'Joined'::public.candidate_status
    when p_status = 'no_show' then 'Withdrawn'::public.candidate_status
    else 'Selected'::public.candidate_status
  end,
  updated_at = now()
  where id = p_candidate_id;

  update public.requirements
  set status = case
    when p_status in ('offered', 'accepted') then 'Offer'::public.requirement_status
    when p_status in ('joined', 'completed') then 'Joined'::public.requirement_status
    else status
  end,
  updated_at = now()
  where id = v_requirement.id;

  insert into public.candidate_activities (candidate_id, actor_id, action, description, metadata)
  values (
    p_candidate_id, auth.uid(), 'placement_status_updated', 'Recruiter updated offer or placement status',
    jsonb_build_object('placement_id', v_placement_id, 'status', p_status, 'joining_date', p_joining_date)
  );

  return v_placement_id;
end;
$$;

revoke all on function public.manage_candidate_placement(uuid, public.placement_status, numeric, date) from public;
grant execute on function public.manage_candidate_placement(uuid, public.placement_status, numeric, date) to authenticated;

commit;
