begin;

create or replace function public.refresh_marketplace_order_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_service_id uuid := coalesce(new.service_id, old.service_id);
begin
  update public.marketplace_services
  set total_orders = (
    select count(*)::integer
    from public.marketplace_orders
    where service_id = target_service_id
      and status not in ('cancelled', 'refunded')
  )
  where id = target_service_id;

  if tg_op = 'UPDATE' and old.service_id is distinct from new.service_id then
    update public.marketplace_services
    set total_orders = (
      select count(*)::integer
      from public.marketplace_orders
      where service_id = old.service_id
        and status not in ('cancelled', 'refunded')
    )
    where id = old.service_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists marketplace_order_metrics on public.marketplace_orders;
create trigger marketplace_order_metrics
after insert or update of status, service_id or delete on public.marketplace_orders
for each row execute function public.refresh_marketplace_order_metrics();

update public.marketplace_services service
set total_orders = (
  select count(*)::integer
  from public.marketplace_orders orders
  where orders.service_id = service.id
    and orders.status not in ('cancelled', 'refunded')
);

commit;
