-- Repair public profiles for auth accounts retained across the development reset.
insert into public.users (id, email, full_name, role)
select
  id,
  coalesce(email, ''),
  raw_user_meta_data->>'full_name',
  case
    when raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    else 'candidate'::public.user_role
  end
from auth.users
on conflict (id) do update set
  email = excluded.email,
  full_name = coalesce(public.users.full_name, excluded.full_name);
