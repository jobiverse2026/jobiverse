alter table public.custom_portal_requests
  add column if not exists discovery_scheduled_at timestamptz,
  add column if not exists discovery_meeting_url text,
  add column if not exists discovery_notes text,
  add column if not exists scope_summary text,
  add column if not exists scope_deliverables jsonb not null default '[]'::jsonb,
  add column if not exists excluded_scope text,
  add column if not exists proposal_number text,
  add column if not exists setup_amount numeric(12,2),
  add column if not exists annual_amount numeric(12,2),
  add column if not exists tax_note text,
  add column if not exists estimated_start_date date,
  add column if not exists estimated_delivery_date date,
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists proposal_accepted_at timestamptz,
  add column if not exists uat_submitted_at timestamptz,
  add column if not exists uat_feedback text,
  add column if not exists uat_approved_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists production_url text,
  add column if not exists support_until date,
  add column if not exists employer_last_viewed_at timestamptz;

create table if not exists public.custom_portal_milestones (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_portal_requests(id) on delete cascade,
  title text not null,
  description text,
  sequence integer not null default 1,
  percentage numeric(5,2) check (percentage is null or (percentage >= 0 and percentage <= 100)),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  due_date date,
  status text not null default 'pending' check (status in ('pending','payment_due','paid','in_progress','completed','approved','waived')),
  payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  paid_at timestamptz,
  completed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(request_id, sequence)
);

create table if not exists public.custom_portal_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_portal_requests(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  update_type text not null default 'progress' check (update_type in ('system','discovery','scope','proposal','payment','progress','uat','delivery','support')),
  title text not null,
  message text,
  visible_to_employer boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_portal_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_portal_requests(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  category text not null check (category in ('brief','scope','proposal','design','uat','training','delivery','other')),
  title text not null,
  file_url text not null,
  visible_to_employer boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists custom_portal_milestones_request_idx on public.custom_portal_milestones(request_id, sequence);
create index if not exists custom_portal_updates_request_idx on public.custom_portal_updates(request_id, created_at desc);
create index if not exists custom_portal_files_request_idx on public.custom_portal_files(request_id, created_at desc);

alter table public.custom_portal_milestones enable row level security;
alter table public.custom_portal_updates enable row level security;
alter table public.custom_portal_files enable row level security;
revoke all on public.custom_portal_milestones, public.custom_portal_updates, public.custom_portal_files from anon, authenticated;
grant select, insert, update, delete on public.custom_portal_milestones, public.custom_portal_updates, public.custom_portal_files to service_role;

alter table public.payment_attempts drop constraint if exists payment_attempts_target_type_check;
alter table public.payment_attempts add constraint payment_attempts_target_type_check
  check(target_type in ('marketplace_order','marketplace_offer','resume_download','featured_listing','job_promotion','ai_resume_analysis','custom_portal_milestone'));

comment on table public.custom_portal_milestones is 'Commercial and delivery milestones for a bespoke JobiVerse operations portal.';
comment on table public.custom_portal_updates is 'Auditable employer-visible or internal project progress timeline.';
comment on table public.custom_portal_files is 'Links to approved scope, proposal, UAT, training and delivery artifacts.';
