begin;

alter table public.marketplace_order_messages add column if not exists attachment_name text;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('user-avatars','user-avatars',true,5242880,array['image/png','image/jpeg','image/webp']) on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Users upload own avatars" on storage.objects;
create policy "Users upload own avatars" on storage.objects for insert to authenticated with check(bucket_id='user-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars" on storage.objects for update to authenticated using(bucket_id='user-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='user-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Public avatar viewing" on storage.objects;
create policy "Public avatar viewing" on storage.objects for select to public using(bucket_id='user-avatars');

drop policy if exists "Users can update own account profile" on public.users;
create policy "Users can update own account profile" on public.users for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
grant update(full_name,avatar_url) on public.users to authenticated;

commit;
