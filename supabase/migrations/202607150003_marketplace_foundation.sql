begin;

create extension if not exists pgcrypto;

create table if not exists public.marketplace_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  slug text not null unique,
  audience text not null check (audience in ('professional', 'student', 'employer')),
  category text not null,
  short_description text not null check (char_length(short_description) between 20 and 240),
  description text not null check (char_length(description) between 40 and 4000),
  price numeric(10,2) not null check (price >= 0),
  delivery_days integer not null default 3 check (delivery_days between 1 and 90),
  delivery_mode text not null default 'online' check (delivery_mode in ('online', 'call', 'document', 'hybrid')),
  status text not null default 'published' check (status in ('published', 'paused', 'archived')),
  cover_url text,
  is_featured boolean not null default false,
  average_rating numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  total_orders integer not null default 0 check (total_orders >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.marketplace_services(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  provider_id uuid not null references auth.users(id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  requirements text,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'in_progress', 'delivered', 'completed', 'cancelled', 'refunded')),
  payment_reference text,
  paid_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> provider_id)
);

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.marketplace_orders(id) on delete cascade,
  service_id uuid not null references public.marketplace_services(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text check (review is null or char_length(review) between 3 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists marketplace_services_provider_idx on public.marketplace_services(provider_id);
create index if not exists marketplace_services_discovery_idx on public.marketplace_services(status, audience, category);
create index if not exists marketplace_orders_customer_idx on public.marketplace_orders(customer_id, created_at desc);
create index if not exists marketplace_orders_provider_idx on public.marketplace_orders(provider_id, created_at desc);
create index if not exists marketplace_reviews_service_idx on public.marketplace_reviews(service_id, created_at desc);

create or replace function public.set_marketplace_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketplace_services_updated_at on public.marketplace_services;
create trigger marketplace_services_updated_at
before update on public.marketplace_services
for each row execute function public.set_marketplace_updated_at();

drop trigger if exists marketplace_orders_updated_at on public.marketplace_orders;
create trigger marketplace_orders_updated_at
before update on public.marketplace_orders
for each row execute function public.set_marketplace_updated_at();

create or replace function public.refresh_marketplace_service_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_service uuid := coalesce(new.service_id, old.service_id);
begin
  update public.marketplace_services
  set average_rating = coalesce((select round(avg(rating)::numeric, 2) from public.marketplace_reviews where service_id = target_service), 0),
      review_count = (select count(*) from public.marketplace_reviews where service_id = target_service)
  where id = target_service;
  return coalesce(new, old);
end;
$$;

drop trigger if exists marketplace_review_metrics on public.marketplace_reviews;
create trigger marketplace_review_metrics
after insert or update or delete on public.marketplace_reviews
for each row execute function public.refresh_marketplace_service_metrics();

alter table public.marketplace_services enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.marketplace_reviews enable row level security;

drop policy if exists "Published services are publicly visible" on public.marketplace_services;
create policy "Published services are publicly visible"
on public.marketplace_services for select
using (status = 'published' or provider_id = auth.uid());

drop policy if exists "Users can publish own services" on public.marketplace_services;
create policy "Users can publish own services"
on public.marketplace_services for insert to authenticated
with check (provider_id = auth.uid() and status = 'published');

drop policy if exists "Providers can update own services" on public.marketplace_services;
create policy "Providers can update own services"
on public.marketplace_services for update to authenticated
using (provider_id = auth.uid())
with check (provider_id = auth.uid());

drop policy if exists "Providers can delete own services" on public.marketplace_services;
create policy "Providers can delete own services"
on public.marketplace_services for delete to authenticated
using (provider_id = auth.uid());

drop policy if exists "Order participants can view orders" on public.marketplace_orders;
create policy "Order participants can view orders"
on public.marketplace_orders for select to authenticated
using (customer_id = auth.uid() or provider_id = auth.uid());

drop policy if exists "Customers can create orders" on public.marketplace_orders;
create policy "Customers can create orders"
on public.marketplace_orders for insert to authenticated
with check (customer_id = auth.uid() and provider_id <> auth.uid());

drop policy if exists "Order participants can update orders" on public.marketplace_orders;
create policy "Order participants can update orders"
on public.marketplace_orders for update to authenticated
using (customer_id = auth.uid() or provider_id = auth.uid())
with check (customer_id = auth.uid() or provider_id = auth.uid());

drop policy if exists "Reviews are publicly visible" on public.marketplace_reviews;
create policy "Reviews are publicly visible"
on public.marketplace_reviews for select
using (true);

drop policy if exists "Customers can review completed orders" on public.marketplace_reviews;
create policy "Customers can review completed orders"
on public.marketplace_reviews for insert to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1 from public.marketplace_orders o
    where o.id = order_id
      and o.customer_id = auth.uid()
      and o.service_id = service_id
      and o.provider_id = provider_id
      and o.status = 'completed'
  )
);

grant select on public.marketplace_services to anon, authenticated;
grant insert, update, delete on public.marketplace_services to authenticated;
grant select, insert, update on public.marketplace_orders to authenticated;
grant select on public.marketplace_reviews to anon, authenticated;
grant insert on public.marketplace_reviews to authenticated;

commit;
