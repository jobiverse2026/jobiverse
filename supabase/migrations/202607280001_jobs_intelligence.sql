-- JobiVerse Jobs Intelligence: saved searches, richer alerts and source monitoring.

alter table public.candidate_job_alert_preferences
  add column if not exists sectors text[],
  add column if not exists job_types text[],
  add column if not exists email_enabled boolean not null default true,
  add column if not exists in_app_enabled boolean not null default true;

create table if not exists public.candidate_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  query text,
  location text,
  sector text,
  source text not null default 'all',
  job_type text,
  work_mode text,
  freshness text,
  search_in text not null default 'role',
  radius text,
  is_alert_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.candidate_saved_searches enable row level security;
drop policy if exists "Candidates manage own saved searches" on public.candidate_saved_searches;
create policy "Candidates manage own saved searches"
on public.candidate_saved_searches for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.candidate_saved_searches to authenticated;
create index if not exists candidate_saved_searches_user_idx
  on public.candidate_saved_searches(user_id, updated_at desc);

create table if not exists public.job_source_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  status text not null check (status in ('healthy','degraded','down','not_configured')),
  response_ms integer,
  reported_jobs bigint not null default 0,
  error_message text,
  checked_at timestamptz not null default now()
);
alter table public.job_source_health_snapshots enable row level security;
revoke all on public.job_source_health_snapshots from public, anon, authenticated;
grant select, insert, update, delete on public.job_source_health_snapshots to service_role;
create index if not exists job_source_health_latest_idx
  on public.job_source_health_snapshots(source_name, checked_at desc);

-- Keep only a compact monitoring history per provider.
create or replace function public.trim_job_source_health_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.job_source_health_snapshots
  where source_name = new.source_name
    and id not in (
      select id from public.job_source_health_snapshots
      where source_name = new.source_name
      order by checked_at desc limit 30
    );
  return new;
end;
$$;
drop trigger if exists trim_job_source_health_history_trigger on public.job_source_health_snapshots;
create trigger trim_job_source_health_history_trigger
after insert on public.job_source_health_snapshots
for each row execute function public.trim_job_source_health_history();

-- Direct JobiVerse roles notify only candidates whose active preferences match.
create or replace function public.notify_requirement_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare publish_now boolean := false;
begin
  if tg_op = 'INSERT' then
    if new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    publish_now := coalesce(new.is_public,false);
  else
    if old.assigned_recruiter is distinct from new.assigned_recruiter and new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    publish_now := not coalesce(old.is_public,false) and coalesce(new.is_public,false);
    if old.status is distinct from new.status then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.employer_id,'requirement_status','Requirement updated',public.notification_actor_name() || ' updated ' || new.job_title || ' to ' || new.status::text || '.','/employers/requirements/' || new.id,new.id);
    end if;
  end if;

  if publish_now then
    insert into notifications(user_id,type,title,message,href,reference_id)
    select u.id,'job_published','Preferred opportunity: ' || new.job_title,
      public.notification_actor_name() || ' published a role matching your preferences: ' || new.job_title || '.',
      '/candidates/jobs/' || new.id,new.id
    from public.users u
    join public.candidate_profiles cp on cp.user_id=u.id
    left join public.candidate_job_alert_preferences ap on ap.user_id=u.id
    where u.role='candidate'
      and coalesce(ap.is_active,true)
      and (
        exists (
          select 1 from regexp_split_to_table(coalesce(nullif(ap.role_titles,''),cp.preferred_roles,''), '[,;/|]+') preference
          where length(trim(preference)) >= 2
            and concat_ws(' ',new.job_title,new.department,new.primary_skills) ilike '%' || trim(preference) || '%'
        )
        or (
          coalesce(ap.role_titles,'')=''
          and coalesce(cp.preferred_roles,'')=''
          and coalesce(cardinality(ap.sectors),0)>0
        )
      )
      and (
        coalesce(ap.locations,'')=''
        or exists (
          select 1 from regexp_split_to_table(ap.locations, '[,;/|]+') preference
          where (lower(trim(preference))='remote' and coalesce(new.work_mode,'') ilike '%remote%')
            or coalesce(new.location,'') ilike '%' || trim(preference) || '%'
        )
      )
      and (
        coalesce(cardinality(ap.work_modes),0)=0
        or exists (
          select 1 from unnest(ap.work_modes) preference
          where coalesce(new.work_mode,'') ilike '%' || preference || '%'
        )
      )
      and (
        coalesce(cardinality(ap.job_types),0)=0
        or exists (
          select 1 from unnest(ap.job_types) preference
          where coalesce(new.employment_type,'') ilike '%' || preference || '%'
        )
      )
      and (
        coalesce(cardinality(ap.sectors),0)=0
        or exists (
          select 1
          from unnest(ap.sectors) sector_slug
          cross join lateral regexp_split_to_table(replace(sector_slug,'-',' '), '[[:space:]]+') sector_token
          where length(sector_token) >= 3
            and concat_ws(' ',new.job_title,new.department,new.primary_skills) ilike '%' || sector_token || '%'
        )
      );
  end if;
  return new;
end;
$$;
