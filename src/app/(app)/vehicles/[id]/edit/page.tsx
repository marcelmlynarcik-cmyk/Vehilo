import { notFound } from "next/navigation";
import { archiveVehicle, updateVehicle } from "@/app/(app)/vehicles/actions";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader } from "@/components/shared/page-header";
import { loadVehicleFormContext } from "@/lib/data/vehicles";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, vehicle } = await loadVehicleFormContext(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Upravit ${vehicle.name}`}
        description="Změny se ukládají do vašeho účtu a ovlivní dashboard, statistiky i detail vozidla."
      />
      <VehicleForm
        action={updateVehicle}
        archiveAction={archiveVehicle}
        vehicle={vehicle}
        defaultCurrency={profile?.currency ?? "CZK"}
        mode="edit"
      />
    </div>
  );
}
