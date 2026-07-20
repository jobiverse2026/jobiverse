create table if not exists public.candidate_card_views (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  public_slug text not null,
  viewer_user_id uuid references public.users(id) on delete set null,
  viewer_role text,
  source text not null default 'public_card',
  created_at timestamptz not null default now()
);

create index if not exists candidate_card_views_candidate_idx on public.candidate_card_views(candidate_user_id, created_at desc);
create index if not exists candidate_card_views_slug_idx on public.candidate_card_views(public_slug, created_at desc);

alter table public.candidate_card_views enable row level security;

drop policy if exists candidate_card_views_insert_public on public.candidate_card_views;
create policy candidate_card_views_insert_public
on public.candidate_card_views for insert
to anon, authenticated
with check (true);

drop policy if exists candidate_card_views_owner_read on public.candidate_card_views;
create policy candidate_card_views_owner_read
on public.candidate_card_views for select
to authenticated
using (candidate_user_id = auth.uid() or public.current_user_role() = 'admin');

grant insert on public.candidate_card_views to anon, authenticated;
grant select on public.candidate_card_views to authenticated;
