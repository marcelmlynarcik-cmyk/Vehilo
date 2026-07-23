import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BatteryCharging, Fuel, Gauge, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { formatCurrency, formatNumber } from "@/lib/calculations/costs";
import { loadEnergyEntryDetailData } from "@/lib/data/records";
import type { EnergyEntry } from "@/types/domain";

export default async function FuelEnergyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadEnergyEntryDetailData(id);

  if (!detail) {
    notFound();
  }

  const { entry, vehicle } = detail;
  const location = entry.fuel_station ?? entry.charging_location ?? "Nevyplněno";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/fuel-energy#records">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zpět na palivo a energii
          </Link>
        </Button>
        <Badge variant="secondary" className="w-fit">{formatEntryType(entry)}</Badge>
      </div>

      <section className="rounded-[28px] border border-border bg-[rgba(8,17,23,0.66)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">{formatDisplayDate(entry.date)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{formatEntryType(entry)}</h1>
          <p className="mt-3 text-muted-foreground">
            {vehicle ? vehicle.name : "Vozidlo"} · {formatCurrency(entry.total_price, vehicle?.currency ?? "CZK")}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Celkem" value={formatCurrency(entry.total_price, vehicle?.currency ?? "CZK")} description="Cena záznamu" icon={Fuel} />
        <MetricCard title="Množství" value={`${formatNumber(entry.quantity)} ${formatUnit(entry.quantity_unit)}`} description="Uložené množství" icon={BatteryCharging} />
        <MetricCard title="Cena za jednotku" value={entry.unit_price == null ? "-" : formatCurrency(entry.unit_price, vehicle?.currency ?? "CZK", 2)} description={formatUnit(entry.quantity_unit)} icon={Fuel} />
        <MetricCard title="Nájezd" value={`${formatNumber(entry.mileage)} km`} description="Při záznamu" icon={Gauge} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail záznamu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Datum" value={formatDisplayDate(entry.date)} />
          <DetailRow label="Vozidlo" value={vehicle?.name ?? "Vozidlo"} />
          <DetailRow label="Typ" value={formatEntryType(entry)} />
          <DetailRow label="Místo" value={location} />
          <DetailRow label="Plná nádrž / nabití" value={entry.full_tank || entry.full_charge ? "Ano" : "Ne"} />
          <DetailRow label="Typ jízdy" value={formatDrivingType(entry.driving_type)} />
          <DetailRow label="Nabíjení" value={formatChargingType(entry.charging_type)} />
          <DetailRow label="Poskytovatel" value={entry.charging_provider} />
        </CardContent>
      </Card>

      {entry.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Poznámky</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{entry.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[14px] border border-border bg-muted/35 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {label === "Místo" ? <MapPin className="size-3" aria-hidden="true" /> : null}
        {label}
      </div>
      <div className="mt-1 font-semibold text-white">{value || "Nevyplněno"}</div>
    </div>
  );
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatUnit(value: string) {
  const labels: Record<string, string> = {
    liters: "l",
    gallons: "gal",
    kWh: "kWh",
    kg: "kg",
  };

  return labels[value] ?? value;
}

function formatEntryType(entry: EnergyEntry) {
  if (entry.entry_type === "charging") {
    return entry.full_charge ? "Nabíjení - plné" : "Nabíjení";
  }

  const labels: Record<string, string> = {
    fuel: "Tankování",
    lpg: "LPG",
    cng: "CNG",
  };

  const label = labels[entry.entry_type] ?? "Záznam";
  return entry.full_tank ? `${label} - plná` : label;
}

function formatDrivingType(value: string | null) {
  const labels: Record<string, string> = {
    city: "Město",
    mixed: "Kombinovaně",
    highway: "Dálnice",
    long_trip: "Delší trasa",
  };

  return value ? (labels[value] ?? value) : null;
}

function formatChargingType(value: string | null) {
  const labels: Record<string, string> = {
    home: "Domácí",
    workplace: "Práce",
    public_ac: "Veřejné AC",
    public_dc: "Veřejné DC",
    other: "Jiné",
  };

  return value ? (labels[value] ?? value) : null;
}
