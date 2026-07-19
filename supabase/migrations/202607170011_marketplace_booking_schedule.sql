begin;
alter table public.marketplace_orders add column if not exists scheduled_at timestamptz, add column if not exists schedule_status text not null default 'not_required', add column if not exists schedule_proposed_by uuid references auth.users(id) on delete set null, add column if not exists schedule_note text, add column if not exists reschedule_count integer not null default 0;
alter table public.marketplace_orders drop constraint if exists marketplace_orders_schedule_status_check;
alter table public.marketplace_orders add constraint marketplace_orders_schedule_status_check check (schedule_status in ('not_required','awaiting_proposal','proposed','confirmed','completed','cancelled'));
alter table public.marketplace_orders drop constraint if exists marketplace_orders_reschedule_count_check;
alter table public.marketplace_orders add constraint marketplace_orders_reschedule_count_check check (reschedule_count between 0 and 20);
create index if not exists marketplace_orders_schedule_idx on public.marketplace_orders(scheduled_at) where scheduled_at is not null;
commit;
