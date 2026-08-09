alter table public.candidate_job_alert_preferences
  add column if not exists last_digest_sent_at timestamptz;

create index if not exists candidate_job_alert_digest_due_idx
  on public.candidate_job_alert_preferences(frequency, last_digest_sent_at)
  where is_active = true;

comment on column public.candidate_job_alert_preferences.last_digest_sent_at is
  'Last successful digest creation time; used for idempotent daily and weekly delivery.';
