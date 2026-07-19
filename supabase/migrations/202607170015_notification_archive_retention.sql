begin;

alter table public.notifications
  add column if not exists archived_at timestamptz;

create index if not exists notifications_active_user_created_idx
  on public.notifications(user_id, created_at desc)
  where archived_at is null;

create index if not exists notifications_archived_user_created_idx
  on public.notifications(user_id, created_at desc)
  where archived_at is not null;

-- Safe retention helper. Schedule this with Supabase Cron only when the owner
-- approves the final retention period.
create or replace function public.cleanup_old_notifications(
  active_retention_days integer default 180,
  archived_retention_days integer default 30
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  if active_retention_days < 30 or archived_retention_days < 7 then
    raise exception 'Notification retention periods are below the safe minimum.';
  end if;

  delete from public.notifications
  where (archived_at is null and created_at < now() - make_interval(days => active_retention_days))
     or (archived_at is not null and archived_at < now() - make_interval(days => archived_retention_days));

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_old_notifications(integer, integer) from public, anon, authenticated;
grant execute on function public.cleanup_old_notifications(integer, integer) to service_role;

commit;
