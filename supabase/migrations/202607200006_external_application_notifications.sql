create or replace function public.notify_application_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.requirements%rowtype;
begin
  select * into req from public.requirements where id = new.requirement_id;

  if tg_op = 'INSERT' then
    if req.employer_id is not null then
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        req.employer_id,
        'application_received',
        'New direct applicant',
        public.notification_actor_name() || ' applied directly for ' || coalesce(req.job_title, 'a published role') || '.',
        '/employers/external-applicants/' || new.id,
        new.id
      );
    end if;

    insert into public.notifications(user_id,type,title,message,href,reference_id)
    select
      u.id,
      'external_application_new',
      'New external applicant',
      public.notification_actor_name() || ' applied directly for ' || coalesce(req.job_title, 'a published role') || '.',
      '/admin/candidates?source=external',
      new.id
    from public.users u
    where u.role = 'admin'
      and coalesce(u.is_active, true) = true;

  elsif old.status is distinct from new.status then
    insert into public.notifications(user_id,type,title,message,href,reference_id)
    values(
      new.candidate_user_id,
      'application_status',
      'Application updated',
      public.notification_actor_name() || ' updated your application for ' || coalesce(req.job_title, 'a published role') || ' to ' || new.status::text || '.',
      '/candidates/dashboard',
      new.id
    );

    insert into public.notifications(user_id,type,title,message,href,reference_id)
    select
      u.id,
      'external_application_update',
      'External applicant status changed',
      public.notification_actor_name() || ' updated a direct applicant for ' || coalesce(req.job_title, 'a published role') || ' to ' || new.status::text || '.',
      '/admin/candidates?source=external',
      new.id
    from public.users u
    where u.role = 'admin'
      and coalesce(u.is_active, true) = true;
  end if;

  return new;
end;
$$;

drop trigger if exists candidate_application_notifications on public.candidate_applications;
create trigger candidate_application_notifications
after insert or update of status on public.candidate_applications
for each row execute function public.notify_application_changes();
