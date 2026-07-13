import Link from "next/link";
import {
  Archive,
  Car,
  CarFront,
  FileText,
  Fuel,
  Gauge,
  Hash,
  Plus,
  ReceiptText,
  Settings2,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { loadGarageData } from "@/lib/data/garage";
import { calculateVehicleCost, formatCurrency, formatNumber } from "@/lib/calculations/costs";
import type { GarageData, Vehicle } from "@/types/domain";

export default async function VehiclesPage() {
  const { data } = await loadGarageData();
  const activeVehicles = data.vehicles.filter((vehicle) => vehicle.status !== "archived");
  const archivedVehicles = data.vehicles.length - activeVehicles.length;
  const totalMileage = data.vehicles.reduce((total, vehicle) => total + vehicle.current_mileage, 0);

  return (
    <div className="space-y-6">
      <VehiclesHero
        activeVehicles={activeVehicles.length}
        archivedVehicles={archivedVehicles}
        totalMileage={totalMileage}
      />

      {data.vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Zatím žádné vozidlo"
          description="Přidejte první skutečné vozidlo. Vehilo přizpůsobí pole pro palivo, energii a servis podle typu pohonu."
          actionLabel="Přidat vozidlo"
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}

function VehiclesHero({
  activeVehicles,
  archivedVehicles,
  totalMileage,
}: {
  activeVehicles: number;
  archivedVehicles: number;
  totalMileage: number;
}) {
  return (
    <section className="relative min-h-[500px] overflow-hidden rounded-[32px] border border-border bg-[var(--surface-solid)] shadow-[0_32px_90px_rgba(0,0,0,0.36)] md:min-h-[430px] lg:min-h-[470px]">
      <div
        className="absolute inset-0 bg-cover bg-[position:16%_center] md:bg-[position:12%_center] lg:bg-left"
        style={{ backgroundImage: "url('/pozadie/vehilo-garage-hero.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[rgba(2,8,12,0.28)]" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,#050B10_0%,rgba(5,11,16,0.82)_26%,rgba(5,11,16,0.18)_65%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,11,16,0.12),rgba(5,11,16,0.50))]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-[500px] flex-col justify-between gap-8 p-5 md:min-h-[430px] md:p-7 lg:min-h-[470px] lg:items-end lg:p-9">
        <div className="max-w-xl self-end pt-20 text-right md:pt-12 lg:pt-6">
          <Badge variant="outline" className="mb-4 border-[rgba(45,212,163,0.3)] bg-[rgba(45,212,163,0.1)] text-[#9ff5dc]">
            Osobní garáž
          </Badge>
          <h1 className="text-[42px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
            Vozidla
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Spravujte auta, elektromobily, LPG, CNG i hybridy ve své osobní garáži.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/vehicles/new">
              <Plus className="size-5" aria-hidden="true" />
              Přidat vozidlo
            </Link>
          </Button>
        </div>
        <div className="grid w-full gap-3 min-[430px]:grid-cols-3 lg:max-w-3xl">
          <SummaryTile label="Aktivní vozidla" value={String(activeVehicles)} icon={CarFront} tone="green" />
          <SummaryTile label="Celkový nájezd" value={`${formatNumber(totalMileage)} km`} icon={Gauge} tone="blue" />
          <SummaryTile label="Archivováno" value={String(archivedVehicles)} icon={Archive} tone="amber" />
        </div>
      </div>
    </section>
  );
}

function VehicleCard({ vehicle, data }: { vehicle: Vehicle; data: GarageData }) {
  const energyCount = data.energyEntries.filter((entry) => entry.vehicle_id === vehicle.id).length;
  const serviceCount = data.serviceEntries.filter((entry) => entry.vehicle_id === vehicle.id).length;
  const expenseCount = data.expenses.filter((expense) => expense.vehicle_id === vehicle.id).length;
  const documentCount = data.documents.filter((document) => document.vehicle_id === vehicle.id).length;
  const subtitle = [vehicle.brand, vehicle.model, vehicle.generation, vehicle.engine].filter(Boolean).join(" ");

  return (
    <Card className="overflow-hidden rounded-[26px]">
      <CardContent className="p-0">
        <div className="space-y-5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-4">
              <Link href={`/vehicles/${vehicle.id}`} className="hidden size-16 overflow-hidden rounded-[18px] border border-border bg-muted sm:block" aria-label={`Detail ${vehicle.name}`}>
                {vehicle.photo_url ? (
                  <img src={vehicle.photo_url} alt={vehicle.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Car className="size-7 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/vehicles/${vehicle.id}`} className="text-xl font-bold tracking-tight text-white hover:text-[var(--accent)]">
                  {vehicle.name}
                </Link>
                <div className="mt-1 truncate text-sm text-muted-foreground">
                  {subtitle || "Bez doplňujících údajů"}
                </div>
              </div>
            </div>
            <Badge variant={vehicle.status === "active" ? "default" : "secondary"} className="shrink-0">
              {formatStatus(vehicle.status)}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <VehicleFact icon={Hash} label="SPZ" value={vehicle.license_plate ?? "Nevyplněno"} />
            <VehicleFact icon={Gauge} label="Nájezd" value={`${formatNumber(vehicle.current_mileage)} km`} />
            <VehicleFact icon={vehicle.powertrain_type === "electric" ? Zap : Fuel} label="Pohon" value={formatPowertrain(vehicle.powertrain_type)} />
            <VehicleFact icon={Settings2} label="Převodovka" value={formatTransmission(vehicle.transmission)} />
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <MiniStat icon={ReceiptText} label="Náklady" value={formatCurrency(calculateVehicleCost(data, vehicle.id), vehicle.currency)} tone="green" />
            <MiniStat icon={Fuel} label="Tankování" value={String(energyCount)} tone="blue" />
            <MiniStat icon={Wrench} label="Servis" value={String(serviceCount)} tone="amber" />
            <MiniStat icon={FileText} label="Dokumenty" value={String(documentCount)} tone="purple" />
          </div>

          <div className="grid grid-cols-2 rounded-[20px] border border-border bg-[rgba(8,17,23,0.72)] p-1">
            <Button asChild size="sm" className="h-11 rounded-[16px]">
              <Link href={`/vehicles/${vehicle.id}`}>Detail</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-11 rounded-[16px]">
              <Link href={`/vehicles/${vehicle.id}/edit`}>Upravit</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "amber";
}) {
  const toneClass = {
    green: "border-[rgba(45,212,163,0.25)] bg-[rgba(45,212,163,0.12)] text-[var(--accent)]",
    blue: "border-[rgba(56,189,248,0.25)] bg-[rgba(56,189,248,0.12)] text-[var(--accent-blue)]",
    amber: "border-[rgba(246,185,59,0.28)] bg-[rgba(246,185,59,0.12)] text-[var(--warning)]",
  }[tone];

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

function VehicleFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center gap-3 rounded-[14px] bg-[rgba(8,17,23,0.48)] px-3">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="ml-auto truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "green" | "blue" | "amber" | "purple";
}) {
  const toneClass = {
    green: "text-[var(--accent)]",
    blue: "text-[var(--accent-blue)]",
    amber: "text-[var(--warning)]",
    purple: "text-[var(--purple)]",
  }[tone];

  return (
    <div className="min-h-[92px] rounded-[16px] border border-border bg-[rgba(8,17,23,0.56)] p-3">
      <Icon className={`mb-2 size-4 ${toneClass}`} aria-hidden="true" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="tabular-num mt-1 truncate font-bold text-white">{value}</div>
    </div>
  );
}

function formatPowertrain(value: string) {
  const labels: Record<string, string> = {
    petrol: "Benzín",
    diesel: "Nafta",
    hybrid: "Hybrid",
    plug_in_hybrid: "Plug-in hybrid",
    electric: "Elektro",
    lpg: "LPG",
    cng: "CNG",
  };

  return labels[value] ?? value;
}

function formatTransmission(value: string | null) {
  if (value === "manual") {
    return "Manuál";
  }

  if (value === "automatic") {
    return "Automat";
  }

  return "Nevyplněno";
}

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    active: "Aktivní",
    sold: "Prodané",
    archived: "Archivované",
  };

  return labels[value] ?? value;
}
