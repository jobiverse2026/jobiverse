begin;

alter table public.marketplace_orders add column if not exists creator_earning numeric(10,2) check (creator_earning >= 0);
alter table public.marketplace_orders add column if not exists platform_margin numeric(10,2) check (platform_margin >= 0);

comment on column public.marketplace_services.price is 'Private creator earning requested for one completed sale; never expose directly on customer-facing pages.';
comment on column public.marketplace_orders.amount is 'Final customer-facing sale amount.';
comment on column public.marketplace_orders.creator_earning is 'Creator payout amount captured when the order is created.';
comment on column public.marketplace_orders.platform_margin is 'JobiVerse gross platform margin captured when the order is created.';

commit;
