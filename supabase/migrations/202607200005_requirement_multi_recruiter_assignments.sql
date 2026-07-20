create table if not exists public.requirement_recruiter_assignments (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  recruiter_id uuid not null references public.users(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(requirement_id, recruiter_id)
);

create index if not exists requirement_recruiter_assignments_requirement_idx
  on public.requirement_recruiter_assignments(requirement_id);

create index if not exists requirement_recruiter_assignments_recruiter_idx
  on public.requirement_recruiter_assignments(recruiter_id);

alter table public.requirement_recruiter_assignments enable row level security;

drop policy if exists requirement_recruiter_assignments_read on public.requirement_recruiter_assignments;
create policy requirement_recruiter_assignments_read
on public.requirement_recruiter_assignments
for select to authenticated
using (
  recruiter_id = auth.uid()
  or public.current_user_role() = 'admin'
  or exists (
    select 1
    from public.requirements r
    where r.id = requirement_recruiter_assignments.requirement_id
      and r.employer_id = auth.uid()
  )
  or exists (
    select 1
    from public.requirements r
    join public.companies c on c.id = r.company_id
    where r.id = requirement_recruiter_assignments.requirement_id
      and c.owner_id = auth.uid()
  )
);

create or replace function public.notify_application_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare req public.requirements%rowtype;
begin
  select * into req from public.requirements where id = new.requirement_id;
  if tg_op = 'INSERT' then
    insert into notifications(user_id,type,title,message,href,reference_id)
    values(req.employer_id,'application_received','New candidate application',public.notification_actor_name() || ' applied for ' || req.job_title || '.','/employers/candidates',new.id);

    insert into notifications(user_id,type,title,message,href,reference_id)
    select distinct recruiter_id,'application_received','New candidate application',public.notification_actor_name() || ' applied for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id
    from public.requirement_recruiter_assignments
    where requirement_id = req.id;

    if req.assigned_recruiter is not null and not exists (
      select 1 from public.requirement_recruiter_assignments existing
      where existing.requirement_id = req.id and existing.recruiter_id = req.assigned_recruiter
    ) then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(req.assigned_recruiter,'application_received','New candidate application',public.notification_actor_name() || ' applied for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id);
    end if;
  elsif old.status is distinct from new.status then
    insert into notifications(user_id,type,title,message,href,reference_id)
    values(new.candidate_user_id,'application_status','Application updated',public.notification_actor_name() || ' updated your application for ' || req.job_title || ' to ' || new.status::text || '.','/candidates/dashboard',new.id);
  end if;
  return new;
end; $$;

drop trigger if exists candidate_application_notifications on public.candidate_applications;
create trigger candidate_application_notifications
after insert or update of status on public.candidate_applications
for each row execute function public.notify_application_changes();

create or replace function public.notify_interview_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_user uuid; req public.requirements%rowtype;
begin
  select user_id into candidate_user from public.candidates where id = new.candidate_id;
  select * into req from public.requirements where id = new.requirement_id;
  if candidate_user is not null then
    insert into notifications(user_id,type,title,message,href,reference_id)
    values(candidate_user,'interview_update',case when tg_op='INSERT' then 'Interview scheduled' else 'Interview updated' end,public.notification_actor_name() || case when tg_op='INSERT' then ' scheduled' else ' updated' end || ' your ' || new.interview_round || ' interview for ' || req.job_title || '.','/candidates/dashboard',new.id);
  end if;

  if tg_op = 'INSERT' then
    insert into notifications(user_id,type,title,message,href,reference_id)
    select distinct recruiter_id,'interview_scheduled','Interview scheduled',public.notification_actor_name() || ' scheduled an interview for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id
    from public.requirement_recruiter_assignments
    where requirement_id = req.id and recruiter_id is distinct from new.created_by;

    if req.assigned_recruiter is not null and req.assigned_recruiter is distinct from new.created_by and not exists (
      select 1 from public.requirement_recruiter_assignments existing
      where existing.requirement_id = req.id and existing.recruiter_id = req.assigned_recruiter
    ) then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(req.assigned_recruiter,'interview_scheduled','Interview scheduled',public.notification_actor_name() || ' scheduled an interview for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id);
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists interview_notifications on public.interviews;
create trigger interview_notifications
after insert or update of status,interview_date on public.interviews
for each row execute function public.notify_interview_changes();
