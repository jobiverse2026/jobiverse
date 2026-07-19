# JobiVerse Production Security Audit

Run `supabase/audits/production_security_audit.sql` in the Supabase SQL Editor before production onboarding.

The audit is read-only and checks:

- public tables without RLS;
- anonymous write grants;
- unconditional public write/read policies;
- public storage buckets;
- RLS tables without policies;
- SECURITY DEFINER functions without a pinned `search_path`;
- functions executable by `PUBLIC`.

## Release gate

- No unresolved `CRITICAL` findings.
- No unresolved `HIGH` findings.
- Every `MEDIUM` finding must have a documented business justification.
- Re-run after every schema or storage-policy migration.

Do not paste secrets, API keys or account passwords into audit reports.

## Accepted public-read surfaces

- Published marketplace reviews and aggregate helpful votes.
- Creator availability required for booking.
- Creator verification indicators shown on public listings.
- `user-avatars` storage bucket: intentionally public because profile images are rendered through stored public URLs. Upload remains owner-scoped and file-type/size restricted. Revisit signed delivery if private avatars become a product requirement.
