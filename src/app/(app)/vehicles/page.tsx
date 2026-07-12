import Link from "next/link";
import { Car, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";
import { calculateVehicleCost, formatCurrency, formatNumber } from "@/lib/calculations/costs";

export default async function VehiclesPage() {
  const { data } = await loadGarageData();

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
      {data.vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Zatím žádné vozidlo"
          description="Přidejte první skutečné vozidlo. Vehilo přizpůsobí pole pro palivo, energii a servis podle typu pohonu."
          actionLabel="Přidat vozidlo"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[140px_1fr]">
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
                  <Car className="size-10 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/vehicles/${vehicle.id}`} className="font-semibold hover:underline">
                        {vehicle.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </div>
                    </div>
                    <Badge variant="secondary">{formatStatus(vehicle.status)}</Badge>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>SPZ: {vehicle.license_plate ?? "Nevyplněno"}</div>
                    <div>Nájezd: {formatNumber(vehicle.current_mileage)} km</div>
                    <div>Pohon: {formatPowertrain(vehicle.powertrain_type)}</div>
                    <div>Převodovka: {formatTransmission(vehicle.transmission)}</div>
                    <div>Koupě: {vehicle.purchase_price ? formatCurrency(vehicle.purchase_price, vehicle.currency) : "Nevyplněno"}</div>
                    <div>Hodnota: {vehicle.current_value ? formatCurrency(vehicle.current_value, vehicle.currency) : "Nevyplněno"}</div>
                    <div>Náklady celkem: {formatCurrency(calculateVehicleCost(data, vehicle.id), vehicle.currency)}</div>
                    <div>Dokumenty: čeká na reálný stav</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
