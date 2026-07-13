import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader } from "@/components/shared/page-header";
import { createVehicle } from "@/app/(app)/vehicles/actions";
import { loadVehicleFormContext } from "@/lib/data/vehicles";

export default async function NewVehiclePage() {
  const { profile } = await loadVehicleFormContext();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nové vozidlo"
        description="Přidejte skutečné vozidlo do své garáže. Pole a jednotky se přizpůsobí typu pohonu."
      />
      <VehicleForm action={createVehicle} defaultCurrency={profile?.currency ?? "CZK"} />
    </div>
  );
}
