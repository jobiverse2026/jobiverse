alter table public.candidate_applications
  add column if not exists withdrawal_reason text,
  add column if not exists withdrawal_note text,
  add column if not exists withdrawn_at timestamptz;

alter table public.notification_preferences
  add column if not exists interview_reminder_hours integer[] not null default array[24, 2],
  add column if not exists interview_reminders_enabled boolean not null default true;

alter table public.push_subscriptions
  add column if not exists device_name text,
  add column if not exists quiet_hours_start time,
  add column if not exists quiet_hours_end time,
  add column if not exists timezone text not null default 'Asia/Kolkata',
  add column if not exists categories text[] not null default array['jobs','recruitment','marketplace','payments','messages'];

create table if not exists public.talent_folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, name)
);

create table if not exists public.talent_folder_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.talent_folders(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  application_id uuid references public.candidate_applications(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  check ((candidate_id is not null)::int + (application_id is not null)::int = 1)
);

create unique index if not exists talent_folder_candidate_unique on public.talent_folder_items(folder_id,candidate_id) where candidate_id is not null;
create unique index if not exists talent_folder_application_unique on public.talent_folder_items(folder_id,application_id) where application_id is not null;
alter table public.talent_folders enable row level security;
alter table public.talent_folder_items enable row level security;
drop policy if exists "Owners manage talent folders" on public.talent_folders;
create policy "Owners manage talent folders" on public.talent_folders for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "Owners manage talent folder items" on public.talent_folder_items;
create policy "Owners manage talent folder items" on public.talent_folder_items for all to authenticated
using(exists(select 1 from public.talent_folders f where f.id=folder_id and f.owner_id=auth.uid()))
with check(exists(select 1 from public.talent_folders f where f.id=folder_id and f.owner_id=auth.uid()));
grant select,insert,update,delete on public.talent_folders,public.talent_folder_items to authenticated;
