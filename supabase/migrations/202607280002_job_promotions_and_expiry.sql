begin;

alter table public.requirements
  add column if not exists expires_at timestamptz,
  add column if not exists is_promoted boolean not null default false,
  add column if not exists promoted_until timestamptz,
  add column if not exists promotion_tier text,
  add column if not exists promotion_payment_attempt_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'requirements_promotion_tier_check'
      and conrelid = 'public.requirements'::regclass
  ) then
    alter table public.requirements
      add constraint requirements_promotion_tier_check
      check (promotion_tier is null or promotion_tier in ('spotlight_30'));
  end if;
end $$;

create index if not exists requirements_public_promoted_idx
  on public.requirements (is_public, is_promoted, promoted_until desc)
  where is_public = true;

create index if not exists requirements_expiry_idx
  on public.requirements (expires_at)
  where expires_at is not null;

create or replace function public.sync_requirement_promotion_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.promoted_until is null or new.promoted_until <= now() then
    new.is_promoted := false;
    if new.promoted_until is not null and new.promoted_until <= now() then
      new.promotion_tier := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_requirement_promotion_state on public.requirements;
create trigger sync_requirement_promotion_state
before insert or update of promoted_until, is_promoted
on public.requirements
for each row execute function public.sync_requirement_promotion_state();

create or replace function public.sync_requirement_expiry()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(new.is_public, false) and new.expires_at is null then
    new.expires_at := coalesce(new.published_at, now()) + interval '45 days';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_requirement_expiry on public.requirements;
create trigger sync_requirement_expiry
before insert or update of is_public, published_at, expires_at
on public.requirements
for each row execute function public.sync_requirement_expiry();

update public.requirements
set expires_at = coalesce(published_at, created_at, now()) + interval '45 days'
where is_public = true and expires_at is null;

commit;
