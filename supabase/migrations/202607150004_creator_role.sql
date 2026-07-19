begin;

alter type public.user_role add value if not exists 'creator';

commit;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' = 'employer' then 'employer'::public.user_role
    when new.raw_user_meta_data->>'role' = 'creator' then 'creator'::public.user_role
    else 'candidate'::public.user_role
  end;
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), requested_role)
  on conflict (id) do update set email = excluded.email, full_name = coalesce(public.users.full_name, excluded.full_name);
  return new;
end;
$$;

drop policy if exists "Users can publish own services" on public.marketplace_services;
create policy "Creators can publish own services"
on public.marketplace_services for insert to authenticated
with check (provider_id = auth.uid() and status = 'published' and public.current_user_role() = 'creator');
