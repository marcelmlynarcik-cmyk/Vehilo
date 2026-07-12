import { Plus, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/basic-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function ServicePage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";
  const serviceTotal = data.serviceEntries.reduce((total, entry) => total + Number(entry.total_cost), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Servis a údržba" description="Kompletní servisní historie, práce, díly, záruky, faktury a plánované úkony." actions={<Button><Plus className="mr-2 size-4" />Přidat servis</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Servis letos" value={formatCurrency(serviceTotal, currency)} description="Z reálných servisních záznamů" icon={Wrench} />
        <MetricCard title="Poslední servis" value="-" description="Zatím bez záznamu" icon={Wrench} />
        <MetricCard title="Další servis" value="-" description="Dle připomínek" icon={Wrench} />
        <MetricCard title="Nejdražší servis" value={formatCurrency(0, currency)} description="Po doplnění dat" icon={Wrench} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {data.serviceEntries.length === 0 ? (
          <EmptyState icon={Wrench} title="Servisní historie je prázdná" description="Po připojení Supabase zde vznikne časová osa oprav, údržby, STK/MOT a EV kontrol." actionLabel="Přidat servis" />
        ) : (
          <Card><CardContent className="p-6">Servisní záznamy se načtou ze Supabase.</CardContent></Card>
        )}
        <Card>
          <CardHeader><CardTitle>Chytré servisní skupiny</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Olej", "Filtry", "Brzdy", "Rozvody", "Pneumatiky", "STK/MOT", "EV baterie", "Nabíjecí systém"].map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Servisní náklady podle roku" type="bar" />
        <ChartCard title="Servisní náklady podle typu" type="pie" />
      </div>
    </div>
  );
}
