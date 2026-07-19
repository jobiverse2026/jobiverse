-- JobiVerse production security audit (read-only)
-- Safe to run in Supabase SQL Editor. This script does not alter data or policies.

with findings as (
  select
    'CRITICAL'::text as severity,
    'RLS_DISABLED'::text as check_code,
    format('%I.%I', n.nspname, c.relname) as object_name,
    'Public table has Row Level Security disabled.'::text as finding
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r','p')
    and not c.relrowsecurity

  union all

  select
    'HIGH',
    'ANON_WRITE_GRANT',
    format('%I.%I', table_schema, table_name),
    format('anon role has %s privilege.', privilege_type)
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee = 'anon'
    and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','TRIGGER','REFERENCES')

  union all

  select
    'HIGH',
    'BROAD_WRITE_POLICY',
    format('%I.%I / %s', schemaname, tablename, policyname),
    format('Policy grants %s to %s with an unconditional expression.', cmd, array_to_string(roles, ','))
  from pg_policies
  where schemaname in ('public','storage')
    and cmd in ('INSERT','UPDATE','DELETE','ALL')
    and ('public' = any(roles) or 'anon' = any(roles))
    and (
      coalesce(trim(qual),'') in ('true','(true)')
      or coalesce(trim(with_check),'') in ('true','(true)')
    )

  union all

  select
    'MEDIUM',
    'BROAD_READ_POLICY',
    format('%I.%I / %s', schemaname, tablename, policyname),
    format('Policy grants public/anon SELECT with expression: %s', coalesce(qual,'<none>'))
  from pg_policies
  where schemaname in ('public','storage')
    and cmd in ('SELECT','ALL')
    and ('public' = any(roles) or 'anon' = any(roles))
    and coalesce(trim(qual),'') in ('true','(true)')

  union all

  select
    case when id='user-avatars' then 'MEDIUM' else 'HIGH' end,
    'PUBLIC_STORAGE_BUCKET',
    id,
    case when id='user-avatars'
      then 'Accepted public-read surface for profile images; uploads remain owner-scoped and file-restricted.'
      else 'Storage bucket is public. Confirm every object is intentionally internet-readable.'
    end
  from storage.buckets
  where public = true

  union all

  select
    'MEDIUM',
    'RLS_WITHOUT_POLICY',
    format('%I.%I', n.nspname, c.relname),
    'RLS is enabled but no policy exists; verify access is intentionally service-role only.'
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r','p')
    and c.relrowsecurity
    and not exists (
      select 1 from pg_policies p
      where p.schemaname = n.nspname and p.tablename = c.relname
    )

  union all

  select
    'HIGH',
    'SECURITY_DEFINER_SEARCH_PATH',
    format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)),
    'SECURITY DEFINER function does not pin search_path.'
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and not exists (
      select 1 from unnest(coalesce(p.proconfig, array[]::text[])) setting
      where setting like 'search_path=%'
    )

  union all

  select
    'MEDIUM',
    'PUBLIC_FUNCTION_EXECUTE',
    format('%I.%I(%s)', routine_schema, routine_name, specific_name),
    'Function is executable by PUBLIC; verify this is intentional.'
  from information_schema.routine_privileges
  where routine_schema = 'public'
    and grantee = 'PUBLIC'
    and privilege_type = 'EXECUTE'
)
select
  severity,
  check_code,
  object_name,
  finding,
  count(*) over (partition by severity) as findings_at_severity,
  case severity when 'CRITICAL' then 1 when 'HIGH' then 2 when 'MEDIUM' then 3 else 4 end as severity_order
from findings
order by severity_order, check_code, object_name;
