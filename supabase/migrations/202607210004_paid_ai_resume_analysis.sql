begin;

create table if not exists public.ai_feature_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  feature_key text not null,
  payment_attempt_id uuid not null unique references public.payment_attempts(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'available' check (status in ('available','consumed','refunded')),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_feature_purchases_user_feature_idx
  on public.ai_feature_purchases(user_id, feature_key, status, created_at desc);

alter table public.ai_feature_purchases enable row level security;

drop policy if exists "Users can view own AI purchases" on public.ai_feature_purchases;
create policy "Users can view own AI purchases"
  on public.ai_feature_purchases
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

grant select on public.ai_feature_purchases to authenticated;

alter table public.payment_attempts drop constraint if exists payment_attempts_target_type_check;
alter table public.payment_attempts add constraint payment_attempts_target_type_check
  check (target_type in ('marketplace_order','marketplace_offer','resume_download','featured_listing','ai_resume_analysis'));

update public.ai_feature_registry
set
  status = case when status = 'coming_soon' then 'limited_beta' else status end,
  model_provider = 'Google Gemini',
  model_name = coalesce(nullif(model_name, ''), 'gemini-2.5-flash'),
  updated_at = now()
where feature_key = 'resume_analyzer';

update public.ai_feature_registry
set
  model_provider = coalesce(model_provider, 'Google Gemini'),
  model_name = coalesce(model_name, 'gemini-2.5-flash'),
  updated_at = now()
where feature_key <> 'resume_analyzer';

commit;
