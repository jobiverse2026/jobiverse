alter table public.marketplace_services
  add column if not exists creator_fit_reason text,
  add column if not exists creator_relevant_experience text;

alter table public.payment_attempts drop constraint if exists payment_attempts_target_type_check;
alter table public.payment_attempts add constraint payment_attempts_target_type_check
  check (target_type in ('marketplace_order','marketplace_offer','resume_download','featured_listing'));

comment on column public.marketplace_services.creator_fit_reason is
  'Creator-written explanation of why they are suitable for this service. Required by the app for new and edited listings.';

comment on column public.marketplace_services.creator_relevant_experience is
  'Creator-written relevant experience for this service or field. Required by the app for new and edited listings.';
