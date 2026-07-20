-- Adds separate employer/recruiter invite seats and makes company team invites role-specific.

begin;

alter table public.companies
  add column if not exists employer_seat_limit integer not null default 0 check (employer_seat_limit >= 0 and employer_seat_limit <= 500);

alter table public.employer_team_members
  drop constraint if exists employer_team_members_role_check;

update public.employer_team_members
set role = 'employer'
where role = 'manager';

alter table public.employer_team_members
  add constraint employer_team_members_role_check check (role in ('employer','recruiter'));

alter table public.employer_team_invitations
  drop constraint if exists employer_team_invitations_role_check;

update public.employer_team_invitations
set role = 'employer'
where role = 'manager';

alter table public.employer_team_invitations
  add constraint employer_team_invitations_role_check check (role in ('employer','recruiter'));

create index if not exists employer_team_members_company_role_status_idx
  on public.employer_team_members(company_id, role, status);

create index if not exists employer_team_invitations_company_role_status_idx
  on public.employer_team_invitations(company_id, role, status, expires_at);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' = 'admin' then 'admin'::public.user_role
    when new.raw_user_meta_data->>'role' = 'recruiter' then 'recruiter'::public.user_role
    when new.raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    when new.raw_user_meta_data->>'role' = 'creator' then 'creator'::public.user_role
    else 'candidate'::public.user_role
  end;

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), requested_role)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.users.full_name, excluded.full_name);

  return new;
end;
$$;

notify pgrst, 'reload schema';

commit;
