alter table public.candidate_applications
  add column if not exists applicant_name text,
  add column if not exists applicant_email text,
  add column if not exists applicant_phone text,
  add column if not exists current_location text,
  add column if not exists total_experience text,
  add column if not exists current_company text,
  add column if not exists current_ctc text,
  add column if not exists expected_ctc text,
  add column if not exists notice_period text,
  add column if not exists interview_availability text,
  add column if not exists primary_skills text,
  add column if not exists linkedin text,
  add column if not exists resume_path text;

comment on table public.candidate_applications is 'Direct Jobs Portal applications with an immutable candidate-supplied snapshot at submission time.';
