begin;

create table if not exists public.buyer_billing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  billing_name text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  gstin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_billing_name_length check (char_length(trim(billing_name)) between 2 and 120),
  constraint buyer_billing_pincode_format check (pincode ~ '^[1-9][0-9]{5}$'),
  constraint buyer_billing_gstin_format check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')
);

alter table public.buyer_billing_profiles enable row level security;

drop policy if exists "Users can view own billing profile" on public.buyer_billing_profiles;
create policy "Users can view own billing profile" on public.buyer_billing_profiles
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "Users can create own billing profile" on public.buyer_billing_profiles;
create policy "Users can create own billing profile" on public.buyer_billing_profiles
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can update own billing profile" on public.buyer_billing_profiles;
create policy "Users can update own billing profile" on public.buyer_billing_profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.buyer_billing_profiles to authenticated;

drop trigger if exists buyer_billing_profiles_updated_at on public.buyer_billing_profiles;
create trigger buyer_billing_profiles_updated_at
before update on public.buyer_billing_profiles
for each row execute function public.set_marketplace_updated_at();

commit;
