begin;

create table if not exists public.referral_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  referral_code text not null unique,
  successful_referrals integer not null default 0 check (successful_referrals >= 0),
  reward_balance numeric(12,2) not null default 0 check (reward_balance >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(), referrer_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null, status text not null default 'signed_up' check(status in ('signed_up','qualified','rewarded','rejected')),
  reward_amount numeric(12,2) not null default 0 check(reward_amount >= 0), qualified_at timestamptz, rewarded_at timestamptz,
  created_at timestamptz not null default now(), unique(referrer_id,referred_user_id)
);
create table if not exists public.campus_partnership_enquiries (
  id uuid primary key default gen_random_uuid(), institution_name text not null, institution_type text not null,
  contact_name text not null, designation text, email text not null, phone text not null, city text not null,
  student_count integer, interests text[] not null default '{}', message text,
  status text not null default 'new' check(status in ('new','contacted','qualified','proposal_sent','partnered','closed')),
  admin_note text, assigned_to uuid references public.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id,created_at desc);
create index if not exists campus_enquiries_status_idx on public.campus_partnership_enquiries(status,created_at desc);

alter table public.referral_profiles enable row level security; alter table public.referrals enable row level security; alter table public.campus_partnership_enquiries enable row level security;
drop policy if exists "Users view own referral profile" on public.referral_profiles;
create policy "Users view own referral profile" on public.referral_profiles for select to authenticated using(user_id=auth.uid());
drop policy if exists "Participants view referrals" on public.referrals;
create policy "Participants view referrals" on public.referrals for select to authenticated using(referrer_id=auth.uid() or referred_user_id=auth.uid());
drop policy if exists "Public submits campus enquiry" on public.campus_partnership_enquiries;
create policy "Public submits campus enquiry" on public.campus_partnership_enquiries for insert to anon,authenticated with check(status='new' and assigned_to is null and admin_note is null);

create or replace function public.create_referral_identity() returns trigger language plpgsql security definer set search_path=public,auth as $$
declare code text; incoming text; owner_id uuid;
begin
  code := upper(substr(regexp_replace(coalesce(new.full_name,'JOBIVERSE'),'[^a-zA-Z]','','g'),1,4))||substr(replace(new.id::text,'-',''),1,6);
  insert into public.referral_profiles(user_id,referral_code) values(new.id,code) on conflict(user_id) do nothing;
  select nullif(trim(raw_user_meta_data->>'referral_code'),'') into incoming from auth.users where id=new.id;
  if incoming is not null then
    select user_id into owner_id from public.referral_profiles where upper(referral_code)=upper(incoming);
    if owner_id is not null and owner_id<>new.id then insert into public.referrals(referrer_id,referred_user_id,referral_code) values(owner_id,new.id,upper(incoming)) on conflict(referred_user_id) do nothing; end if;
  end if;
  return new;
end $$;
drop trigger if exists create_referral_identity_after_user on public.users;
create trigger create_referral_identity_after_user after insert on public.users for each row execute function public.create_referral_identity();
insert into public.referral_profiles(user_id,referral_code) select id,upper(substr(regexp_replace(coalesce(full_name,'JOBIVERSE'),'[^a-zA-Z]','','g'),1,4))||substr(replace(id::text,'-',''),1,6) from public.users on conflict(user_id) do nothing;
commit;
