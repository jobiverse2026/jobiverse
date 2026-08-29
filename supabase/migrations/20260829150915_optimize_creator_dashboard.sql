create or replace function public.creator_dashboard_data()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', (
      select jsonb_build_object('full_name', u.full_name, 'role', u.role)
      from public.users as u
      where u.id = (select auth.uid())
    ),
    'listings', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.created_at desc)
      from (
        select id, title, slug, audience, price, status, total_orders, view_count,
               is_featured, featured_until, created_at
        from public.marketplace_services
        where provider_id = (select auth.uid())
      ) as s
    ), '[]'::jsonb),
    'orders', coalesce((
      select jsonb_agg(to_jsonb(o))
      from (
        select service_id, creator_earning as amount, status
        from public.marketplace_orders
        where provider_id = (select auth.uid())
      ) as o
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.creator_dashboard_data() from public, anon;
grant execute on function public.creator_dashboard_data() to authenticated;
