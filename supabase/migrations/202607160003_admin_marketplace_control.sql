begin;

create table if not exists public.marketplace_disputes (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  opened_by uuid not null references auth.users(id) on delete cascade, reason text not null check (char_length(reason) between 3 and 120),
  details text not null check (char_length(details) between 10 and 3000), status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  resolution text, resolved_by uuid references auth.users(id) on delete set null, resolved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists marketplace_disputes_status_idx on public.marketplace_disputes(status,created_at desc);
create index if not exists marketplace_disputes_order_idx on public.marketplace_disputes(order_id);
alter table public.marketplace_disputes enable row level security;
drop policy if exists "Participants can view disputes" on public.marketplace_disputes;
drop policy if exists "Participants can open disputes" on public.marketplace_disputes;
drop policy if exists "Admins can manage disputes" on public.marketplace_disputes;
create policy "Participants can view disputes" on public.marketplace_disputes for select to authenticated using (public.current_user_role()='admin' or exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
create policy "Participants can open disputes" on public.marketplace_disputes for insert to authenticated with check (opened_by=auth.uid() and exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
create policy "Admins can manage disputes" on public.marketplace_disputes for update to authenticated using (public.current_user_role()='admin') with check (public.current_user_role()='admin');
grant select,insert,update on public.marketplace_disputes to authenticated;

drop policy if exists "Published services are publicly visible" on public.marketplace_services;
create policy "Published services are publicly visible" on public.marketplace_services for select using (status='published' or provider_id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Providers can update own services" on public.marketplace_services;
create policy "Providers can update own services" on public.marketplace_services for update to authenticated using (provider_id=auth.uid() or public.current_user_role()='admin') with check (provider_id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Admins can update marketplace services" on public.marketplace_services;
create policy "Admins can update marketplace services" on public.marketplace_services for update to authenticated using (public.current_user_role()='admin') with check (public.current_user_role()='admin');
drop policy if exists "Admins can update marketplace orders" on public.marketplace_orders;
create policy "Admins can update marketplace orders" on public.marketplace_orders for update to authenticated using (public.current_user_role()='admin') with check (public.current_user_role()='admin');
drop policy if exists "Admins can update marketplace offers" on public.marketplace_offers;
create policy "Admins can update marketplace offers" on public.marketplace_offers for update to authenticated using (public.current_user_role()='admin') with check (public.current_user_role()='admin');
drop policy if exists "Admins can view order messages" on public.marketplace_order_messages;
create policy "Admins can view order messages" on public.marketplace_order_messages for select to authenticated using (public.current_user_role()='admin');
drop policy if exists "Admins can moderate reviews" on public.marketplace_reviews;
create policy "Admins can moderate reviews" on public.marketplace_reviews for delete to authenticated using (public.current_user_role()='admin');
grant delete on public.marketplace_reviews to authenticated;

drop trigger if exists marketplace_disputes_updated_at on public.marketplace_disputes;
create trigger marketplace_disputes_updated_at before update on public.marketplace_disputes for each row execute function public.set_marketplace_updated_at();

create or replace function public.notify_marketplace_order()
returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid;
begin
  if tg_op='INSERT' then
    if new.provider_id is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(new.provider_id,'order_created','New service order',public.notification_actor_name() || ' placed a new service order.','/earn-with-jobiverse/dashboard/orders/' || new.id,new.id); end if;
  elsif old.status is distinct from new.status then
    if public.current_user_role()='admin' then
      insert into notifications(user_id,type,title,message,href,reference_id) values(new.customer_id,'order_status','Order status updated',public.notification_actor_name() || ' updated your order to ' || replace(new.status,'_',' ') || '.','/marketplace/orders/' || new.id,new.id);
      if new.provider_id is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(new.provider_id,'order_status','Order status updated',public.notification_actor_name() || ' updated your order to ' || replace(new.status,'_',' ') || '.','/earn-with-jobiverse/dashboard/orders/' || new.id,new.id); end if;
    else
      recipient:=case when auth.uid()=new.customer_id then new.provider_id else new.customer_id end;
      if recipient is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(recipient,'order_status','Order status updated',public.notification_actor_name() || ' updated the order to ' || replace(new.status,'_',' ') || '.',case when recipient=new.provider_id then '/earn-with-jobiverse/dashboard/orders/' else '/marketplace/orders/' end || new.id,new.id); end if;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists marketplace_order_notifications on public.marketplace_orders;
create trigger marketplace_order_notifications after insert or update of status on public.marketplace_orders for each row execute function public.notify_marketplace_order();

commit;
