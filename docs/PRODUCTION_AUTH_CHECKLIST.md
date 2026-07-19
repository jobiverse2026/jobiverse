# JobiVerse Production Authentication Checklist

Complete these items in the production Supabase project before launch.

## URL configuration

- Set **Site URL** to the final HTTPS JobiVerse domain.
- Add `https://YOUR-DOMAIN/auth/callback` to allowed redirect URLs.
- Keep localhost callback URLs only in the development project, not production.
- Set `NEXT_PUBLIC_SITE_URL` to the exact same HTTPS origin with no trailing slash.

## Email and password authentication

- Enable email confirmation for public candidate, employer and creator signup.
- Keep public recruiter and admin account creation disabled; create these accounts through controlled administration.
- Connect custom SMTP before inviting production users.
- Use a minimum password length of at least 8 characters.
- Enable leaked-password protection when available on the selected Supabase plan.
- Configure signup and password-reset rate limits appropriate for launch traffic.

## OAuth providers

- Enable Google and LinkedIn only after their production client IDs, secrets and callback URLs are configured.
- Add the Supabase provider callback URL shown in the provider settings to Google/LinkedIn consoles.
- Test role mismatch handling for every enabled provider.

## Abuse protection

- Enable CAPTCHA for signup, login and password recovery before public launch.
- Confirm production email and authentication rate limits.
- Review Supabase authentication logs after every launch test.

## Required live tests

1. Candidate signup, email confirmation and automatic candidate-dashboard redirect.
2. Employer signup, email confirmation and automatic employer-dashboard redirect.
3. Creator signup and creator-dashboard redirect.
4. Candidate account login through the Creator portal.
5. Recruiter/admin rejection from unauthorized role portals.
6. Forgot-password email, callback exchange, password update and fresh login.
7. Google/LinkedIn login returns to the originally requested booking page.
8. Expired and reused confirmation/reset links fail safely.
9. Logout clears the session and protected pages require login again.

