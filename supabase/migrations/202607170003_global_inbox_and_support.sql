begin;

create table if not exists public.support_conversations(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  assigned_admin_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check(status in ('open','closed')),
  unread_for_user integer not null default 0 check(unread_for_user>=0),
  unread_for_admin integer not null default 0 check(unread_for_admin>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.support_messages(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check(char_length(trim(message)) between 1 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists support_conversations_updated_idx on public.support_conversations(updated_at desc);
create index if not exists support_messages_conversation_idx on public.support_messages(conversation_id,created_at);
alter table public.support_conversations enable row level security;alter table public.support_messages enable row level security;
create policy "Users and admins view support conversations" on public.support_conversations for select to authenticated using(user_id=auth.uid() or public.current_user_role()='admin');
create policy "Users and admins update support conversations" on public.support_conversations for update to authenticated using(user_id=auth.uid() or public.current_user_role()='admin') with check(user_id=auth.uid() or public.current_user_role()='admin');
create policy "Users and admins view support messages" on public.support_messages for select to authenticated using(exists(select 1 from public.support_conversations c where c.id=conversation_id and (c.user_id=auth.uid() or public.current_user_role()='admin')));
create policy "Users and admins send support messages" on public.support_messages for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.support_conversations c where c.id=conversation_id and (c.user_id=auth.uid() or public.current_user_role()='admin')));
grant select,update on public.support_conversations to authenticated;grant select,insert on public.support_messages to authenticated;

create or replace function public.get_or_create_support_conversation() returns uuid language plpgsql security definer set search_path=public as $$
declare conversation_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required';end if;
  select id into conversation_id from public.support_conversations where user_id=auth.uid();
  if conversation_id is null then insert into public.support_conversations(user_id) values(auth.uid()) returning id into conversation_id;end if;
  return conversation_id;
end;$$;
grant execute on function public.get_or_create_support_conversation() to authenticated;

create or replace function public.update_support_unread() returns trigger language plpgsql security definer set search_path=public as $$
declare admin_sender boolean;
begin
  select exists(select 1 from public.users where id=new.sender_id and role='admin') into admin_sender;
  if admin_sender then update public.support_conversations set unread_for_user=unread_for_user+1,updated_at=now() where id=new.conversation_id;
  else update public.support_conversations set unread_for_admin=unread_for_admin+1,updated_at=now() where id=new.conversation_id;end if;
  return new;
end;$$;
drop trigger if exists support_message_unread on public.support_messages;create trigger support_message_unread after insert on public.support_messages for each row execute function public.update_support_unread();

create or replace function public.notify_support_message() returns trigger language plpgsql security definer set search_path=public as $$
declare conversation public.support_conversations%rowtype;admin_user record;admin_sender boolean;
begin
  select * into conversation from public.support_conversations where id=new.conversation_id;
  select exists(select 1 from public.users where id=new.sender_id and role='admin') into admin_sender;
  if admin_sender then insert into public.notifications(user_id,type,title,message,href,reference_id) values(conversation.user_id,'support_message','JobiVerse Support replied','JobiVerse Support sent you a new message.','/messages/support',new.id);
  else for admin_user in select id from public.users where role='admin' loop insert into public.notifications(user_id,type,title,message,href,reference_id) values(admin_user.id,'support_message','New support message',public.notification_actor_name() || ' sent a support message.','/admin/support?conversation=' || conversation.id,new.id);end loop;end if;
  return new;
end;$$;
drop trigger if exists support_message_notifications on public.support_messages;create trigger support_message_notifications after insert on public.support_messages for each row execute function public.notify_support_message();

create or replace function public.mark_support_read(target_conversation uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  if public.current_user_role()='admin' then update public.support_conversations set unread_for_admin=0 where id=target_conversation;
  else update public.support_conversations set unread_for_user=0 where id=target_conversation and user_id=auth.uid();end if;
end;$$;
grant execute on function public.mark_support_read(uuid) to authenticated;

commit;
