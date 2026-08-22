create table if not exists public.custom_portal_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  requester_user_id uuid references public.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  organisation_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  industry text not null,
  company_size text,
  website text,
  selected_modules jsonb not null default '[]'::jsonb,
  custom_modules text,
  requirements text not null,
  expected_users text,
  integrations text,
  timeline text,
  budget_range text,
  callback_requested boolean not null default false,
  status text not null default 'new' check (status in ('new','contacted','discovery_scheduled','scoping','proposal_sent','accepted','in_development','delivered','closed')),
  admin_notes text,
  follow_up_at timestamptz,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists custom_portal_requests_status_idx on public.custom_portal_requests(status, created_at desc);
create index if not exists custom_portal_requests_industry_idx on public.custom_portal_requests(industry);
alter table public.custom_portal_requests enable row level security;
comment on table public.custom_portal_requests is 'Discovery briefs for bespoke organisation portals; writes are mediated by validated server actions.';
