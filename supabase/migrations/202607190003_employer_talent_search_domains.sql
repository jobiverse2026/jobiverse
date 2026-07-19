alter table public.companies
add column if not exists allowed_email_domains text[] not null default '{}';

update public.companies
set allowed_email_domains = array_remove(array[
  nullif(lower(split_part(company_email, '@', 2)), ''),
  nullif(regexp_replace(lower(coalesce(website, '')), '^https?://(www\.)?|/.*$', '', 'g'), '')
], null)
where allowed_email_domains = '{}';
