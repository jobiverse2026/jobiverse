begin;

create table if not exists public.marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.marketplace_services(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  customer_offer numeric(10,2) not null check (customer_offer > 0),
  creator_earning numeric(10,2) not null check (creator_earning >= 0),
  platform_margin numeric(10,2) not null check (platform_margin >= 0),
  counter_customer_amount numeric(10,2) check (counter_customer_amount is null or counter_customer_amount > 0),
  counter_creator_earning numeric(10,2) check (counter_creator_earning is null or counter_creator_earning >= 0),
  message text check (message is null or char_length(message) <= 1000),
  status text not null default 'pending' check (status in ('pending','countered','accepted','rejected','withdrawn','expired')),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> provider_id)
);

create index if not exists marketplace_offers_customer_idx on public.marketplace_offers(customer_id, created_at desc);
create index if not exists marketplace_offers_provider_idx on public.marketplace_offers(provider_id, created_at desc);
create unique index if not exists marketplace_one_active_offer_idx on public.marketplace_offers(service_id, customer_id) where status in ('pending','countered');

drop trigger if exists marketplace_offers_updated_at on public.marketplace_offers;
create trigger marketplace_offers_updated_at before update on public.marketplace_offers for each row execute function public.set_marketplace_updated_at();

alter table public.marketplace_offers enable row level security;

drop policy if exists "Offer participants can view offers" on public.marketplace_offers;
drop policy if exists "Customers can create offers" on public.marketplace_offers;
drop policy if exists "Offer participants can update offers" on public.marketplace_offers;

create policy "Offer participants can view offers" on public.marketplace_offers for select to authenticated using (customer_id = auth.uid() or provider_id = auth.uid());
create policy "Customers can create offers" on public.marketplace_offers for insert to authenticated with check (customer_id = auth.uid() and provider_id <> auth.uid());
create policy "Offer participants can update offers" on public.marketplace_offers for update to authenticated using (customer_id = auth.uid() or provider_id = auth.uid()) with check (customer_id = auth.uid() or provider_id = auth.uid());

grant select, insert, update on public.marketplace_offers to authenticated;

commit;
