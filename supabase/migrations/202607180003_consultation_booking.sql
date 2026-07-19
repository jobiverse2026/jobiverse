begin;

create table if not exists public.consultation_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  audience text[] not null default array['candidate']::text[],
  duration_minutes integer not null check (duration_minutes between 15 and 180),
  price numeric(12,2) not null default 0 check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  consultation_type_id uuid not null references public.consultation_types(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  marketplace_order_id uuid unique references public.marketplace_orders(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 15 and 180),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  goals text not null check (char_length(trim(goals)) between 20 and 2000),
  status text not null default 'requested' check (status in ('pending_payment','requested','confirmed','completed','cancelled','no_show')),
  payment_status text not null default 'not_required' check (payment_status in ('not_required','pending','paid','refunded')),
  meeting_link text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scheduled_at)
);

create index if not exists consultation_bookings_user_idx on public.consultation_bookings(user_id, scheduled_at desc);
create index if not exists consultation_bookings_status_idx on public.consultation_bookings(status, scheduled_at);

alter table public.consultation_types enable row level security;
alter table public.consultation_bookings enable row level security;

drop policy if exists "Anyone can view active consultations" on public.consultation_types;
create policy "Anyone can view active consultations" on public.consultation_types for select using (is_active or public.current_user_role() = 'admin');

drop policy if exists "Users can create own consultation bookings" on public.consultation_bookings;
create policy "Users can create own consultation bookings" on public.consultation_bookings for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can view own consultation bookings" on public.consultation_bookings;
create policy "Users can view own consultation bookings" on public.consultation_bookings for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');

grant select on public.consultation_types to public, anon, authenticated;
grant select, insert on public.consultation_bookings to authenticated;
grant all on public.consultation_types, public.consultation_bookings to service_role;

insert into public.consultation_types(slug,title,description,audience,duration_minutes,price,sort_order) values
('career-discovery','Career Discovery Call','Clarify suitable career directions, immediate priorities and the next practical step with JobiVerse.',array['candidate'],45,499,10),
('resume-strategy','Resume Strategy Session','Review positioning, achievements, ATS readiness and the strongest plan for your next resume version.',array['candidate'],45,699,20),
('mock-interview','Personal Mock Interview','Complete a realistic interview with structured feedback and an improvement plan.',array['candidate'],60,999,30),
('employer-hiring','Employer Hiring Discovery','Discuss role clarity, sourcing challenges, hiring timelines and the right JobiVerse engagement model.',array['employer'],30,0,40),
('creator-onboarding','Creator Onboarding Call','Understand listing quality, pricing, delivery, safety and earnings before publishing services.',array['candidate','creator'],30,0,50)
on conflict(slug) do update set title=excluded.title,description=excluded.description,audience=excluded.audience,duration_minutes=excluded.duration_minutes,price=excluded.price,sort_order=excluded.sort_order;

commit;
