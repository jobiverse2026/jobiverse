create or replace function public.notify_admins_about_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications(user_id, type, title, message, href)
  select
    u.id,
    'platform_feedback',
    'New JobiVerse feedback',
    coalesce(nullif(trim(u.email), ''), 'A platform member')
      || ' submitted '
      || replace(new.category, '_', ' ')
      || ': '
      || new.subject,
    '/admin/feedback?id=' || new.id::text
  from public.users u
  where u.role = 'admin' and u.is_active = true;

  return new;
end;
$$;
