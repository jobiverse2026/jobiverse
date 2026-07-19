begin;

alter table public.marketplace_orders drop constraint if exists marketplace_orders_status_check;
alter table public.marketplace_orders add constraint marketplace_orders_status_check check (status in ('pending_payment','paid','in_progress','delivered','revision_requested','completed','cancelled','refunded'));
alter table public.marketplace_orders add column if not exists delivery_message text;
alter table public.marketplace_orders add column if not exists delivery_url text;
alter table public.marketplace_orders add column if not exists revision_message text;
alter table public.marketplace_orders add column if not exists revision_count integer not null default 0 check (revision_count >= 0);
alter table public.marketplace_orders add column if not exists max_revisions integer not null default 2 check (max_revisions between 0 and 10);
alter table public.marketplace_orders add column if not exists payout_status text not null default 'not_eligible' check (payout_status in ('not_eligible','eligible','processing','paid','held'));
alter table public.marketplace_orders add column if not exists payout_eligible_at timestamptz;

create table if not exists public.marketplace_order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 2000),
  attachment_url text,
  created_at timestamptz not null default now()
);
create index if not exists marketplace_order_messages_order_idx on public.marketplace_order_messages(order_id,created_at);
alter table public.marketplace_order_messages enable row level security;
drop policy if exists "Order participants can view messages" on public.marketplace_order_messages;
drop policy if exists "Order participants can send messages" on public.marketplace_order_messages;
create policy "Order participants can view messages" on public.marketplace_order_messages for select to authenticated using (exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
create policy "Order participants can send messages" on public.marketplace_order_messages for insert to authenticated with check (sender_id=auth.uid() and exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid()) and o.status not in ('cancelled','refunded')));
grant select,insert on public.marketplace_order_messages to authenticated;

create or replace function public.notify_marketplace_order()
returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid;
begin
  if tg_op='INSERT' then
    if new.provider_id is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(new.provider_id,'order_created','New service order',public.notification_actor_name() || ' placed a new service order.','/earn-with-jobiverse/dashboard/orders/' || new.id,new.id); end if;
  elsif old.status is distinct from new.status then
    recipient:=case when auth.uid()=new.customer_id then new.provider_id else new.customer_id end;
    if recipient is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(recipient,'order_status','Order status updated',public.notification_actor_name() || ' updated the order to ' || replace(new.status,'_',' ') || '.',case when recipient=new.provider_id then '/earn-with-jobiverse/dashboard/orders/' else '/marketplace/orders/' end || new.id,new.id); end if;
  end if;
  return new;
end; $$;
drop trigger if exists marketplace_order_notifications on public.marketplace_orders;
create trigger marketplace_order_notifications after insert or update of status on public.marketplace_orders for each row execute function public.notify_marketplace_order();

create or replace function public.notify_order_message() returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid;
begin
  select case when new.sender_id=o.customer_id then o.provider_id else o.customer_id end into recipient from public.marketplace_orders o where o.id=new.order_id;
  if recipient is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(recipient,'order_message','New order message',public.notification_actor_name() || ' sent you a message.',case when recipient=(select provider_id from public.marketplace_orders where id=new.order_id) then '/earn-with-jobiverse/dashboard/orders/' else '/marketplace/orders/' end || new.order_id,new.id); end if;
  return new;
end; $$;
drop trigger if exists marketplace_order_message_notifications on public.marketplace_order_messages;
create trigger marketplace_order_message_notifications after insert on public.marketplace_order_messages for each row execute function public.notify_order_message();

create or replace function public.notify_marketplace_review() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into notifications(user_id,type,title,message,href,reference_id) values(new.provider_id,'review_received','New service review',public.notification_actor_name() || ' rated your service ' || new.rating || ' stars.','/earn-with-jobiverse/dashboard/orders/' || new.order_id,new.id);
  return new;
end; $$;
drop trigger if exists marketplace_review_notifications on public.marketplace_reviews;
create trigger marketplace_review_notifications after insert on public.marketplace_reviews for each row execute function public.notify_marketplace_review();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('marketplace-deliveries','marketplace-deliveries',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip','image/png','image/jpeg']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Order participants can upload deliveries" on storage.objects;
drop policy if exists "Order participants can view deliveries" on storage.objects;
create policy "Order participants can upload deliveries" on storage.objects for insert to authenticated with check (bucket_id='marketplace-deliveries' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Order participants can view deliveries" on storage.objects for select to authenticated using (bucket_id='marketplace-deliveries' and exists(select 1 from public.marketplace_orders o where o.id::text=(storage.foldername(name))[2] and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));

create or replace function public.set_order_payout_eligibility() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.status is distinct from new.status and new.status='completed' then new.completed_at=coalesce(new.completed_at,now()); new.payout_status='eligible'; new.payout_eligible_at=now()+interval '7 days'; end if;
  return new;
end; $$;
drop trigger if exists marketplace_order_payout_eligibility on public.marketplace_orders;
create trigger marketplace_order_payout_eligibility before update of status on public.marketplace_orders for each row execute function public.set_order_payout_eligibility();

commit;
