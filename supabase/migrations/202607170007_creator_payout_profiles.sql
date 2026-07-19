begin;

create table if not exists public.creator_payout_profiles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null unique references auth.users(id) on delete cascade,
  account_holder_name text not null check (char_length(trim(account_holder_name)) between 2 and 120),
  bank_name text not null check (char_length(trim(bank_name)) between 2 and 120),
  account_number text not null check (account_number ~ '^[0-9]{6,34}$'),
  ifsc_code text not null check (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  upi_id text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  admin_note text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_payout_profiles enable row level security;
drop policy if exists "Creators can view own payout profile" on public.creator_payout_profiles;
drop policy if exists "Creators can create own payout profile" on public.creator_payout_profiles;
drop policy if exists "Creators can update own payout profile" on public.creator_payout_profiles;
drop policy if exists "Admins can view payout profiles" on public.creator_payout_profiles;
drop policy if exists "Admins can verify payout profiles" on public.creator_payout_profiles;

create policy "Creators can view own payout profile" on public.creator_payout_profiles
for select to authenticated using (creator_id=auth.uid());
create policy "Creators can create own payout profile" on public.creator_payout_profiles
for insert to authenticated with check (creator_id=auth.uid() and public.current_user_role() in ('candidate','creator'));
create policy "Creators can update own payout profile" on public.creator_payout_profiles
for update to authenticated using (creator_id=auth.uid())
with check (creator_id=auth.uid() and status='pending' and verified_by is null and verified_at is null);
create policy "Admins can view payout profiles" on public.creator_payout_profiles
for select to authenticated using (public.current_user_role()='admin');
create policy "Admins can verify payout profiles" on public.creator_payout_profiles
for update to authenticated using (public.current_user_role()='admin')
with check (public.current_user_role()='admin');

grant select,insert,update on public.creator_payout_profiles to authenticated;

create or replace function public.set_creator_payout_profile_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists creator_payout_profile_updated_at on public.creator_payout_profiles;
create trigger creator_payout_profile_updated_at before update on public.creator_payout_profiles
for each row execute function public.set_creator_payout_profile_updated_at();

commit;
