# JobiVerse Production Authentication Configuration

## Supabase Authentication settings

- Set **Site URL** to the final HTTPS production domain.
- Add allowed redirect URLs for `/auth/callback` and `/reset-password` on the production domain.
- Keep localhost redirect URLs only while development testing is active.
- Enable email confirmation for candidate, employer and creator self-signup.
- Disable anonymous sign-ins.
- Keep recruiter and admin creation restricted to the JobiVerse owner/admin workflow.
- Set minimum password length to at least 8 and require letters and numbers.
- Enable leaked-password protection when available on the Supabase plan.
- Configure production SMTP before onboarding real users.
- Configure Google and LinkedIn provider credentials only with exact production callback URLs.

## Session and authorization controls implemented in code

- Server proxy validates the Supabase user before protected role routes render.
- Candidate accounts may enter the creator workspace; employer, recruiter and admin accounts may not.
- Unauthenticated users return to their original protected destination after login.
- Password reset returns users to the correct role portal.
- Signup and reset enforce the same minimum password policy.
- Database RLS remains the final authorization boundary for all protected data.

## Pre-launch verification

1. Test signup and email confirmation for candidate, employer and creator.
2. Test wrong-role access for every portal.
3. Test password reset once, then confirm the same reset link cannot be reused.
4. Test logout and verify protected pages require login again.
5. Test session refresh after browser restart and token expiry.
6. Test Google and LinkedIn login only after production provider credentials are configured.
