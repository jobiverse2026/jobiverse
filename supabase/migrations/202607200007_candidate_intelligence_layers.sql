alter table public.candidate_profiles
  add column if not exists interview_availability text,
  add column if not exists deal_breakers text,
  add column if not exists career_wallet_notes text;

comment on column public.candidate_profiles.interview_availability is
  'Candidate supplied interview availability or preferred scheduling windows.';

comment on column public.candidate_profiles.deal_breakers is
  'Candidate non-negotiables used for deal-breaker matching, such as minimum CTC, location, work mode or shift limits.';

comment on column public.candidate_profiles.career_wallet_notes is
  'Optional candidate notes for career wallet assets, portfolio context or important career documents.';
