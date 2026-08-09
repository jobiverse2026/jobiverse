begin;

create or replace function public.notify_new_user_onboarding()
returns trigger language plpgsql security definer set search_path=public as $$
declare target_href text; target_title text; target_message text;
begin
  if new.role='candidate' then target_href:='/account/onboarding';target_title:='Build your JobiVerse profile';target_message:='Complete your profile, upload a CV and start tracking relevant opportunities.';
  elsif new.role='employer' then target_href:='/account/onboarding';target_title:='Set up your hiring workspace';target_message:='Complete your company profile and create your first hiring requirement.';
  elsif new.role='recruiter' then target_href:='/account/onboarding';target_title:='Open your recruiter launch path';target_message:='Review assigned roles, submit consented candidates and keep the pipeline moving.';
  elsif new.role='creator' then target_href:='/account/onboarding';target_title:='Launch your creator business';target_message:='Publish your first service, set availability and prepare payout details.';
  else return new; end if;
  insert into public.notifications(user_id,type,title,message,href,reference_id)
  values(new.id,'onboarding',target_title,target_message,target_href,new.id);
  return new;
end;$$;

drop trigger if exists new_user_onboarding_notification on public.users;
create trigger new_user_onboarding_notification after insert on public.users
for each row execute function public.notify_new_user_onboarding();

commit;
