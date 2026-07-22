begin;

insert into public.platform_plans(slug,audience,name,description,price,billing_interval,features,sort_order,is_active)
values
  (
    'career-free',
    'candidate',
    'Career Free',
    'Free JobiVerse talent account. Job discovery, applications and basic career tracking remain free.',
    0,
    'free',
    '["JobiVerse Card","Apply to public opportunities","Resume upload and profile management","Saved jobs and application tracker","Open to work toggle"]',
    10,
    true
  ),
  (
    'career-plus',
    'candidate',
    'Career Plus',
    'Optional career visibility and guidance layer for active professionals. Job access remains free.',
    199,
    'monthly',
    '["Advanced career score guidance","Profile completeness support","Priority job alerts","Application health tracker","Early access to future AI tools"]',
    20,
    true
  ),
  (
    'career-pro',
    'candidate',
    'Career Pro',
    'Higher-touch support for professionals preparing for interviews, role transitions and salary conversations.',
    499,
    'monthly',
    '["Everything in Career Plus","Monthly resume review credit","Interview preparation discount","Career guidance discount","Premium CV template discount"]',
    30,
    true
  ),
  (
    'fresher-pro-pack',
    'candidate',
    'Fresher Pro Pack',
    'One-time student and fresher readiness pack for first jobs, internships and campus interviews.',
    999,
    'custom',
    '["Fresher resume support","First job preparation roadmap","Project and portfolio guidance","Mock interview/campus interview direction","Internship application strategy"]',
    35,
    true
  ),
  (
    'employer-starter',
    'employer',
    'Employer Starter',
    'For small teams starting with JobiVerse. Submit roles and manage basic hiring without paid search access.',
    2999,
    'monthly',
    '["1 master employer account","2 employer seats","2 recruiter seats","5 active job requirements","Jobs portal posting","Basic applicant tracking","Basic reports"]',
    10,
    true
  ),
  (
    'employer-growth',
    'employer',
    'Employer Growth',
    'Main operating plan for SMEs with regular hiring and structured recruiter collaboration.',
    7999,
    'monthly',
    '["1 master employer account","5 employer seats","10 recruiter seats","20 active requirements","Candidate pipeline and interview calendar","Recruiter performance reports","Hiring funnel board","Priority support"]',
    20,
    true
  ),
  (
    'employer-enterprise',
    'employer',
    'Employer Enterprise',
    'Custom hiring platform access, reports, workflows and JobiVerse relationship management for larger teams.',
    0,
    'custom',
    '["Custom seats and departments","Dedicated JobiVerse account manager","Bulk hiring dashboard","Custom reports and workflows","SLA support","Custom commercial terms"]',
    30,
    true
  ),
  (
    'employer-talent-search',
    'employer',
    'Talent Search Access',
    'Paid locked access to search open-to-work JobiVerse profiles with hiring filters.',
    1999,
    'monthly',
    '["Open-to-work candidate discovery","Skills, location, salary and notice-period filters","JobiVerse Card views","Shortlisting support","Admin-approved access only"]',
    40,
    true
  ),
  (
    'employer-seat',
    'employer',
    'Extra Employer Seat',
    'Annual additional employer workspace seat for company users who manage requirements and reports.',
    2000,
    'annual',
    '["Employer workspace access","Requirement management","Reports and exports","Company-level visibility as per assigned access"]',
    50,
    true
  ),
  (
    'recruiter-seat',
    'employer',
    'Extra Recruiter Seat',
    'Annual additional recruiter workspace seat for sourcing, submissions and recruitment reports.',
    1000,
    'annual',
    '["Recruiter workspace access","Assigned requirement pipeline","Candidate submission tools","Recruiter performance reporting"]',
    60,
    true
  )
on conflict(slug) do update set
  audience = excluded.audience,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  billing_interval = excluded.billing_interval,
  features = excluded.features,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

commit;
