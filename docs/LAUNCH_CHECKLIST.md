# Vehilo Launch Checklist

Last updated: 2026-08-28

## Current Launch State

- Production URL: `https://www.vehilo.eu`
- Canonical host: `https://www.vehilo.eu`
- Production deployment: verified previously as `READY`
- Google login on the production domain: verified by the user
- `robots.txt`: available on production
- `sitemap.xml`: available on production
- Google Search Console sitemap submission: still pending user-side domain verification/access

## Before Public Promotion

- Submit `https://www.vehilo.eu/sitemap.xml` in Google Search Console.
- Confirm Google Search Console sees `https://www.vehilo.eu` as the canonical property.
- Re-check production login with a normal Google account.
- Re-check that protected app routes redirect unauthenticated users to the public entry page.
- Re-check that public legal pages load without authentication.
- Keep unfinished visible features marked as `Připravujeme` or `Ve vývoji`.
- Confirm no user-facing copy mentions premium, Pro, paid unlocks or subscription-only features.
- Confirm support/contact email is correct on public and settings pages.

## Supabase Security Gate

Verified on 2026-08-28 against project `elqjzqufqjwiqsqqwhen`:

- RLS is enabled on `profiles`, `vehicles`, `expenses`, `energy_entries`, `service_entries`, `reminders` and `documents`.
- Each verified table has owner-scoped `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies for `authenticated`.
- `UPDATE` policies include both `USING` and `WITH CHECK`.
- `anon` has no grants on those user-data tables.
- `authenticated` has only `SELECT`, `INSERT`, `UPDATE` and `DELETE` grants on those user-data tables.
- Storage buckets `vehicle-photos`, `receipts`, `service-invoices` and `documents` are private.
- Storage object policies are scoped to authenticated owners by first path segment matching `auth.uid()`.

Open Supabase notes:

- Security advisor still warns that leaked password protection is disabled. This is lower priority while Google login is the primary sign-in path, but should be enabled before email/password login is introduced.
- Performance advisor reports unused indexes. This is expected while traffic/data volume is low and should not be fixed by removing indexes before real usage patterns are known.

## Rollback Notes

If a production deployment breaks the public app:

- Use Vercel project `vehilo` and promote the previous known-good deployment from the Vercel dashboard.
- If the issue came from a Git commit, revert the commit in Git and push `main` so Vercel creates a fresh production deployment.
- If the issue is an environment variable, restore the last known values for production and redeploy.
- If Google login breaks, verify these values first:
  - `NEXT_PUBLIC_SITE_URL=https://www.vehilo.eu`
  - Google Cloud Authorized JavaScript origin includes `https://www.vehilo.eu`
  - Supabase Auth redirect URLs include `https://www.vehilo.eu/auth/callback`
  - Google provider callback remains `https://elqjzqufqjwiqsqqwhen.supabase.co/auth/v1/callback`
- If Supabase data access breaks, check RLS policies, grants and recent SQL changes before changing application code.
- If Storage uploads break, verify bucket privacy and storage object policies before making buckets public.

## Do Not Launch Yet If

- Private routes are indexable or visible without login.
- User-owned data can be read, changed or deleted across accounts.
- Storage files can be accessed outside the owner path.
- A visible unfinished feature looks fully active without `Připravujeme` or `Ve vývoji`.
- Public copy references a premium/Pro/subscription-only product model.
- Production login is broken on `https://www.vehilo.eu`.
