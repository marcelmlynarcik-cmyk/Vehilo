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
                {vehicle.brand} {vehicle.model} · {vehicle.license_plate ?? "Bez SPZ"} · {formatNumber(vehicle.current_mileage)} km
              </p>
            </div>
            <Badge>{formatStatus(vehicle.status)}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Přidat tankování / nabíjení</Button>
            <Button variant="outline">Přidat výdaj</Button>
            <Button variant="outline">Přidat servis</Button>
            <Button variant="outline">Přidat připomínku</Button>
            <Button variant="ghost">Upravit vozidlo</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid h-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Přehled</TabsTrigger>
          <TabsTrigger value="expenses">Výdaje</TabsTrigger>
          <TabsTrigger value="energy">Palivo a energie</TabsTrigger>
          <TabsTrigger value="service">Servis</TabsTrigger>
          <TabsTrigger value="reminders">Připomínky</TabsTrigger>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="statistics">Statistiky</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Náklady celkem" value={formatCurrency(totalCost, vehicle.currency)} description="Skutečné vlastnické náklady" icon={ReceiptText} />
            <MetricCard title="Ztráta hodnoty" value={formatCurrency(calculateDepreciation(vehicle), vehicle.currency)} description="Koupě minus aktuální hodnota" icon={Gauge} />
            <MetricCard title="Nájezd" value={`${formatNumber(vehicle.current_mileage)} km`} description="Aktuální tachometr" icon={Car} />
            <MetricCard title="Pohon" value={formatPowertrain(vehicle.powertrain_type)} description="Režim sledování" icon={Fuel} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Stav vozidla</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {["Stav údržby", "Stav připomínek", "Stav dokumentů", "Trend nákladů"].map((label) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">Čeká na reálná data</span>
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
                  {formatTabPlaceholder(String(value))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
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

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    active: "Aktivní",
    sold: "Prodané",
    archived: "Archivované",
  };

  return labels[value] ?? value;
}

function formatTabPlaceholder(value: string) {
  const labels: Record<string, string> = {
    expenses: "Výdaje vozidla se načtou ze záznamů v Supabase.",
    energy: "Tankování a energie vozidla se načtou ze záznamů v Supabase.",
    service: "Servisní historie vozidla se načte ze záznamů v Supabase.",
    reminders: "Připomínky vozidla se načtou ze záznamů v Supabase.",
    documents: "Dokumenty vozidla se načtou ze záznamů v Supabase.",
    statistics: "Statistiky vozidla se načtou ze záznamů v Supabase.",
  };

  return labels[value] ?? "Data vozidla se načtou ze záznamů v Supabase.";
}
