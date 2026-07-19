# JobiVerse Backup and Recovery Runbook

## Recovery scope

A complete JobiVerse recovery requires all of the following:

1. PostgreSQL schema, data, functions, triggers, RLS policies and grants.
2. Supabase Auth users and identities.
3. Supabase Storage objects and bucket policies.
4. Hosting environment variables and provider webhook secrets.
5. The exact application release and ordered SQL migrations.

Database backups alone do not restore uploaded resumes, CV templates, profile photos, message attachments or support attachments.

## Production controls

- Enable the strongest Supabase backup/PITR option affordable for the production plan.
- Keep an encrypted off-platform backup/export on a documented schedule.
- Back up private and public storage buckets separately.
- Never store exported user data or credentials in the Git repository.
- Restrict backup access to the JobiVerse owner and explicitly authorized operators.
- Record backup timestamp, scope, encryption location and verification result.

## Restore drill

Run the first drill in a separate non-production Supabase project:

1. Record production row counts, storage object counts and latest migration version.
2. Restore the latest database backup into the isolated project.
3. Restore storage objects without making private buckets public.
4. Apply only migrations newer than the restored migration version.
5. configure temporary test environment variables for the isolated project.
6. Run the production security audit and backup-readiness audit.
7. Test login, one candidate workflow, one employer workflow, one creator order and one admin workflow.
8. Compare critical table counts and storage object counts with the source snapshot.
9. Delete the temporary recovery project and securely remove exported data after sign-off.

## Recovery targets to approve before launch

- RPO: maximum acceptable amount of recent data loss.
- RTO: maximum acceptable platform downtime.
- Backup frequency and retention period.
- Named person authorized to initiate a restore.
- Escalation path for Supabase, Razorpay and hosting incidents.

## Verification evidence

Keep the latest output of `supabase/audits/production_backup_readiness.sql`, the restore-drill date, differences found, corrective actions and final approval in the private operations record.

### Development baseline — 17 July 2026

- Public tables: 41
- Public schema size: 2,136 kB
- Validated foreign keys: 90
- Invalid indexes: 0
- Enabled workflow triggers: 34
- Public functions: 40
- Storage buckets: 7
- Stored objects: 6 (3,527 kB)
- Migration tracking: repository SQL files are canonical because migrations were applied through SQL Editor

Result: schema integrity and recoverable-object inventory passed. Production backup scheduling, PITR selection and an isolated restore drill remain launch-environment tasks.
