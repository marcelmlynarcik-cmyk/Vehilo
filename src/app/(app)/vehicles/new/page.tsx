import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add vehicle"
        description="Create a Supabase-ready vehicle profile with powertrain-specific fields."
      />
      <VehicleForm />
    </div>
  );
}
