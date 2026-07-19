begin;

create or replace function public.notify_payout_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user record;
  creator_name text;
begin
  select coalesce(nullif(trim(full_name), ''), email, 'A creator')
    into creator_name
  from public.users
  where id = new.creator_id;

  if tg_op = 'INSERT' then
    insert into public.notifications(user_id,type,title,message,href,reference_id)
    values(
      new.creator_id,
      'payout_profile_submitted',
      'Payout profile submitted',
      'JobiVerse received your payout account details and will verify them before your first transfer.',
      '/earn-with-jobiverse/dashboard/payout-profile',
      new.id
    );

    for admin_user in select id from public.users where role = 'admin' loop
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        admin_user.id,
        'payout_profile_review',
        'Payout account verification required',
        coalesce(creator_name, 'A creator') || ' submitted payout account details for verification.',
        '/admin/payout-accounts',
        new.id
      );
    end loop;
  elsif old.status is distinct from new.status then
    if new.status in ('verified','rejected') then
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        new.creator_id,
        'payout_profile_status',
        case when new.status='verified' then 'Payout account verified' else 'Payout account needs changes' end,
        case
          when new.status='verified' then 'JobiVerse verified your payout account. You can request eligible creator earnings.'
          else 'JobiVerse could not verify your payout account. Review the note and submit corrected details.'
        end,
        '/earn-with-jobiverse/dashboard/payout-profile',
        new.id
      );
    elsif new.status = 'pending' then
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(
        new.creator_id,
        'payout_profile_resubmitted',
        'Payout profile resubmitted',
        'JobiVerse received your updated payout account details for verification.',
        '/earn-with-jobiverse/dashboard/payout-profile',
        new.id
      );
      for admin_user in select id from public.users where role = 'admin' loop
        insert into public.notifications(user_id,type,title,message,href,reference_id)
        values(
          admin_user.id,
          'payout_profile_review',
          'Updated payout account requires review',
          coalesce(creator_name, 'A creator') || ' resubmitted payout account details.',
          '/admin/payout-accounts',
          new.id
        );
      end loop;
    end if;
  elsif old.account_holder_name is distinct from new.account_holder_name
     or old.bank_name is distinct from new.bank_name
     or old.account_number is distinct from new.account_number
     or old.ifsc_code is distinct from new.ifsc_code
     or old.upi_id is distinct from new.upi_id then
    insert into public.notifications(user_id,type,title,message,href,reference_id)
    values(new.creator_id,'payout_profile_resubmitted','Payout profile updated','JobiVerse received your updated payout account details for verification.','/earn-with-jobiverse/dashboard/payout-profile',new.id);
    for admin_user in select id from public.users where role = 'admin' loop
      insert into public.notifications(user_id,type,title,message,href,reference_id)
      values(admin_user.id,'payout_profile_review','Updated payout account requires review',coalesce(creator_name, 'A creator') || ' updated payout account details.','/admin/payout-accounts',new.id);
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists creator_payout_profile_notifications on public.creator_payout_profiles;
create trigger creator_payout_profile_notifications
after insert or update on public.creator_payout_profiles
for each row execute function public.notify_payout_profile_change();

-- Backfill one review notification for currently pending profiles.
insert into public.notifications(user_id,type,title,message,href,reference_id)
select
  admin_user.id,
  'payout_profile_review',
  'Payout account verification required',
  coalesce(nullif(trim(creator.full_name), ''), creator.email, 'A creator') ||
    ' submitted payout account details for verification.',
  '/admin/payout-accounts',
  payout.id
from public.creator_payout_profiles payout
cross join public.users admin_user
left join public.users creator on creator.id = payout.creator_id
where payout.status = 'pending'
  and admin_user.role = 'admin'
  and not exists (
    select 1 from public.notifications existing
    where existing.user_id = admin_user.id
      and existing.type = 'payout_profile_review'
      and existing.reference_id = payout.id
  );

commit;
