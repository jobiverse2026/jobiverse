begin;

alter table public.candidate_applications
  add column if not exists hired_annual_ctc numeric(14,2),
  add column if not exists joining_date date,
  add column if not exists success_fee_percentage numeric(5,2) not null default 3.00,
  add column if not exists success_fee_amount numeric(14,2),
  add column if not exists success_fee_status text not null default 'not_due';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'candidate_applications_success_fee_status_check'
      and conrelid = 'public.candidate_applications'::regclass
  ) then
    alter table public.candidate_applications
      add constraint candidate_applications_success_fee_status_check
      check (success_fee_status in ('not_due','due','invoiced','paid','waived'));
  end if;
end $$;

create index if not exists candidate_applications_success_fee_idx
  on public.candidate_applications(success_fee_status, applied_at desc)
  where success_fee_status <> 'not_due';

update public.candidate_applications
set success_fee_percentage = 3.00
where success_fee_percentage is distinct from 3.00;

commit;
