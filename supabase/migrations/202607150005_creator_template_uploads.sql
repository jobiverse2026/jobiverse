begin;

alter table public.marketplace_services add column if not exists asset_url text;
alter table public.marketplace_services add column if not exists asset_name text;
alter table public.marketplace_services add column if not exists is_editable boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-templates',
  'creator-templates',
  false,
  10485760,
  array[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Creators can upload templates" on storage.objects;
create policy "Creators can upload templates"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'creator-templates'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.current_user_role() = 'creator'
);

drop policy if exists "Creators can view own templates" on storage.objects;
create policy "Creators can view own templates"
on storage.objects for select to authenticated
using (
  bucket_id = 'creator-templates'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Creators can update own templates" on storage.objects;
create policy "Creators can update own templates"
on storage.objects for update to authenticated
using (bucket_id = 'creator-templates' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'creator-templates' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Creators can delete own templates" on storage.objects;
create policy "Creators can delete own templates"
on storage.objects for delete to authenticated
using (bucket_id = 'creator-templates' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
