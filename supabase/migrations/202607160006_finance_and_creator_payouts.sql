begin;

create table if not exists public.creator_payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'requested' check (status in ('requested','approved','paid','rejected')),
  payment_reference text,
  admin_note text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null
);

create table if not exists public.creator_payout_items (
  id uuid primary key default gen_random_uuid(),
  payout_request_id uuid not null references public.creator_payout_requests(id) on delete cascade,
  order_id uuid not null unique references public.marketplace_orders(id) on delete restrict,
  creator_earning numeric(10,2) not null check (creator_earning > 0)
);

create index if not exists creator_payout_requests_creator_idx on public.creator_payout_requests(creator_id,requested_at desc);
create index if not exists creator_payout_requests_status_idx on public.creator_payout_requests(status,requested_at);

alter table public.creator_payout_requests enable row level security;
alter table public.creator_payout_items enable row level security;

drop policy if exists "Creators and admins can view payout requests" on public.creator_payout_requests;
create policy "Creators and admins can view payout requests" on public.creator_payout_requests for select to authenticated
using (creator_id=auth.uid() or public.current_user_role()='admin');

drop policy if exists "Admins can update payout requests" on public.creator_payout_requests;
create policy "Admins can update payout requests" on public.creator_payout_requests for update to authenticated
using (public.current_user_role()='admin') with check (public.current_user_role()='admin');

drop policy if exists "Creators and admins can view payout items" on public.creator_payout_items;
create policy "Creators and admins can view payout items" on public.creator_payout_items for select to authenticated
using (public.current_user_role()='admin' or exists(select 1 from public.creator_payout_requests r where r.id=payout_request_id and r.creator_id=auth.uid()));

grant select on public.creator_payout_requests,public.creator_payout_items to authenticated;
grant update on public.creator_payout_requests to authenticated;

create or replace function public.request_creator_payout()
returns uuid language plpgsql security definer set search_path=public as $$
declare request_id uuid; total_amount numeric(10,2);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select coalesce(sum(creator_earning),0) into total_amount
  from public.marketplace_orders
  where provider_id=auth.uid() and status='completed' and payout_status='eligible' and payout_eligible_at<=now() and creator_earning>0;
  if total_amount<=0 then raise exception 'No earnings are currently available for payout'; end if;
  insert into public.creator_payout_requests(creator_id,amount) values(auth.uid(),total_amount) returning id into request_id;
  insert into public.creator_payout_items(payout_request_id,order_id,creator_earning)
  select request_id,id,creator_earning from public.marketplace_orders
  where provider_id=auth.uid() and status='completed' and payout_status='eligible' and payout_eligible_at<=now() and creator_earning>0;
  update public.marketplace_orders set payout_status='processing'
  where id in(select order_id from public.creator_payout_items where payout_request_id=request_id);
  return request_id;
end; $$;
grant execute on function public.request_creator_payout() to authenticated;

create or replace function public.notify_creator_payout_status() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.status is distinct from new.status then
    insert into public.notifications(user_id,type,title,message,href,reference_id)
    values(new.creator_id,'payout_status','Payout ' || replace(new.status,'_',' '),
      'JobiVerse updated your payout request of ₹' || trim(to_char(new.amount,'FM999999990.00')) || ' to ' || replace(new.status,'_',' ') || '.',
      '/earn-with-jobiverse/dashboard/earnings',new.id);
  end if;
  return new;
end; $$;
drop trigger if exists creator_payout_status_notification on public.creator_payout_requests;
create trigger creator_payout_status_notification after update of status on public.creator_payout_requests for each row execute function public.notify_creator_payout_status();

commit;
