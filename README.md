# Vehilo

Vehilo je moderní PWA aplikace pro správu skutečných nákladů, servisu, paliva, energie, dokumentů a připomínek pro osobní i vícevozidlovou garáž.

Primární jazyk aplikace je čeština. Překlady přijdou později.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts
- Supabase Auth, Postgres, Storage a RLS
- Vercel deployment

## Lokální vývoj

```bash
pnpm install
pnpm dev
```

Lokální proměnné jsou v `.env.local`. Šablona je v `.env.example`.

Povinné proměnné:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

Admin proměnné pro owner-only stránku:

- `VEHILO_ADMIN_EMAILS` - čárkou oddělený seznam admin emailů.
- `SUPABASE_SECRET_KEY` - server-only Supabase secret key pro celkové admin metriky. Nikdy nepoužívat s prefixem `NEXT_PUBLIC_`.
- `VAPID_PRIVATE_KEY` - server-only klíč pro budoucí odesílání push připomínek. Nikdy nepoužívat s prefixem `NEXT_PUBLIC_`.
- `NEW_USER_NOTIFICATION_WEBHOOK_URL` - volitelný server-only webhook pro upozornění na nového uživatele.
- `NEW_USER_NOTIFICATION_WEBHOOK_SECRET` - volitelný sdílený secret pro ověření webhooku.

## Supabase

Aktivní projekt:

- Project ref: `elqjzqufqjwiqsqqwhen`
- URL: `https://elqjzqufqjwiqsqqwhen.supabase.co`

Migrace aplikované přes Supabase MCP:

- `20260710083940_initial_vehilo_schema`
- `20260710084242_fix_advisor_findings`
- `create_profile_on_signup`

Supabase security advisor zatím hlásí pouze vypnutou leaked-password ochranu pro Auth. To je přijatelné, dokud je primární přihlášení přes Google a není zapnuté email/heslo. Performance advisors zatím hlásí pouze nepoužité indexy, což je očekávané při nízkém provozu a malém objemu dat.

## Auth

Primární přihlášení je přes Google účet. Před produkčním nasazením je potřeba doplnit Vercel/custom domain URL do:

- Google Cloud OAuth Authorized JavaScript origins
- Supabase Auth Redirect URLs
- `NEXT_PUBLIC_SITE_URL`

## Projektový plán

Detailní plán a stav prací je v:

[docs/VEHILO_PROJECT_PLAN.md](docs/VEHILO_PROJECT_PLAN.md)
