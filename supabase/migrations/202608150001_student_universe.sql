begin;

alter table public.candidate_profiles add column if not exists career_stage text not null default 'professional';
alter table public.candidate_profiles drop constraint if exists candidate_profiles_career_stage_check;
alter table public.candidate_profiles add constraint candidate_profiles_career_stage_check check (career_stage in ('student','fresher','professional'));

alter table public.candidate_profiles add column if not exists college_name text;
alter table public.candidate_profiles add column if not exists degree text;
alter table public.candidate_profiles add column if not exists specialization text;
alter table public.candidate_profiles add column if not exists graduation_year integer;
alter table public.candidate_profiles add column if not exists current_semester text;
alter table public.candidate_profiles add column if not exists cgpa text;
alter table public.candidate_profiles add column if not exists github_url text;
alter table public.candidate_profiles add column if not exists languages text;
alter table public.candidate_profiles add column if not exists academic_projects text;
alter table public.candidate_profiles add column if not exists achievements text;
alter table public.candidate_profiles add column if not exists extracurricular_activities text;

alter table public.requirements add column if not exists target_audience text not null default 'all';
alter table public.requirements drop constraint if exists requirements_target_audience_check;
alter table public.requirements add constraint requirements_target_audience_check check (target_audience in ('all','experienced','freshers','students','internships'));

create index if not exists candidate_profiles_career_stage_idx on public.candidate_profiles(career_stage, updated_at desc);
create index if not exists requirements_target_audience_idx on public.requirements(target_audience, is_public, published_at desc);

commit;
