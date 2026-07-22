begin;

update public.ai_feature_registry
set
  status = 'coming_soon',
  updated_at = now()
where feature_key in (
  'resume_builder',
  'resume_analyzer',
  'ats_checker',
  'interview_preparation',
  'smart_candidate_matching',
  'career_coach'
);

commit;
