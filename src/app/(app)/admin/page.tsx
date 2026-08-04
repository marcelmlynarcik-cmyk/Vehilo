import {
  Activity,
  AlertTriangle,
  BarChart3,
  Car,
  Database,
  FileText,
  Fuel,
  ReceiptText,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { requireAdmin } from "@/lib/admin";
import { loadAdminOverview } from "@/lib/data/admin";

const metricIcons = {
  profiles: Users,
  vehicles: Car,
  expenses: ReceiptText,
  energy_entries: Fuel,
  service_entries: Wrench,
  reminders: Activity,
  documents: FileText,
} as const;

const plannedAdminTools = [
  {
    title: "Vyhledání uživatele",
    description: "Support nástroj bude dostupný až po doplnění audit logu a pravidel přístupu.",
  },
  {
    title: "Předplatné a platby",
    description: "Zobrazí se až po výběru platební brány a implementaci fakturace.",
  },
  {
    title: "Právní dokumenty",
    description: "Správa verzí podmínek a souhlasů přijde až po právní přípravě.",
  },
];

export default async function AdminPage() {
  const adminState = await requireAdmin();
  const overview = await loadAdminOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Soukromý přehled pro vlastníka aplikace. Tato část není běžná uživatelská funkce."
        actions={
          <Badge variant="outline" className="border-[rgba(45,212,163,0.3)] bg-[rgba(45,212,163,0.1)] text-[#9ff5dc]">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Owner only
          </Badge>
        }
      />

      {!overview.hasAdminDataSource ? (
        <Alert>
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Admin datový zdroj není dokončený</AlertTitle>
          <AlertDescription>
            Stránka je chráněná admin allowlistem, ale celkové aplikační metriky vyžadují serverovou proměnnou
            `SUPABASE_SECRET_KEY` nebo `SUPABASE_SERVICE_ROLE_KEY`. Bez ní by Supabase RLS ukazovalo jen data
            přihlášeného uživatele.
          </AlertDescription>
        </Alert>
      ) : null}

      {overview.errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Část admin metrik se nenačetla</AlertTitle>
          <AlertDescription>{overview.errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => {
          const Icon = metricIcons[metric.key as keyof typeof metricIcons] ?? BarChart3;

          return (
            <Card key={metric.key} className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(45,212,163,0.45)] to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.label}</CardTitle>
                <span className="flex size-9 items-center justify-center rounded-[13px] border border-[rgba(45,212,163,0.2)] bg-[rgba(45,212,163,0.1)]">
                  <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="tabular-num text-2xl font-bold text-white">
                  {metric.value === null ? "Ve vývoji" : metric.value.toLocaleString("cs-CZ")}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-[var(--accent)]" aria-hidden="true" />
              Datový zdroj
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <StatusRow label="Admin allowlist" value={adminState.email ?? "Bez emailu"} ready={adminState.isAdmin} />
            <StatusRow label="Supabase admin key" value={overview.hasAdminDataSource ? "Nastaveno" : "Ve vývoji"} ready={overview.hasAdminDataSource} />
            <StatusRow label="RLS pro běžné uživatele" value="Zachováno" ready />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-[var(--accent)]" aria-hidden="true" />
              Stav aplikace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <StatusRow label="Prostředí" value={process.env.NODE_ENV === "production" ? "Production" : "Development"} ready />
            <StatusRow label="Doména vehilo.eu" value="Ve vývoji" ready={false} />
            <StatusRow label="Platby" value="Odloženo" ready={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[var(--accent)]" aria-hidden="true" />
              Bezpečnost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <StatusRow label="Přístup na stránku" value="Owner only" ready />
            <StatusRow label="Service key v prohlížeči" value="Nepoužívá se" ready />
            <StatusRow label="Support akce" value="Ve vývoji" ready={false} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plannedAdminTools.map((tool) => (
          <Card key={tool.title}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-foreground">{tool.title}</h2>
                <Badge variant="outline">Ve vývoji</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function StatusRow({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border bg-[rgba(13,23,30,0.42)] px-3 py-2">
      <span>{label}</span>
      <Badge variant={ready ? "secondary" : "outline"} className="max-w-[58%] truncate">
        {value}
      </Badge>
    </div>
  );
}
