begin;

alter table public.marketplace_orders alter column service_id drop not null;
alter table public.marketplace_orders alter column provider_id drop not null;
alter table public.marketplace_orders add column if not exists provider_type text not null default 'creator' check (provider_type in ('creator','jobiverse'));
alter table public.marketplace_orders add column if not exists service_title text;
alter table public.marketplace_orders add column if not exists service_category text;

alter table public.marketplace_offers alter column service_id drop not null;
alter table public.marketplace_offers alter column provider_id drop not null;
alter table public.marketplace_offers add column if not exists provider_type text not null default 'creator' check (provider_type in ('creator','jobiverse'));
alter table public.marketplace_offers add column if not exists service_title text;
alter table public.marketplace_offers add column if not exists service_category text;

drop policy if exists "Customers can create orders" on public.marketplace_orders;
create policy "Customers can create orders"
on public.marketplace_orders for insert to authenticated
with check (
  customer_id = auth.uid()
  and (
    (provider_type = 'creator' and provider_id is not null and provider_id <> auth.uid())
    or (provider_type = 'jobiverse' and provider_id is null and service_id is null)
  )
);

drop policy if exists "Order participants can view orders" on public.marketplace_orders;
create policy "Order participants can view orders"
on public.marketplace_orders for select to authenticated
using (customer_id = auth.uid() or provider_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "Customers can create offers" on public.marketplace_offers;
create policy "Customers can create offers"
on public.marketplace_offers for insert to authenticated
with check (
  customer_id = auth.uid()
  and (
    (provider_type = 'creator' and provider_id is not null and provider_id <> auth.uid())
    or (provider_type = 'jobiverse' and provider_id is null and service_id is null)
  )
);

drop policy if exists "Offer participants can view offers" on public.marketplace_offers;
create policy "Offer participants can view offers"
on public.marketplace_offers for select to authenticated
using (customer_id = auth.uid() or provider_id = auth.uid() or public.current_user_role() = 'admin');

commit;
