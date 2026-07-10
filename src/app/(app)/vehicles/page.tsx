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
        title="Vehicles"
        description="Manage every car, EV, LPG, CNG or hybrid in your personal garage."
        actions={
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add Vehicle
            </Link>
          </Button>
        }
      />
      {data.vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Connect Supabase Auth and add your first real vehicle. Vehilo will adapt all fuel, energy and service fields to the selected powertrain."
          actionLabel="Add Vehicle"
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
                    <Badge variant="secondary">{vehicle.status}</Badge>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>Plate: {vehicle.license_plate ?? "Not set"}</div>
                    <div>Mileage: {formatNumber(vehicle.current_mileage)} km</div>
                    <div>Powertrain: {vehicle.powertrain_type.replaceAll("_", " ")}</div>
                    <div>Transmission: {vehicle.transmission ?? "Not set"}</div>
                    <div>Purchase: {vehicle.purchase_price ? formatCurrency(vehicle.purchase_price, vehicle.currency) : "Not set"}</div>
                    <div>Value: {vehicle.current_value ? formatCurrency(vehicle.current_value, vehicle.currency) : "Not set"}</div>
                    <div>Total cost: {formatCurrency(calculateVehicleCost(data, vehicle.id), vehicle.currency)}</div>
                    <div>Documents: Real status pending</div>
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
