-- Prevents public signups from granting themselves JobiVerse administrator access.
-- Existing legitimate admin accounts are intentionally preserved.

begin;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
  has_recruiter_invite boolean;
begin
  select exists (
    select 1
    from public.employer_team_invitations invitation
    where lower(invitation.invited_email) = lower(new.email)
      and invitation.role = 'recruiter'
      and invitation.status = 'pending'
      and invitation.expires_at > now()
  ) into has_recruiter_invite;

  requested_role := case
    when new.raw_user_meta_data->>'role' = 'recruiter' and has_recruiter_invite then 'recruiter'::public.user_role
    when new.raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    when new.raw_user_meta_data->>'role' = 'creator' then 'creator'::public.user_role
    else 'candidate'::public.user_role
  end;

  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    requested_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.users.full_name, excluded.full_name);

  return new;
end;
$$;

-- Authenticated users may edit presentation fields only. Role and activation
-- changes remain service-role/admin operations and cannot be self-assigned.
revoke update on table public.users from authenticated;
grant update (full_name, avatar_url) on table public.users to authenticated;

notify pgrst, 'reload schema';

commit;
