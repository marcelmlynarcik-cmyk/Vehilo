import { notFound } from "next/navigation";
import { Bell, Car, FileText, Fuel, Gauge, ReceiptText, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/shared/metric-card";
import { calculateDepreciation, calculateVehicleCost, formatCurrency, formatNumber } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await loadGarageData();
  const vehicle = data.vehicles.find((item) => item.id === id);

  if (!vehicle) {
    notFound();
  }

  const totalCost = calculateVehicleCost(data, vehicle.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
          <Car className="size-14 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{vehicle.name}</h1>
              <p className="text-muted-foreground">
                {vehicle.brand} {vehicle.model} · {vehicle.license_plate ?? "No plate"} · {formatNumber(vehicle.current_mileage)} km
              </p>
            </div>
            <Badge>{vehicle.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Add fuel / charging</Button>
            <Button variant="outline">Add expense</Button>
            <Button variant="outline">Add service</Button>
            <Button variant="outline">Add reminder</Button>
            <Button variant="ghost">Edit vehicle</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid h-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="energy">Fuel & Energy</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Total cost" value={formatCurrency(totalCost, vehicle.currency)} description="Real ownership cost" icon={ReceiptText} />
            <MetricCard title="Depreciation" value={formatCurrency(calculateDepreciation(vehicle), vehicle.currency)} description="Purchase minus current value" icon={Gauge} />
            <MetricCard title="Mileage" value={`${formatNumber(vehicle.current_mileage)} km`} description="Current odometer" icon={Car} />
            <MetricCard title="Powertrain" value={vehicle.powertrain_type.replaceAll("_", " ")} description="Adaptive tracking mode" icon={Fuel} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Health</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {["Maintenance status", "Reminder status", "Document status", "Cost trend"].map((label) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">Pending real data</span>
                  </div>
                  <Progress value={0} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        {[
          ["expenses", ReceiptText],
          ["energy", Fuel],
          ["service", Wrench],
          ["reminders", Bell],
          ["documents", FileText],
          ["statistics", Gauge],
        ].map(([value, Icon]) => (
          <TabsContent key={String(value)} value={String(value)}>
            <Card>
              <CardContent className="flex min-h-56 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                <div>
                  <Icon className="mx-auto mb-3 size-8" aria-hidden="true" />
                  Vehicle-specific {String(value)} will load from Supabase records.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
