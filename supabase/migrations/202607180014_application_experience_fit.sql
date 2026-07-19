alter table public.candidate_applications
  add column if not exists relevant_experience_years numeric(4,1),
  add column if not exists why_fit text;
alter table public.candidate_applications drop constraint if exists candidate_applications_relevant_experience_check;
alter table public.candidate_applications add constraint candidate_applications_relevant_experience_check check(relevant_experience_years is null or relevant_experience_years between 0 and 60);
