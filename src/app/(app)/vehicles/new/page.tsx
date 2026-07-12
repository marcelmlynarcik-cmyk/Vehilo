import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader } from "@/components/shared/page-header";
import { createVehicle } from "@/app/(app)/vehicles/actions";
import { loadGarageData } from "@/lib/data/garage";

export default async function NewVehiclePage() {
  const { data } = await loadGarageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nové vozidlo"
        description="Přidejte skutečné vozidlo do své garáže. Pole a jednotky se přizpůsobí typu pohonu."
      />
      <VehicleForm action={createVehicle} defaultCurrency={data.profile?.currency ?? "CZK"} />
    </div>
  );
}
