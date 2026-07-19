-- Notify candidates only when a newly published role matches their saved role preferences.
create or replace function public.notify_requirement_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  publish_now boolean := false;
begin
  if tg_op = 'INSERT' then
    if new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    publish_now := new.is_public;
  else
    if old.assigned_recruiter is distinct from new.assigned_recruiter and new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    publish_now := not coalesce(old.is_public,false) and new.is_public;
    if old.status is distinct from new.status then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.employer_id,'requirement_status','Requirement updated',public.notification_actor_name() || ' updated ' || new.job_title || ' to ' || new.status::text || '.','/employers/requirements/' || new.id,new.id);
    end if;
  end if;

  if publish_now then
    insert into notifications(user_id,type,title,message,href,reference_id)
    select u.id,'job_published','Preferred opportunity: ' || new.job_title,
      public.notification_actor_name() || ' published a role matching your preferences: ' || new.job_title || '.',
      '/candidates/jobs/' || new.id,new.id
    from public.users u
    join public.candidate_profiles cp on cp.user_id=u.id
    where u.role='candidate'
      and nullif(trim(cp.preferred_roles),'') is not null
      and exists (
        select 1
        from regexp_split_to_table(cp.preferred_roles, '[,;/|]+') preference
        where length(trim(preference)) >= 2
          and concat_ws(' ',new.job_title,new.department,new.primary_skills) ilike '%' || trim(preference) || '%'
      );
  end if;
  return new;
end;
$$;

comment on function public.notify_requirement_changes() is
  'Routes published-job notifications only to candidates whose preferred_roles match the role.';
