begin;

-- Repair development orders marked paid without a real payout request.
update public.marketplace_orders o
set payout_status = 'eligible',
    payout_eligible_at = coalesce(o.payout_eligible_at, o.completed_at + interval '7 days')
where o.status = 'completed'
  and o.payout_status = 'paid'
  and not exists (
    select 1
    from public.creator_payout_items i
    join public.creator_payout_requests r on r.id = i.payout_request_id
    where i.order_id = o.id and r.status = 'paid'
  );

create or replace function public.notify_admin_order_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user record;
  creator_name text;
begin
  if old.status is distinct from new.status and new.status = 'completed' then
    select coalesce(nullif(trim(full_name), ''), email, 'A creator')
      into creator_name
    from public.users
    where id = new.provider_id;

    for admin_user in select id from public.users where role = 'admin' loop
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        admin_user.id,
        'order_completed',
        'Marketplace order completed',
        coalesce(creator_name, 'A creator') || ' completed an order. Creator earning is now in the protection period.',
        '/admin/marketplace',
        new.id
      );
    end loop;

    if new.provider_id is not null then
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        new.provider_id,
        'payout_clearing',
        'Earning is now clearing',
        'Your earning will become available for payout after the 7-day protection period.',
        '/earn-with-jobiverse/dashboard/earnings',
        new.id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists marketplace_order_completion_admin_notification on public.marketplace_orders;
create trigger marketplace_order_completion_admin_notification
after update of status on public.marketplace_orders
for each row execute function public.notify_admin_order_completion();

create or replace function public.notify_admin_payout_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user record;
  creator_name text;
begin
  select coalesce(nullif(trim(full_name), ''), email, 'A creator')
    into creator_name
  from public.users
  where id = new.creator_id;

  for admin_user in select id from public.users where role = 'admin' loop
    insert into public.notifications(user_id,type,title,message,href,reference_id)
    values(
      admin_user.id,
      'payout_requested',
      'New creator payout request',
      coalesce(creator_name, 'A creator') || ' requested a payout of ₹' || trim(to_char(new.amount,'FM999999990.00')) || '.',
      '/admin/finance',
      new.id
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists creator_payout_admin_notification on public.creator_payout_requests;
create trigger creator_payout_admin_notification
after insert on public.creator_payout_requests
for each row execute function public.notify_admin_payout_request();

-- Backfill the notification for already-completed development orders once.
insert into public.notifications(user_id,type,title,message,href,reference_id)
select
  admin_user.id,
  'order_completed',
  'Marketplace order completed',
  coalesce(nullif(trim(creator.full_name), ''), creator.email, 'A creator') ||
    ' completed an order. Creator earning is now in the protection period.',
  '/admin/marketplace',
  orders.id
from public.marketplace_orders orders
cross join public.users admin_user
left join public.users creator on creator.id = orders.provider_id
where orders.status = 'completed'
  and admin_user.role = 'admin'
  and not exists (
    select 1 from public.notifications existing
    where existing.user_id = admin_user.id
      and existing.type = 'order_completed'
      and existing.reference_id = orders.id
  );

commit;
