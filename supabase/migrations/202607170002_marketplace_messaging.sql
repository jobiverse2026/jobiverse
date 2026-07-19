begin;

alter table public.marketplace_order_messages add column if not exists read_at timestamptz;
alter table public.marketplace_order_messages add column if not exists updated_at timestamptz not null default now();
create index if not exists marketplace_messages_unread_idx on public.marketplace_order_messages(order_id,read_at,created_at desc);

create table if not exists public.marketplace_message_reports(
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.marketplace_order_messages(id) on delete cascade,
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check(char_length(trim(reason)) between 5 and 1000),
  status text not null default 'open' check(status in ('open','reviewing','resolved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  unique(message_id,reporter_id)
);
create index if not exists marketplace_message_reports_status_idx on public.marketplace_message_reports(status,created_at);
alter table public.marketplace_message_reports enable row level security;

drop policy if exists "Order participants can view messages" on public.marketplace_order_messages;
create policy "Order participants can view messages" on public.marketplace_order_messages for select to authenticated using(public.current_user_role()='admin' or exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
drop policy if exists "Order participants can update message reads" on public.marketplace_order_messages;
create policy "Order participants can update message reads" on public.marketplace_order_messages for update to authenticated using(public.current_user_role()='admin' or exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid()))) with check(public.current_user_role()='admin' or exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
grant update on public.marketplace_order_messages to authenticated;

drop policy if exists "Report participants can view reports" on public.marketplace_message_reports;
create policy "Report participants can view reports" on public.marketplace_message_reports for select to authenticated using(reporter_id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Participants can report messages" on public.marketplace_message_reports;
create policy "Participants can report messages" on public.marketplace_message_reports for insert to authenticated with check(reporter_id=auth.uid() and exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())) and exists(select 1 from public.marketplace_order_messages m where m.id=message_id and m.order_id=order_id and m.sender_id<>auth.uid()));
drop policy if exists "Admins can moderate message reports" on public.marketplace_message_reports;
create policy "Admins can moderate message reports" on public.marketplace_message_reports for update to authenticated using(public.current_user_role()='admin') with check(public.current_user_role()='admin');
grant select,insert,update on public.marketplace_message_reports to authenticated;

create or replace function public.mark_marketplace_messages_read(target_order uuid) returns integer language plpgsql security definer set search_path=public as $$
declare changed integer;
begin
  if not exists(select 1 from public.marketplace_orders o where o.id=target_order and (o.customer_id=auth.uid() or o.provider_id=auth.uid())) then raise exception 'Access denied'; end if;
  update public.marketplace_order_messages set read_at=coalesce(read_at,now()),updated_at=now() where order_id=target_order and sender_id<>auth.uid() and read_at is null;
  get diagnostics changed=row_count;return changed;
end; $$;
grant execute on function public.mark_marketplace_messages_read(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('marketplace-messages','marketplace-messages',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip','image/png','image/jpeg','text/plain']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Participants can upload message files" on storage.objects;
create policy "Participants can upload message files" on storage.objects for insert to authenticated with check(bucket_id='marketplace-messages' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.marketplace_orders o where o.id::text=(storage.foldername(name))[2] and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
drop policy if exists "Participants can view message files" on storage.objects;
create policy "Participants can view message files" on storage.objects for select to authenticated using(bucket_id='marketplace-messages' and (public.current_user_role()='admin' or exists(select 1 from public.marketplace_orders o where o.id::text=(storage.foldername(name))[2] and (o.customer_id=auth.uid() or o.provider_id=auth.uid()))));

create or replace function public.notify_order_message() returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid;
begin
  select case when new.sender_id=o.customer_id then o.provider_id else o.customer_id end into recipient from public.marketplace_orders o where o.id=new.order_id;
  if recipient is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(recipient,'order_message','New order message',public.notification_actor_name() || ' sent you a message.','/marketplace/orders/' || new.order_id || '/messages',new.id); end if;
  return new;
end; $$;

commit;
