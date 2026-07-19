begin;

-- RLS remains the row-level boundary. Remove unnecessary anonymous mutation
-- privileges at the table-grant layer as an additional production safeguard.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon;

revoke truncate, references, trigger
  on all tables in schema public from authenticated;

alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon;

alter default privileges in schema public
  revoke truncate, references, trigger on tables from authenticated;

-- PostgreSQL grants function execution to PUBLIC by default. Close that default
-- and explicitly expose only RPC entry points used by the application.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
  loop
    execute format('revoke execute on function %s from public, anon', fn.signature);
  end loop;
end $$;

do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in (
        'current_user_role',
        'get_or_create_support_conversation',
        'manage_candidate_placement',
        'mark_marketplace_messages_read',
        'mark_support_read',
        'reopen_marketplace_dispute',
        'request_creator_payout',
        'schedule_candidate_interview',
        'update_interview_outcome'
      )
  loop
    execute format('grant execute on function %s to authenticated', fn.signature);
  end loop;
end $$;

-- Anonymous visitors may increment aggregate marketplace view counters. The
-- function itself validates the published service and exposes no private rows.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='increment_marketplace_service_view'
  loop
    execute format('grant execute on function %s to anon, authenticated', fn.signature);
  end loop;
end $$;

-- Keep service-role maintenance functions explicit.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='cleanup_old_notifications'
  loop
    execute format('grant execute on function %s to service_role', fn.signature);
  end loop;
end $$;

commit;
