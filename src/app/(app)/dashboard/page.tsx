import Link from "next/link";
import {
  Bell,
  CalendarClock,
  Car,
  FileText,
  Fuel,
  Gauge,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartCard } from "@/components/charts/basic-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { loadGarageData } from "@/lib/data/garage";
import {
  calculateAverageMonthlyCost,
  calculateCostPerKm,
  calculateCurrentMonthCost,
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
  const averageMonthlyCost = calculateAverageMonthlyCost(data);
  const currentMonthCost = calculateCurrentMonthCost(data);
  const costPerKm = calculateCostPerKm(data);
  const garageMileage = totalMileage(data.vehicles);

  return (
    <div className="space-y-6">
      <DashboardHero
        vehicleCount={data.vehicles.length}
        totalCost={formatCurrency(totalCost, currency)}
        monthlyCost={formatCurrency(currentMonthCost, currency)}
        mileage={`${formatNumber(garageMileage)} km`}
        vehicles={data.vehicles.map((vehicle) => ({ id: vehicle.id, name: vehicle.name }))}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Vozidla celkem" value={String(data.vehicles.length)} description="Aktivní záznamy v garáži" icon={Car} />
        <MetricCard title="Měsíční náklady" value={formatCurrency(currentMonthCost, currency)} description="Aktuální kalendářní měsíc" icon={ReceiptText} />
        <MetricCard title="Měsíční průměr" value={formatCurrency(averageMonthlyCost, currency)} description="Od prvního záznamu" icon={ReceiptText} />
        <MetricCard title="Celkové náklady" value={formatCurrency(totalCost, currency)} description="Výdaje, palivo a servis" icon={Gauge} />
        <MetricCard title="Cena za kilometr" value={`${formatCurrency(costPerKm, currency, 2)}/km`} description="Napříč všemi vozidly od koupě" icon={Fuel} />
        <MetricCard title="Nadcházející připomínky" value={String(countReminderStatus(data.reminders, "upcoming"))} description="Plánovaný servis a dokumenty" icon={Bell} />
        <MetricCard title="Po termínu" value={String(countReminderStatus(data.reminders, "overdue"))} description="Vyžaduje pozornost" icon={CalendarClock} />
        <MetricCard title="Dokumenty brzy expirují" value={String(data.documents.filter((document) => document.status === "expiring_soon").length)} description="Pojištění, STK/MOT a povolení" icon={FileText} />
        <MetricCard title="Celkový nájezd" value={`${formatNumber(garageMileage)} km`} description="Součet evidovaných nájezdů" icon={Gauge} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Měsíční výdaje" type="bar" valueLabel="Náklady" />
        <ChartCard title="Výdaje podle kategorií" type="pie" valueLabel="Náklady" />
        <ChartCard title="Kumulativní náklady" type="area" valueLabel="Náklady" />
        <ChartCard title="Trend nákladů na palivo a energii" type="line" valueLabel="Náklady" />
        <ChartCard title="Trend spotřeby" type="line" valueLabel="Spotřeba" />
        <ChartCard title="Výdaje podle vozidel" type="bar" valueLabel="Náklady" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          "Měsíční náklady ukazují skutečné výdaje v aktuálním kalendářním měsíci.",
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

function DashboardHero({
  vehicleCount,
  totalCost,
  monthlyCost,
  mileage,
  vehicles,
}: {
  vehicleCount: number;
  totalCost: string;
  monthlyCost: string;
  mileage: string;
  vehicles: Array<{ id: string; name: string }>;
}) {
  return (
    <section className="relative min-h-[500px] overflow-hidden rounded-[32px] border border-border bg-[var(--surface-solid)] shadow-[0_32px_90px_rgba(0,0,0,0.36)] md:min-h-[430px] lg:min-h-[470px]">
      <div
        className="absolute inset-0 bg-cover bg-[position:22%_center] md:bg-[position:18%_center] lg:bg-center"
        style={{ backgroundImage: "url('/pozadie/Garage_hero.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[rgba(2,8,12,0.26)]" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,#050B10_0%,rgba(5,11,16,0.86)_25%,rgba(5,11,16,0.18)_66%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,11,16,0.78),rgba(5,11,16,0.42)_44%,rgba(5,11,16,0.16)_100%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-[500px] flex-col justify-between gap-8 p-5 md:min-h-[430px] md:p-7 lg:min-h-[470px] lg:p-9">
        <div className="max-w-2xl pt-16 md:pt-8">
          <Badge variant="outline" className="mb-4 border-[rgba(45,212,163,0.3)] bg-[rgba(45,212,163,0.1)] text-[#9ff5dc]">
            Přehled garáže
          </Badge>
          <h1 className="max-w-2xl text-[40px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
            Všechno důležité o garáži.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Sledujte náklady, servis, palivo, energii a připomínky pro všechna vozidla na jednom místě.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Select defaultValue="Všechna vozidla">
              <SelectTrigger className="w-full bg-[rgba(8,17,23,0.82)] sm:w-60">
                <SelectValue placeholder="Vozidlo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Všechna vozidla">Všechna vozidla</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.name}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href="/vehicles/new">
                <Car className="size-4" aria-hidden="true" />
                Přidat vozidlo
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid w-full gap-3 min-[430px]:grid-cols-2 lg:max-w-4xl lg:grid-cols-4">
          <HeroStat label="Vozidla" value={String(vehicleCount)} icon={Car} tone="green" />
          <HeroStat label="Měsíční náklady" value={monthlyCost} icon={ReceiptText} tone="blue" />
          <HeroStat label="Celkové náklady" value={totalCost} icon={Gauge} tone="green" />
          <HeroStat label="Celkový nájezd" value={mileage} icon={Fuel} tone="blue" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "border-[rgba(45,212,163,0.25)] bg-[rgba(45,212,163,0.12)] text-[var(--accent)]"
      : "border-[rgba(56,189,248,0.25)] bg-[rgba(56,189,248,0.12)] text-[var(--accent-blue)]";

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(148,163,184,0.20)] bg-[rgba(10,20,27,0.74)] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[18px]">
      <span className={`flex size-10 items-center justify-center rounded-[14px] border ${toneClass}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="tabular-num truncate text-lg font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
