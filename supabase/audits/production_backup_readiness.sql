-- JobiVerse production backup readiness audit (read-only).
-- Safe to run in the Supabase SQL Editor.

with report as (
  select 1 as section_order, 'DATABASE'::text as section, 'Public tables'::text as metric,
    count(*)::text as value, 'Tables requiring schema and data recovery.'::text as details
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')

  union all
  select 1, 'DATABASE', 'Estimated public rows', coalesce(sum(c.reltuples)::bigint,0)::text,
    'Planner estimate; use for backup growth monitoring.'
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')

  union all
  select 1, 'DATABASE', 'Public schema size', pg_size_pretty(coalesce(sum(pg_total_relation_size(c.oid)),0)::bigint),
    'Includes table data, indexes and TOAST.'
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')

  union all
  select 2, 'INTEGRITY', 'Foreign keys', count(*)::text,
    case when bool_and(convalidated) then 'All foreign-key constraints are validated.' else 'One or more foreign keys are not validated.' end
  from pg_constraint con join pg_namespace n on n.oid=con.connamespace
  where n.nspname='public' and con.contype='f'

  union all
  select 2, 'INTEGRITY', 'Invalid indexes', count(*)::text,
    case when count(*)=0 then 'No invalid public indexes detected.' else 'Rebuild invalid indexes before launch.' end
  from pg_index i join pg_class c on c.oid=i.indexrelid join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and not i.indisvalid

  union all
  select 3, 'LOGIC', 'Public functions', count(*)::text, 'Functions must be restored with schema migrations.'
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'

  union all
  select 3, 'LOGIC', 'Enabled public triggers', count(*)::text, 'Business workflow triggers currently enabled.'
  from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and not t.tgisinternal and t.tgenabled <> 'D'

  union all
  select 4, 'STORAGE', 'Storage buckets', count(*)::text,
    coalesce(string_agg(id, ', ' order by id), 'No buckets found')
  from storage.buckets

  union all
  select 4, 'STORAGE', 'Stored objects', count(*)::text,
    pg_size_pretty(coalesce(sum((metadata->>'size')::bigint),0)::bigint) || ' across all buckets'
  from storage.objects

  union all
  select 5, 'MIGRATIONS', 'Migration tracking table',
    case when to_regclass('supabase_migrations.schema_migrations') is null then 'Not available' else 'Available' end,
    case when to_regclass('supabase_migrations.schema_migrations') is null
      then 'Migrations were applied through SQL Editor; preserve the ordered repository migration files as the canonical history.'
      else 'Migration metadata exists; include its latest version in recovery evidence.'
    end
)
select section, metric, value, details
from report
order by section_order, section, metric;

-- Largest-table evidence is intentionally kept out of the final result grid.
-- Run the query below separately when detailed capacity analysis is required:
-- select format('%I.%I', n.nspname, c.relname) as table_name,
--   c.reltuples::bigint as estimated_rows,
--   pg_size_pretty(pg_total_relation_size(c.oid)) as total_size
-- from pg_class c join pg_namespace n on n.oid=c.relnamespace
-- where n.nspname='public' and c.relkind in ('r','p')
-- order by pg_total_relation_size(c.oid) desc limit 20;
