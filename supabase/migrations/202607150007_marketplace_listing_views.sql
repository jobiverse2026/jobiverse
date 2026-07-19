begin;

alter table public.marketplace_services add column if not exists view_count bigint not null default 0 check (view_count >= 0);
update public.marketplace_services set view_count = 0;

create or replace function public.increment_marketplace_service_view(service_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.marketplace_services
  set view_count = view_count + 1
  where slug = service_slug and status = 'published';
$$;

revoke all on function public.increment_marketplace_service_view(text) from public;
grant execute on function public.increment_marketplace_service_view(text) to anon, authenticated;

commit;
