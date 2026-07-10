import { BatteryCharging, Fuel, Plus, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartCard } from "@/components/charts/basic-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, sumEnergyCost } from "@/lib/calculations/costs";
import { calculateCostPer100Km, calculateConsumptionPer100Km } from "@/lib/calculations/energy";
import { loadGarageData } from "@/lib/data/garage";

export default async function FuelEnergyPage() {
  const { data } = await loadGarageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palivo a energie"
        description="Vehilo se přizpůsobí benzínu, naftě, hybridům, plug-in hybridům, elektromobilům, LPG i CNG."
        actions={<Button><Plus className="mr-2 size-4" aria-hidden="true" />Přidat tankování / nabíjení</Button>}
      />
      <Alert>
        <Zap className="size-4" aria-hidden="true" />
        <AlertTitle>Vehilo přizpůsobuje sledování podle typu pohonu.</AlertTitle>
        <AlertDescription>Spotřeba se pro vyšší přesnost počítá pouze mezi plnými tankováními nebo plnými nabitími.</AlertDescription>
      </Alert>
      <div className="flex max-w-sm">
        <Select defaultValue="all">
          <SelectTrigger><SelectValue placeholder="Vozidlo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechna vozidla</SelectItem>
            {data.vehicles.map((vehicle) => <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Celkové náklady" value={formatCurrency(sumEnergyCost(data.energyEntries))} description="Palivo, LPG, CNG a nabíjení" icon={Fuel} />
        <MetricCard title="Průměrná spotřeba" value={`${calculateConsumptionPer100Km(data.energyEntries).toFixed(1)} /100 km`} description="Podle jednotky záznamu" icon={Zap} />
        <MetricCard title="Cena na 100 km" value={formatCurrency(calculateCostPer100Km(data.energyEntries))} description="Z reálných záznamů" icon={BatteryCharging} />
        <MetricCard title="Záznamy" value={String(data.energyEntries.length)} description="Tankování a nabíjení" icon={Fuel} />
      </div>
      {data.energyEntries.length === 0 ? (
        <EmptyState icon={Fuel} title="Zatím žádné záznamy paliva ani energie" description="Po přidání vozidla nabídne Vehilo správný formulář: litry, kWh nebo kg podle typu pohonu." actionLabel="Přidat tankování / nabíjení" />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Trend spotřeby" type="line" />
        <ChartCard title="Trend ceny paliva / energie" type="line" />
        <ChartCard title="Měsíční náklady" type="bar" />
      </div>
      <Card>
        <CardHeader><CardTitle>Formulář podle pohonu</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>Benzín/nafta: litry, cena za litr, plná nádrž, čerpací stanice a typ jízdy.</p>
          <p>Elektro: kWh, cena za kWh, domácí/pracovní/AC/DC nabíjení a stav baterie.</p>
          <p>Plug-in hybrid: samostatné tankování i nabíjení a kombinovaná cena na km.</p>
          <p>CNG: kg, cena za kg, kg/100 km a cena na 100 km.</p>
        </CardContent>
      </Card>
    </div>
  );
}
