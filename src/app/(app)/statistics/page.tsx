import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/basic-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import {
  buildAverageDailyMileageByYearSeries,
  buildCumulativeTotalCostSeries,
  buildCostCategorySeries,
  buildCostTypeDistributionSeries,
  buildMileageMonthSeries,
  buildMonthlyTotalCostSeries,
  buildVehicleCostSeries,
  calculateAverageMonthlyCost,
  calculateCostPerKm,
  calculateDailyOperatingCost,
  calculateOperatingCostPerKm,
  calculateRecordedCost,
  calculateTotalOwnershipCost,
  formatCurrency,
} from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function StatisticsPage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";
  const monthlyTotalCosts = buildMonthlyTotalCostSeries(data);
  const cumulativeTotalCosts = buildCumulativeTotalCostSeries(data);
  const costCategories = buildCostCategorySeries(data);
  const costDistribution = buildCostTypeDistributionSeries(data);
  const mileageMonths = buildMileageMonthSeries(data);
  const dailyMileageByYear = buildAverageDailyMileageByYearSeries(data);
  const vehicleCosts = buildVehicleCostSeries(data);

  return (
    <div className="space-y-6">
      <PageHeader title="Statistiky" description="Pokročilá analytika skutečných nákladů, spotřeby, servisu, odpisů a porovnání vozidel." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Provozní náklady" value={formatCurrency(calculateRecordedCost(data), currency)} description="Výdaje, palivo a servis" icon={BarChart3} />
        <MetricCard title="Denní provoz" value={formatCurrency(calculateDailyOperatingCost(data), currency)} description="Od prvního záznamu" icon={BarChart3} />
        <MetricCard title="Provoz na km" value={`${formatCurrency(calculateOperatingCostPerKm(data), currency, 2)}/km`} description="Bez pořizovací ceny" icon={BarChart3} />
        <MetricCard title="Vlastnické náklady" value={formatCurrency(calculateTotalOwnershipCost(data), currency)} description="Provoz + čistá pořizovací cena" icon={BarChart3} />
        <MetricCard title="TCO na km" value={`${formatCurrency(calculateCostPerKm(data), currency, 2)}/km`} description="Včetně vlastnictví" icon={BarChart3} />
        <MetricCard title="Měsíční průměr" value={formatCurrency(calculateAverageMonthlyCost(data), currency)} description="Z reálných provozních záznamů" icon={BarChart3} />
        <MetricCard title="Počet vozidel" value={String(data.vehicles.length)} description="Pro porovnání" icon={BarChart3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Měsíční celkové náklady" type="line" data={monthlyTotalCosts} valueLabel="Náklady" />
        <ChartCard title="Kategorie nákladů" type="bar" data={costCategories} valueLabel="Náklady" />
        <ChartCard title="Rozložení nákladů" type="pie" data={costDistribution} valueLabel="Náklady" />
        <ChartCard title="Spotřeba paliva / energie" type="line" />
        <ChartCard title="Nájezd po měsících" type="bar" data={mileageMonths} valueLabel="Nájezd" />
        <ChartCard title="Kumulativní provozní náklady" type="area" data={cumulativeTotalCosts} valueLabel="Náklady" />
        <ChartCard title="Průměr km/den podle roku" type="bar" data={dailyMileageByYear} valueLabel="Km/den" />
        <ChartCard title="Náklady podle vozidla" type="bar" data={vehicleCosts} valueLabel="Náklady" />
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
