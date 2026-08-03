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
  buildPurchaseVsCurrentValueSeries,
  buildServiceCostTrendSeries,
  buildVehicleDepreciationSeries,
  buildVehicleCostPer100KmSeries,
  buildVehicleCostSeries,
  calculateAverageMonthlyCost,
  calculateCostPerKm,
  calculateDailyOperatingCost,
  calculateOperatingCostPerKm,
  calculateRecordedCost,
  calculateTotalDepreciation,
  calculateTotalOwnershipCost,
  findMostExpensiveCategory,
  findMostExpensiveMonth,
  findMostExpensiveVehicle,
  formatCurrency,
} from "@/lib/calculations/costs";
import { buildConsumptionTrendSeries } from "@/lib/calculations/energy";
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
  const vehicleCostPer100Km = buildVehicleCostPer100KmSeries(data);
  const serviceCostTrend = buildServiceCostTrendSeries(data);
  const depreciationByVehicle = buildVehicleDepreciationSeries(data.vehicles);
  const purchaseVsCurrentValue = buildPurchaseVsCurrentValueSeries(data.vehicles);
  const consumptionTrend = buildConsumptionTrendSeries(data.energyEntries);
  const mostExpensiveMonth = findMostExpensiveMonth(data);
  const mostExpensiveCategory = findMostExpensiveCategory(data);
  const mostExpensiveVehicle = findMostExpensiveVehicle(data);

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
        <MetricCard title="Odpis hodnoty" value={formatCurrency(calculateTotalDepreciation(data.vehicles), currency)} description="Pořizovací minus aktuální hodnota" icon={BarChart3} />
        <MetricCard title="Nejdražší měsíc" value={mostExpensiveMonth ? formatCurrency(mostExpensiveMonth.value, currency) : "-"} description={mostExpensiveMonth?.name ?? "Čeká na náklady"} icon={BarChart3} />
        <MetricCard title="Počet vozidel" value={String(data.vehicles.length)} description="Pro porovnání" icon={BarChart3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Měsíční celkové náklady" type="line" data={monthlyTotalCosts} valueLabel="Náklady" />
        <ChartCard title="Kategorie nákladů" type="bar" data={costCategories} valueLabel="Náklady" />
        <ChartCard title="Rozložení nákladů" type="pie" data={costDistribution} valueLabel="Náklady" />
        <ChartCard title="Spotřeba paliva / energie" type="line" data={consumptionTrend} valueLabel="Spotřeba" />
        <ChartCard title="Nájezd po měsících" type="bar" data={mileageMonths} valueLabel="Nájezd" />
        <ChartCard title="Kumulativní provozní náklady" type="area" data={cumulativeTotalCosts} valueLabel="Náklady" />
        <ChartCard title="Průměr km/den podle roku" type="bar" data={dailyMileageByYear} valueLabel="Km/den" />
        <ChartCard title="Náklady podle vozidla" type="bar" data={vehicleCosts} valueLabel="Náklady" />
        <ChartCard title="Cena na 100 km podle vozidla" type="bar" data={vehicleCostPer100Km} valueLabel="Náklady" />
        <ChartCard title="Servisní náklady v čase" type="line" data={serviceCostTrend} valueLabel="Náklady" />
        <ChartCard title="Odpis podle vozidla" type="bar" data={depreciationByVehicle} valueLabel="Odpis" />
        <ChartCard title="Pořizovací vs aktuální hodnota" type="bar" data={purchaseVsCurrentValue} valueLabel="Hodnota" />
      </div>
      <Card>
        <CardContent className="p-5">
          <Badge variant="secondary" className="mb-3">Vehilo Insights</Badge>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>Nejdražší kategorie: {mostExpensiveCategory ? `${mostExpensiveCategory.name} (${formatCurrency(mostExpensiveCategory.value, currency)})` : "čeká na náklady"}.</p>
            <p>Nejdražší vozidlo: {mostExpensiveVehicle ? `${mostExpensiveVehicle.name} (${formatCurrency(mostExpensiveVehicle.value, currency)})` : "čeká na vozidla"}.</p>
            <p>Nejdražší měsíc: {mostExpensiveMonth ? `${mostExpensiveMonth.name} (${formatCurrency(mostExpensiveMonth.value, currency)})` : "čeká na náklady"}.</p>
            <p>Plug-in hybrid analýza oddělí palivo a domácí/veřejné nabíjení.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
