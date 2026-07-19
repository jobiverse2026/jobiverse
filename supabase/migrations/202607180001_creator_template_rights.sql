alter table public.marketplace_services
  add column if not exists template_rights_status text not null default 'not_applicable',
  add column if not exists template_terms_version text,
  add column if not exists template_rights_accepted_at timestamptz;
alter table public.marketplace_services drop constraint if exists marketplace_services_template_rights_status_check;
alter table public.marketplace_services add constraint marketplace_services_template_rights_status_check check(template_rights_status in('not_applicable','pending_declaration','accepted'));
update public.marketplace_services set template_rights_status='pending_declaration' where is_editable=true and template_rights_status='not_applicable';
create index if not exists marketplace_template_rights_idx on public.marketplace_services(template_rights_status,created_at desc) where is_editable=true;
