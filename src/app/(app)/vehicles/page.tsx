import Link from "next/link";
import { CalendarDays, Car, Fuel, Gauge, Plus, ReceiptText, Wrench, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        title="Vozidla"
        description="Spravujte auta, elektromobily, LPG, CNG i hybridy ve své osobní garáži."
        actions={
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Přidat vozidlo
            </Link>
          </Button>
        }
      />

      {data.vehicles.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile label="Aktivní vozidla" value={String(activeVehicles.length)} icon={Car} />
          <SummaryTile label="Celkový nájezd" value={`${formatNumber(totalMileage)} km`} icon={Gauge} />
          <SummaryTile label="Archivováno" value={String(archivedVehicles)} icon={CalendarDays} />
        </div>
      ) : null}

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

function VehicleCard({ vehicle, data }: { vehicle: Vehicle; data: GarageData }) {
  const energyCount = data.energyEntries.filter((entry) => entry.vehicle_id === vehicle.id).length;
  const serviceCount = data.serviceEntries.filter((entry) => entry.vehicle_id === vehicle.id).length;
  const expenseCount = data.expenses.filter((expense) => expense.vehicle_id === vehicle.id).length;
  const documentCount = data.documents.filter((document) => document.vehicle_id === vehicle.id).length;
  const subtitle = [vehicle.brand, vehicle.model, vehicle.generation, vehicle.engine].filter(Boolean).join(" ");

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 sm:grid-cols-[180px_1fr]">
        <Link href={`/vehicles/${vehicle.id}`} className="block bg-muted">
          {vehicle.photo_url ? (
            <img
              src={vehicle.photo_url}
              alt={vehicle.name}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] h-full min-h-40 items-center justify-center">
              <Car className="size-12 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </Link>
        <div className="min-w-0 space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/vehicles/${vehicle.id}`} className="text-lg font-semibold hover:underline">
                {vehicle.name}
              </Link>
              <div className="truncate text-sm text-muted-foreground">
                {subtitle || "Bez doplňujících údajů"}
              </div>
            </div>
            <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>
              {formatStatus(vehicle.status)}
            </Badge>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <VehicleFact label="SPZ" value={vehicle.license_plate ?? "Nevyplněno"} />
            <VehicleFact label="Nájezd" value={`${formatNumber(vehicle.current_mileage)} km`} />
            <VehicleFact label="Pohon" value={formatPowertrain(vehicle.powertrain_type)} />
            <VehicleFact label="Převodovka" value={formatTransmission(vehicle.transmission)} />
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-4">
            <MiniStat icon={ReceiptText} label="Náklady" value={formatCurrency(calculateVehicleCost(data, vehicle.id), vehicle.currency)} />
            <MiniStat icon={Fuel} label="Tankování" value={String(energyCount)} />
            <MiniStat icon={Wrench} label="Servis" value={String(serviceCount)} />
            <MiniStat icon={CalendarDays} label="Dokumenty" value={String(documentCount)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/vehicles/${vehicle.id}`}>Detail</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/vehicles/${vehicle.id}/edit`}>Upravit</Link>
            </Button>
            {expenseCount > 0 ? (
              <Badge variant="secondary" className="h-8 rounded-md px-3">
                {expenseCount} výdajů
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
      <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function VehicleFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <Icon className="mb-1 size-4 text-muted-foreground" aria-hidden="true" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate font-medium">{value}</div>
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
