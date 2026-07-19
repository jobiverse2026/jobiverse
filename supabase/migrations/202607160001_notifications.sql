begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  href text,
  reference_id uuid,
  read_at timestamptz,
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed','disabled')),
  created_at timestamptz not null default now()
);

-- Upgrade older development versions of the notifications table in place.
alter table public.notifications add column if not exists type text not null default 'general';
alter table public.notifications add column if not exists title text not null default 'JobiVerse update';
alter table public.notifications add column if not exists message text not null default 'You have a new update.';
alter table public.notifications add column if not exists href text;
alter table public.notifications add column if not exists reference_id uuid;
alter table public.notifications add column if not exists read_at timestamptz;
alter table public.notifications add column if not exists email_status text not null default 'pending';
alter table public.notifications add column if not exists created_at timestamptz not null default now();

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
alter table public.notifications enable row level security;
drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can view own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, update on public.notifications to authenticated;

create or replace function public.notification_actor_name()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(trim(full_name), '') from public.users where id = auth.uid()),
    (select email from public.users where id = auth.uid()),
    'JobiVerse Team'
  );
$$;

create or replace function public.notify_marketplace_order()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.provider_id is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.provider_id,'order_created','New service order',public.notification_actor_name() || ' placed a new service order.','/earn-with-jobiverse/dashboard/orders',new.id);
    end if;
  elsif old.status is distinct from new.status then
    insert into notifications(user_id,type,title,message,href,reference_id)
    values(new.customer_id,'order_status','Order status updated',public.notification_actor_name() || ' updated your service order to ' || replace(new.status,'_',' ') || '.','/marketplace/orders',new.id);
  end if;
  return new;
end; $$;

drop trigger if exists marketplace_order_notifications on public.marketplace_orders;
create trigger marketplace_order_notifications after insert or update of status on public.marketplace_orders for each row execute function public.notify_marketplace_order();

create or replace function public.notify_marketplace_offer()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  provider_name text;
  service_name text;
  response_message text;
begin
  if tg_op = 'INSERT' then
    if new.provider_id is not null then
      insert into notifications(user_id,type,title,message,href,reference_id)
      values(new.provider_id,'offer_created','New negotiation request',public.notification_actor_name() || ' sent a price negotiation for your service.','/earn-with-jobiverse/dashboard/offers',new.id);
    end if;
  elsif old.status is distinct from new.status then
    select coalesce(u.full_name, 'JobiVerse service provider'), coalesce(s.title, new.service_title, 'your selected service')
      into provider_name, service_name
      from (select 1) seed
      left join public.users u on u.id = new.provider_id
      left join public.marketplace_services s on s.id = new.service_id;
    if old.status = 'countered' and auth.uid() = new.customer_id then
      if new.provider_id is not null then
        insert into notifications(user_id,type,title,message,href,reference_id)
        values(new.provider_id,'counter_response',case when new.status='accepted' then 'Counteroffer accepted' else 'Counteroffer rejected' end,public.notification_actor_name() || ' has ' || new.status || ' your counteroffer for ' || service_name || '.','/earn-with-jobiverse/dashboard/offers',new.id);
      end if;
      return new;
    end if;
    response_message := case new.status
      when 'accepted' then provider_name || ' has accepted your negotiation for ' || service_name || ' at ₹' || trim(to_char(new.customer_offer, 'FM9999999990.00')) || '.'
      when 'rejected' then provider_name || ' has rejected your negotiation for ' || service_name || '.'
      when 'countered' then provider_name || ' has sent a counter price for ' || service_name || '.'
      else provider_name || ' updated your negotiation for ' || service_name || ' to ' || replace(new.status,'_',' ') || '.'
    end;
    insert into notifications(user_id,type,title,message,href,reference_id)
    values(new.customer_id,'offer_status',case when new.status='accepted' then 'Negotiation accepted' when new.status='rejected' then 'Negotiation rejected' else 'Negotiation updated' end,response_message,'/marketplace/orders',new.id);
  end if;
  return new;
end; $$;

drop trigger if exists marketplace_offer_notifications on public.marketplace_offers;
create trigger marketplace_offer_notifications after insert or update of status on public.marketplace_offers for each row execute function public.notify_marketplace_offer();

create or replace function public.notify_requirement_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id) values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    if new.is_public then
      insert into notifications(user_id,type,title,message,href,reference_id)
      select id,'job_published','New opportunity: ' || new.job_title,public.notification_actor_name() || ' published a new role: ' || new.job_title || '.','/candidates/jobs',new.id from public.users where role = 'candidate';
    end if;
  else
    if old.assigned_recruiter is distinct from new.assigned_recruiter and new.assigned_recruiter is not null then
      insert into notifications(user_id,type,title,message,href,reference_id) values(new.assigned_recruiter,'requirement_assigned','New role assigned',public.notification_actor_name() || ' assigned you the role ' || new.job_title || '.','/recruiter/requirements/' || new.id,new.id);
    end if;
    if not coalesce(old.is_public,false) and new.is_public then
      insert into notifications(user_id,type,title,message,href,reference_id)
      select id,'job_published','New opportunity: ' || new.job_title,public.notification_actor_name() || ' published a new role: ' || new.job_title || '.','/candidates/jobs',new.id from public.users where role = 'candidate';
    end if;
    if old.status is distinct from new.status then
      insert into notifications(user_id,type,title,message,href,reference_id) values(new.employer_id,'requirement_status','Requirement updated',public.notification_actor_name() || ' updated ' || new.job_title || ' to ' || new.status::text || '.','/employers/requirements/' || new.id,new.id);
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists requirement_notifications on public.requirements;
create trigger requirement_notifications after insert or update of assigned_recruiter,is_public,status on public.requirements for each row execute function public.notify_requirement_changes();

create or replace function public.notify_application_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare req public.requirements%rowtype;
begin
  select * into req from public.requirements where id = new.requirement_id;
  if tg_op = 'INSERT' then
    insert into notifications(user_id,type,title,message,href,reference_id) values(req.employer_id,'application_received','New candidate application',public.notification_actor_name() || ' applied for ' || req.job_title || '.','/employers/candidates',new.id);
    if req.assigned_recruiter is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(req.assigned_recruiter,'application_received','New candidate application',public.notification_actor_name() || ' applied for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id); end if;
  elsif old.status is distinct from new.status then
    insert into notifications(user_id,type,title,message,href,reference_id) values(new.candidate_user_id,'application_status','Application updated',public.notification_actor_name() || ' updated your application for ' || req.job_title || ' to ' || new.status::text || '.','/candidates/dashboard',new.id);
  end if;
  return new;
end; $$;
drop trigger if exists candidate_application_notifications on public.candidate_applications;
create trigger candidate_application_notifications after insert or update of status on public.candidate_applications for each row execute function public.notify_application_changes();

create or replace function public.notify_candidate_submission()
returns trigger language plpgsql security definer set search_path = public as $$
declare req public.requirements%rowtype;
begin
  select * into req from public.requirements where id = new.requirement_id;
  if tg_op = 'INSERT' then
    insert into notifications(user_id,type,title,message,href,reference_id) values(req.employer_id,'candidate_submitted','New profile submitted',public.notification_actor_name() || ' submitted ' || new.full_name || ' for ' || req.job_title || '.','/employers/candidates/' || new.id,new.id);
  elsif old.status is distinct from new.status and new.user_id is not null then
    insert into notifications(user_id,type,title,message,href,reference_id) values(new.user_id,'candidate_status','Profile status updated',public.notification_actor_name() || ' updated your profile for ' || req.job_title || ' to ' || new.status::text || '.','/candidates/dashboard',new.id);
  end if;
  return new;
end; $$;
drop trigger if exists candidate_submission_notifications on public.candidates;
create trigger candidate_submission_notifications after insert or update of status on public.candidates for each row execute function public.notify_candidate_submission();

create or replace function public.notify_interview_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_user uuid; req public.requirements%rowtype;
begin
  select user_id into candidate_user from public.candidates where id = new.candidate_id;
  select * into req from public.requirements where id = new.requirement_id;
  if candidate_user is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(candidate_user,'interview_update',case when tg_op='INSERT' then 'Interview scheduled' else 'Interview updated' end,public.notification_actor_name() || case when tg_op='INSERT' then ' scheduled' else ' updated' end || ' your ' || new.interview_round || ' interview for ' || req.job_title || '.','/candidates/dashboard',new.id); end if;
  if tg_op = 'INSERT' and req.assigned_recruiter is not null and req.assigned_recruiter <> new.created_by then insert into notifications(user_id,type,title,message,href,reference_id) values(req.assigned_recruiter,'interview_scheduled','Interview scheduled',public.notification_actor_name() || ' scheduled an interview for ' || req.job_title || '.','/recruiter/requirements/' || req.id,new.id); end if;
  return new;
end; $$;
drop trigger if exists interview_notifications on public.interviews;
create trigger interview_notifications after insert or update of status,interview_date on public.interviews for each row execute function public.notify_interview_changes();

create or replace function public.notify_placement_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_user uuid; candidate_name text; req public.requirements%rowtype;
begin
  select user_id,full_name into candidate_user,candidate_name from public.candidates where id = new.candidate_id;
  select * into req from public.requirements where id = new.requirement_id;
  if candidate_user is not null then insert into notifications(user_id,type,title,message,href,reference_id) values(candidate_user,'offer_update',case when tg_op='INSERT' then 'Offer received' else 'Offer updated' end,public.notification_actor_name() || ' updated your offer for ' || req.job_title || ' to ' || new.status::text || '.','/candidates/dashboard',new.id); end if;
  insert into notifications(user_id,type,title,message,href,reference_id) values(req.employer_id,'placement_update','Offer status updated',public.notification_actor_name() || ' updated ' || candidate_name || ' for ' || req.job_title || ' to ' || new.status::text || '.','/employers/candidates/' || new.candidate_id,new.id);
  return new;
end; $$;
drop trigger if exists placement_notifications on public.placements;
create trigger placement_notifications after insert or update of status on public.placements for each row execute function public.notify_placement_changes();

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

commit;
