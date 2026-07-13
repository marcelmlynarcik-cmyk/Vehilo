import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/basic-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { calculateAverageMonthlyCost, calculateCostPerKm, calculateTotalOwnershipCost, formatCurrency } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function StatisticsPage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";

  return (
    <div className="space-y-6">
      <PageHeader title="Statistiky" description="Pokročilá analytika skutečných nákladů, spotřeby, servisu, odpisů a porovnání vozidel." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Celkové vlastnické náklady" value={formatCurrency(calculateTotalOwnershipCost(data), currency)} description="TCO" icon={BarChart3} />
        <MetricCard title="Cena za kilometr" value={`${formatCurrency(calculateCostPerKm(data), currency, 2)}/km`} description="Napříč garáží od koupě" icon={BarChart3} />
        <MetricCard title="Měsíční průměr" value={formatCurrency(calculateAverageMonthlyCost(data), currency)} description="Z reálných záznamů" icon={BarChart3} />
        <MetricCard title="Počet vozidel" value={String(data.vehicles.length)} description="Pro porovnání" icon={BarChart3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Měsíční celkové náklady" type="line" />
        <ChartCard title="Kategorie nákladů" type="bar" />
        <ChartCard title="Rozložení nákladů" type="pie" />
        <ChartCard title="Spotřeba paliva / energie" type="line" />
        <ChartCard title="Nájezd po měsících" type="bar" />
        <ChartCard title="Kumulativní TCO" type="area" />
      </div>
      <Card>
        <CardContent className="p-5">
          <Badge variant="secondary" className="mb-3">Vehilo Insights</Badge>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>Průměrné měsíční náklady se zobrazí po prvních výdajích.</p>
            <p>Nejdražší kategorie se vypočítá z výdajů, servisu a energie.</p>
            <p>Nejnižší cena na 100 km bude porovnávat všechna vozidla.</p>
            <p>Plug-in hybrid analýza oddělí palivo a domácí/veřejné nabíjení.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
