insert into public.consultation_types(slug,title,description,audience,duration_minutes,price,sort_order,is_active) values
('career-discovery','Career Discovery Call','Clarify suitable career directions, immediate priorities and the next practical step with JobiVerse.',array['candidate'],45,499,10,true),
('resume-strategy','Resume Strategy Session','Review positioning, achievements, ATS readiness and the strongest plan for your next resume version.',array['candidate'],45,699,20,true),
('mock-interview','Personal Mock Interview','Complete a realistic interview with structured feedback and an improvement plan.',array['candidate'],60,999,30,true),
('employer-hiring','Employer Hiring Discovery','Discuss role clarity, sourcing challenges, hiring timelines and the right JobiVerse engagement model.',array['employer'],30,0,40,true),
('creator-onboarding','Creator Onboarding Call','Understand listing quality, pricing, delivery, safety and earnings before publishing services.',array['candidate','creator'],30,0,50,true)
on conflict(slug) do update set title=excluded.title,description=excluded.description,audience=excluded.audience,duration_minutes=excluded.duration_minutes,price=excluded.price,sort_order=excluded.sort_order,is_active=true;

grant select on public.consultation_types to anon,authenticated;
