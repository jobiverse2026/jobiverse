begin;

create table if not exists public.marketplace_refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  payment_attempt_id uuid not null references public.payment_attempts(id) on delete restrict,
  amount numeric(10,2) not null check(amount>0),
  reason text not null check(char_length(trim(reason)) between 10 and 1000),
  status text not null default 'requested' check(status in ('requested','approved','gateway_pending','processed','rejected','failed')),
  gateway_refund_id text unique,
  gateway_status text,
  admin_note text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null
);

create unique index if not exists marketplace_refund_one_open_per_order on public.marketplace_refund_requests(order_id) where status in ('requested','approved','gateway_pending','processed');
create index if not exists marketplace_refund_status_idx on public.marketplace_refund_requests(status,requested_at);
alter table public.marketplace_refund_requests enable row level security;

drop policy if exists "Refund participants can view requests" on public.marketplace_refund_requests;
create policy "Refund participants can view requests" on public.marketplace_refund_requests for select to authenticated using(customer_id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Customers can request order refunds" on public.marketplace_refund_requests;
create policy "Customers can request order refunds" on public.marketplace_refund_requests for insert to authenticated with check(customer_id=auth.uid() and exists(select 1 from public.marketplace_orders o where o.id=order_id and o.customer_id=auth.uid() and o.status in ('paid','in_progress','delivered','revision_requested','completed')));
drop policy if exists "Admins can manage refund requests" on public.marketplace_refund_requests;
create policy "Admins can manage refund requests" on public.marketplace_refund_requests for update to authenticated using(public.current_user_role()='admin') with check(public.current_user_role()='admin');
grant select,insert,update on public.marketplace_refund_requests to authenticated;

create or replace function public.notify_refund_request() returns trigger language plpgsql security definer set search_path=public as $$
declare admin_user record;
begin
  if tg_op='INSERT' then
    for admin_user in select id from public.users where role='admin' loop
      insert into public.notifications(user_id,type,title,message,href,reference_id) values(admin_user.id,'refund_requested','New refund request',public.notification_actor_name() || ' requested a refund of ₹' || trim(to_char(new.amount,'FM999999990.00')) || '.','/admin/refunds',new.id);
    end loop;
  elsif old.status is distinct from new.status then
    insert into public.notifications(user_id,type,title,message,href,reference_id) values(new.customer_id,'refund_status','Refund ' || replace(new.status,'_',' '),'JobiVerse updated your refund request to ' || replace(new.status,'_',' ') || '.','/marketplace/orders/' || new.order_id,new.id);
  end if;
  return new;
end; $$;
drop trigger if exists marketplace_refund_notifications on public.marketplace_refund_requests;
create trigger marketplace_refund_notifications after insert or update of status on public.marketplace_refund_requests for each row execute function public.notify_refund_request();

commit;
