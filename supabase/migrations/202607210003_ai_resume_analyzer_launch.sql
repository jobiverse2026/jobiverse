insert into public.ai_feature_registry (
  feature_key,
  name,
  description,
  audience,
  status,
  human_review_required,
  is_paid,
  disclaimer,
  model_provider,
  model_name,
  updated_at
)
values
  (
    'resume_analyzer',
    'AI Resume Analyzer',
    'AI-powered ATS estimate, keyword coverage, readability and impact feedback for uploaded resumes.',
    array['candidate','student'],
    'limited_beta',
    false,
    true,
    'Scores are guidance only and do not guarantee shortlisting, interview calls or hiring outcomes.',
    'OpenAI',
    'gpt-5.6-luna',
    now()
  ),
  (
    'ats_checker',
    'ATS Compatibility Checker',
    'Role-aligned resume readiness checks designed to improve parsing and keyword coverage.',
    array['candidate','student'],
    'coming_soon',
    false,
    true,
    'ATS feedback is an estimate and may differ from employer-specific screening systems.',
    'OpenAI',
    'gpt-5.6-luna',
    now()
  ),
  (
    'interview_intelligence',
    'AI Interview Preparation',
    'Mock interview practice, answer feedback and communication improvement support.',
    array['candidate','student'],
    'coming_soon',
    true,
    true,
    'Interview suggestions are coaching support, not a promise of selection.',
    'OpenAI',
    'gpt-5.6-luna',
    now()
  ),
  (
    'career_coach',
    'Career Coach AI',
    'Career planning, skill roadmap and job-search strategy support with clear human boundaries.',
    array['candidate','student'],
    'coming_soon',
    true,
    true,
    'Career guidance is informational and should be reviewed with human judgement.',
    'OpenAI',
    'gpt-5.6-luna',
    now()
  ),
  (
    'smart_matching',
    'Smart Candidate Matching',
    'AI-assisted matching between candidate profiles and employer requirements.',
    array['candidate','employer','recruiter'],
    'coming_soon',
    true,
    true,
    'Matching suggestions are assistive signals; final hiring decisions remain human-led.',
    'OpenAI',
    'gpt-5.6-luna',
    now()
  )
on conflict (feature_key) do update
set
  name = excluded.name,
  description = excluded.description,
  audience = excluded.audience,
  status = excluded.status,
  human_review_required = excluded.human_review_required,
  is_paid = excluded.is_paid,
  disclaimer = excluded.disclaimer,
  model_provider = excluded.model_provider,
  model_name = excluded.model_name,
  updated_at = now();
