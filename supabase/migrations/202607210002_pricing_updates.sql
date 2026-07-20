begin;

insert into public.platform_plans(slug,audience,name,description,price,billing_interval,features,sort_order)
values
  (
    'employer-seat',
    'employer',
    'Employer Seat',
    'One annual employer workspace seat for company users who manage requirements, reports and team visibility.',
    2000,
    'annual',
    '["Employer workspace access","Requirement management","Reports and exports","Company-level visibility as per assigned access"]',
    18
  ),
  (
    'recruiter-seat',
    'employer',
    'Recruiter Seat',
    'One annual recruiter workspace seat for assigned sourcing, candidate submissions and recruitment reports.',
    1000,
    'annual',
    '["Recruiter workspace access","Assigned requirement pipeline","Candidate submission tools","Recruiter performance reporting"]',
    19
  ),
  (
    'employer-talent-search',
    'employer',
    'Talent Search Access',
    'Search open-to-work JobiVerse talent with role, skill, location, salary and availability filters.',
    1999,
    'monthly',
    '["Open-to-work candidate discovery","Skills, location and salary filters","Shortlisted profile views","Contact unlock through JobiVerse team"]',
    25
  )
on conflict(slug) do update set
  name=excluded.name,
  description=excluded.description,
  price=excluded.price,
  billing_interval=excluded.billing_interval,
  features=excluded.features,
  sort_order=excluded.sort_order,
  is_active=true,
  updated_at=now();

update public.platform_plans
set
  name='Employer Growth',
  description='Operational hiring support for growing teams. Seats are billed separately: employer seats at INR 2,000/year and recruiter seats at INR 1,000/year.',
  features='["Priority requirement review","Hiring analytics","Consultation credit","Seat-based employer and recruiter access"]',
  updated_at=now()
where slug='employer-growth';

commit;
