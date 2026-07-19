begin;

alter table public.candidate_profiles
  add column if not exists open_to_work boolean not null default false,
  add column if not exists job_search_status text not null default 'not_looking',
  add column if not exists role_level text,
  add column if not exists industry text,
  add column if not exists functional_area text,
  add column if not exists highest_education text,
  add column if not exists employment_type text,
  add column if not exists work_mode text,
  add column if not exists expected_salary_min numeric(12,2),
  add column if not exists expected_salary_max numeric(12,2),
  add column if not exists searchable_keywords text;

alter table public.candidate_profiles drop constraint if exists candidate_profiles_job_search_status_check;
alter table public.candidate_profiles add constraint candidate_profiles_job_search_status_check
  check (job_search_status in ('actively_looking','open_to_offers','not_looking'));

alter table public.candidate_profiles drop constraint if exists candidate_profiles_expected_salary_range_check;
alter table public.candidate_profiles add constraint candidate_profiles_expected_salary_range_check
  check (
    (expected_salary_min is null or expected_salary_min >= 0)
    and (expected_salary_max is null or expected_salary_max >= 0)
    and (expected_salary_min is null or expected_salary_max is null or expected_salary_max >= expected_salary_min)
  );

create index if not exists candidate_profiles_open_to_work_idx on public.candidate_profiles(open_to_work, updated_at desc);
create index if not exists candidate_profiles_search_filters_idx on public.candidate_profiles(role_level, industry, functional_area, work_mode, employment_type);

insert into public.platform_plans(slug,audience,name,description,price,billing_interval,features,sort_order)
values
('employer-talent-search','employer','Talent Search Access','Search open-to-work JobiVerse talent with role, skill, location, salary and availability filters.',4999,'monthly','["Open-to-work candidate discovery","Skills, location and salary filters","Shortlisted profile views","Contact unlock through JobiVerse team"]',25)
on conflict(slug) do update set
  name=excluded.name,
  description=excluded.description,
  price=excluded.price,
  billing_interval=excluded.billing_interval,
  features=excluded.features,
  sort_order=excluded.sort_order,
  is_active=true,
  updated_at=now();

commit;
