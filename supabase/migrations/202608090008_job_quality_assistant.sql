alter table public.requirements
  add column if not exists quality_score integer,
  add column if not exists quality_grade text,
  add column if not exists quality_issues jsonb not null default '[]'::jsonb,
  add column if not exists quality_checked_at timestamptz;
alter table public.requirements drop constraint if exists requirements_quality_score_check;
alter table public.requirements add constraint requirements_quality_score_check check(quality_score is null or quality_score between 0 and 100);
create index if not exists requirements_quality_score_idx on public.requirements(quality_score) where is_public=true;
