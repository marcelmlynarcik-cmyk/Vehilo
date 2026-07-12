import {
  Bell,
  CalendarClock,
  Car,
  FileText,
  Fuel,
  Gauge,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartCard } from "@/components/charts/basic-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";
import {
  calculateAverageMonthlyCost,
  calculateCostPerKm,
  calculateTotalOwnershipCost,
  countReminderStatus,
  formatCurrency,
  formatNumber,
  totalMileage,
} from "@/lib/calculations/costs";

export default async function DashboardPage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";
  const totalCost = calculateTotalOwnershipCost(data);
  const monthlyCost = calculateAverageMonthlyCost(data);
  const costPerKm = calculateCostPerKm(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Přehled garáže"
        description="Sledujte náklady, servis, palivo, energii a připomínky pro všechna vozidla na jednom místě."
        actions={
          <>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Vozidlo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechna vozidla</SelectItem>
                {data.vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>Přidat vozidlo</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Vozidla celkem" value={String(data.vehicles.length)} description="Aktivní záznamy v garáži" icon={Car} />
        <MetricCard title="Měsíční náklady" value={formatCurrency(monthlyCost, currency)} description="Průměr ze skutečných záznamů" icon={ReceiptText} />
        <MetricCard title="Celkové vlastnické náklady" value={formatCurrency(totalCost, currency)} description="Výdaje, palivo, servis a ztráta hodnoty" icon={Gauge} />
        <MetricCard title="Cena za kilometr" value={`${formatCurrency(costPerKm, currency)}/km`} description="Napříč všemi vozidly" icon={Fuel} />
        <MetricCard title="Nadcházející připomínky" value={String(countReminderStatus(data.reminders, "upcoming"))} description="Plánovaný servis a dokumenty" icon={Bell} />
        <MetricCard title="Po termínu" value={String(countReminderStatus(data.reminders, "overdue"))} description="Vyžaduje pozornost" icon={CalendarClock} />
        <MetricCard title="Dokumenty brzy expirují" value={String(data.documents.filter((document) => document.status === "expiring_soon").length)} description="Pojištění, STK/MOT a povolení" icon={FileText} />
        <MetricCard title="Celkový nájezd" value={`${formatNumber(totalMileage(data.vehicles))} km`} description="Součet evidovaných nájezdů" icon={Gauge} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Měsíční výdaje" type="bar" />
        <ChartCard title="Výdaje podle kategorií" type="pie" />
        <ChartCard title="Kumulativní vlastnické náklady" type="area" />
        <ChartCard title="Trend nákladů na palivo a energii" type="line" />
        <ChartCard title="Trend spotřeby" type="line" />
        <ChartCard title="Výdaje podle vozidel" type="bar" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          "Průměrné měsíční náklady se dopočítají ze skutečných výdajů.",
          "Podíl paliva a energie se bude počítat ze záznamů v Supabase.",
          "Nejbližší urgentní připomínka se zobrazí po vytvoření připomínek.",
        ].map((insight) => (
          <Card key={insight}>
            <CardContent className="p-5">
              <Badge variant="secondary" className="mb-3">Vehilo Insight</Badge>
              <p className="text-sm text-muted-foreground">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instalovat Vehilo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Přidejte Vehilo na domovskou obrazovku pro rychlejší přístup ke garáži.
          </p>
          <Button variant="outline">Instalovat aplikaci</Button>
        </CardContent>
      </Card>
    </div>
  );
}
