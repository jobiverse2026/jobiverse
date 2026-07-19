begin;
alter table public.marketplace_disputes add column if not exists category text not null default 'service_quality' check (category in ('service_quality','delivery_delay','payment','scope','communication','refund','other'));
alter table public.marketplace_disputes add column if not exists evidence_url text;
alter table public.marketplace_disputes add column if not exists priority text not null default 'normal' check (priority in ('normal','high','urgent'));
alter table public.marketplace_disputes add column if not exists reopened_count integer not null default 0 check (reopened_count between 0 and 3);
create table if not exists public.marketplace_dispute_events(id uuid primary key default gen_random_uuid(),dispute_id uuid not null references public.marketplace_disputes(id) on delete cascade,actor_id uuid references auth.users(id) on delete set null,event_type text not null,message text not null,created_at timestamptz not null default now());
create index if not exists marketplace_dispute_events_idx on public.marketplace_dispute_events(dispute_id,created_at);
alter table public.marketplace_dispute_events enable row level security;
drop policy if exists "Participants can view dispute events" on public.marketplace_dispute_events;
create policy "Participants can view dispute events" on public.marketplace_dispute_events for select to authenticated using (public.current_user_role()='admin' or exists(select 1 from public.marketplace_disputes d join public.marketplace_orders o on o.id=d.order_id where d.id=dispute_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())));
grant select on public.marketplace_dispute_events to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('marketplace-disputes','marketplace-disputes',false,10485760,array['application/pdf','image/png','image/jpeg','application/zip']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Participants can upload dispute evidence" on storage.objects;
drop policy if exists "Participants can view dispute evidence" on storage.objects;
create policy "Participants can upload dispute evidence" on storage.objects for insert to authenticated with check(bucket_id='marketplace-disputes' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Participants can view dispute evidence" on storage.objects for select to authenticated using(bucket_id='marketplace-disputes' and (public.current_user_role()='admin' or exists(select 1 from public.marketplace_disputes d join public.marketplace_orders o on o.id=d.order_id where d.id::text=(storage.foldername(name))[2] and (o.customer_id=auth.uid() or o.provider_id=auth.uid()))));
create or replace function public.process_marketplace_dispute() returns trigger language plpgsql security definer set search_path=public as $$
declare o public.marketplace_orders%rowtype; counterpart uuid;
begin
  select * into o from public.marketplace_orders where id=new.order_id;
  if tg_op='INSERT' then
    update public.marketplace_orders set payout_status='held' where id=new.order_id and payout_status not in ('paid','not_eligible');
    insert into public.marketplace_dispute_events(dispute_id,actor_id,event_type,message) values(new.id,auth.uid(),'opened','Dispute opened: ' || new.reason);
    counterpart:=case when new.opened_by=o.customer_id then o.provider_id else o.customer_id end;
    if counterpart is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(counterpart,'dispute_opened','Order dispute opened',public.notification_actor_name() || ' opened a dispute for this order.','/marketplace/orders/' || new.order_id,new.id); end if;
    insert into notifications(user_id,type,title,message,href,reference_id) select id,'dispute_opened','New marketplace dispute',public.notification_actor_name() || ' opened a ' || new.priority || ' priority dispute.','/admin/marketplace',new.id from public.users where role='admin' and id<>auth.uid();
  elsif old.status is distinct from new.status then
    insert into public.marketplace_dispute_events(dispute_id,actor_id,event_type,message) values(new.id,auth.uid(),new.status,coalesce(new.resolution,'Dispute status updated to ' || new.status));
    insert into notifications(user_id,type,title,message,href,reference_id) values(o.customer_id,'dispute_update','Dispute updated',public.notification_actor_name() || ' updated the dispute to ' || new.status || '.','/marketplace/orders/' || new.order_id,new.id);
    if o.provider_id is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(o.provider_id,'dispute_update','Dispute updated',public.notification_actor_name() || ' updated the dispute to ' || new.status || '.','/earn-with-jobiverse/dashboard/orders/' || new.order_id,new.id); end if;
  end if;
  return new;
end; $$;
drop trigger if exists marketplace_dispute_processing on public.marketplace_disputes;
create trigger marketplace_dispute_processing after insert or update of status on public.marketplace_disputes for each row execute function public.process_marketplace_dispute();
create or replace function public.reopen_marketplace_dispute(p_dispute_id uuid,p_message text) returns void language plpgsql security definer set search_path=public as $$
declare d public.marketplace_disputes%rowtype;
begin
  if char_length(trim(p_message))<10 then raise exception 'Escalation reason must contain at least 10 characters'; end if;
  select * into d from public.marketplace_disputes where id=p_dispute_id for update;
  if d.id is null then raise exception 'Dispute not found'; end if;
  if not exists(select 1 from public.marketplace_orders o where o.id=d.order_id and (o.customer_id=auth.uid() or o.provider_id=auth.uid())) then raise exception 'Access denied'; end if;
  if d.status not in ('resolved','rejected') then raise exception 'Only a closed dispute can be reopened'; end if;
  if d.reopened_count>=3 then raise exception 'Maximum escalation limit reached'; end if;
  update public.marketplace_disputes set status='open',resolution=null,resolved_by=null,resolved_at=null,reopened_count=reopened_count+1 where id=p_dispute_id;
  insert into public.marketplace_dispute_events(dispute_id,actor_id,event_type,message) values(p_dispute_id,auth.uid(),'reopened',trim(p_message));
end; $$;
grant execute on function public.reopen_marketplace_dispute(uuid,text) to authenticated;
commit;
