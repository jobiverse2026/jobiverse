begin;
create table if not exists public.creator_availability (
  creator_id uuid primary key references auth.users(id) on delete cascade,
  available_days integer[] not null default array[1,2,3,4,5],
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  minimum_notice_hours integer not null default 2 check (minimum_notice_hours between 1 and 168),
  maximum_daily_bookings integer not null default 4 check (maximum_daily_bookings between 1 and 20),
  timezone text not null default 'Asia/Kolkata',
  is_accepting_bookings boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint creator_availability_days_check check (available_days <@ array[0,1,2,3,4,5,6] and cardinality(available_days)>0),
  constraint creator_availability_hours_check check (start_time < end_time)
);
alter table public.creator_availability enable row level security;
drop policy if exists "Anyone can view creator availability" on public.creator_availability;
create policy "Anyone can view creator availability" on public.creator_availability for select using (true);
drop policy if exists "Creators can create own availability" on public.creator_availability;
create policy "Creators can create own availability" on public.creator_availability for insert to authenticated with check (creator_id=auth.uid());
drop policy if exists "Creators can update own availability" on public.creator_availability;
create policy "Creators can update own availability" on public.creator_availability for update to authenticated using (creator_id=auth.uid()) with check (creator_id=auth.uid());
grant select on public.creator_availability to anon,authenticated;
grant insert,update on public.creator_availability to authenticated;
commit;
