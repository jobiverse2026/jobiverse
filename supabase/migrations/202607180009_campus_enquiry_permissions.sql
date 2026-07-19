begin;

grant insert on table public.campus_partnership_enquiries to anon, authenticated;
grant select, update on table public.campus_partnership_enquiries to authenticated;

drop policy if exists "Public submits campus enquiry"
  on public.campus_partnership_enquiries;
create policy "Public submits campus enquiry"
  on public.campus_partnership_enquiries
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and assigned_to is null
    and admin_note is null
  );

drop policy if exists "Admins view campus enquiries"
  on public.campus_partnership_enquiries;
create policy "Admins view campus enquiries"
  on public.campus_partnership_enquiries
  for select
  to authenticated
  using (public.current_user_role() = 'admin');

drop policy if exists "Admins update campus enquiries"
  on public.campus_partnership_enquiries;
create policy "Admins update campus enquiries"
  on public.campus_partnership_enquiries
  for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

commit;
