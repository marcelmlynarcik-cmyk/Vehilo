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

## Supabase

Aktivní projekt:

- Project ref: `elqjzqufqjwiqsqqwhen`
- URL: `https://elqjzqufqjwiqsqqwhen.supabase.co`

Migrace aplikované přes Supabase MCP:

- `20260710083940_initial_vehilo_schema`
- `20260710084242_fix_advisor_findings`
- `create_profile_on_signup`

Supabase security advisors jsou čisté. Performance advisors zatím hlásí pouze nepoužité indexy, což je očekávané u prázdné databáze.

## Auth

Primární přihlášení je přes Google účet. Před produkčním nasazením je potřeba doplnit Vercel/custom domain URL do:

- Google Cloud OAuth Authorized JavaScript origins
- Supabase Auth Redirect URLs
- `NEXT_PUBLIC_SITE_URL`

## Projektový plán

Detailní plán a stav prací je v:

[docs/VEHILO_PROJECT_PLAN.md](docs/VEHILO_PROJECT_PLAN.md)
