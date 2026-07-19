begin;

drop policy if exists "Creators can publish own services" on public.marketplace_services;
drop policy if exists "Users can publish own services" on public.marketplace_services;
drop policy if exists "Authenticated users can publish own creator services" on public.marketplace_services;
create policy "Creators can publish own services"
on public.marketplace_services for insert to authenticated
with check (provider_id = auth.uid() and status = 'published' and public.current_user_role() in ('candidate', 'creator'));

drop policy if exists "Creators can upload templates" on storage.objects;
drop policy if exists "Authenticated creators can upload own templates" on storage.objects;
create policy "Creators can upload templates"
on storage.objects for insert to authenticated
with check (bucket_id = 'creator-templates' and (storage.foldername(name))[1] = auth.uid()::text and public.current_user_role() in ('candidate', 'creator'));

commit;
