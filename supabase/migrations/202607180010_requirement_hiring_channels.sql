begin;

alter table public.requirements
  add column if not exists hiring_team_requested boolean not null default false;

create index if not exists requirements_hiring_team_requested_idx
  on public.requirements(hiring_team_requested, created_at desc)
  where hiring_team_requested = true;

create or replace function public.notify_jobiverse_hiring_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.hiring_team_requested
     and (tg_op = 'INSERT' or not coalesce(old.hiring_team_requested, false)) then
    insert into public.notifications(user_id, type, title, message, href, reference_id)
    select id,
           'hiring_team_request',
           'New JobiVerse hiring mandate',
           public.notification_actor_name() || ' requested JobiVerse Hiring Team support for ' || new.job_title || '.',
           '/admin/requirements/' || new.id,
           new.id
      from public.users
     where role = 'admin' and is_active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists requirement_hiring_team_request_notification
  on public.requirements;
create trigger requirement_hiring_team_request_notification
after insert or update of hiring_team_requested on public.requirements
for each row execute function public.notify_jobiverse_hiring_request();

commit;
