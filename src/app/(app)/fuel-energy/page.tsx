import { BatteryCharging, Fuel, Plus, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartCard } from "@/components/charts/basic-charts";
import { EnergyEntryForm } from "@/components/forms/energy-entry-form";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, sumEnergyCost } from "@/lib/calculations/costs";
import { calculateCostPer100Km, calculateConsumptionPer100Km } from "@/lib/calculations/energy";
import { loadGarageData } from "@/lib/data/garage";
import type { EnergyEntry, Vehicle } from "@/types/domain";
import { createEnergyEntry } from "./actions";

export default async function FuelEnergyPage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";
  const defaultDate = formatDateInput(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palivo a energie"
        description="Vehilo se přizpůsobí benzínu, naftě, hybridům, plug-in hybridům, elektromobilům, LPG i CNG."
        actions={<EnergyEntryDialog vehicles={data.vehicles} defaultDate={defaultDate} />}
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
        <MetricCard title="Celkové náklady" value={formatCurrency(sumEnergyCost(data.energyEntries), currency)} description="Palivo, LPG, CNG a nabíjení" icon={Fuel} />
        <MetricCard title="Průměrná spotřeba" value={`${calculateConsumptionPer100Km(data.energyEntries).toFixed(1)} /100 km`} description="Podle jednotky záznamu" icon={Zap} />
        <MetricCard title="Cena na 100 km" value={formatCurrency(calculateCostPer100Km(data.energyEntries), currency)} description="Z reálných záznamů" icon={BatteryCharging} />
        <MetricCard title="Záznamy" value={String(data.energyEntries.length)} description="Tankování a nabíjení" icon={Fuel} />
      </div>
      {data.energyEntries.length === 0 ? (
        <EmptyState icon={Fuel} title="Zatím žádné záznamy paliva ani energie" description="Po přidání vozidla nabídne Vehilo správný formulář: litry, kWh nebo kg podle typu pohonu." actionLabel="Přidat tankování / nabíjení" />
      ) : (
        <EnergyEntriesTable entries={data.energyEntries} vehicles={data.vehicles} currency={currency} />
      )}
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

function EnergyEntryDialog({ vehicles, defaultDate }: { vehicles: Vehicle[]; defaultDate: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Přidat tankování / nabíjení
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nový záznam paliva nebo energie</DialogTitle>
          <DialogDescription>
            První plné tankování uloží výchozí bod. Přesná spotřeba se dopočítá po dalším plném záznamu.
          </DialogDescription>
        </DialogHeader>
        <EnergyEntryForm action={createEnergyEntry} vehicles={vehicles} defaultDate={defaultDate} />
      </DialogContent>
    </Dialog>
  );
}

function EnergyEntriesTable({
  entries,
  vehicles,
  currency,
}: {
  entries: EnergyEntry[];
  vehicles: Vehicle[];
  currency: string;
}) {
  const vehicleNames = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poslední tankování a nabíjení</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Vozidlo</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Množství</TableHead>
              <TableHead className="text-right">Cena</TableHead>
              <TableHead className="text-right">Nájezd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 12).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDisplayDate(entry.date)}</TableCell>
                <TableCell>{vehicleNames.get(entry.vehicle_id) ?? "Vozidlo"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatEntryType(entry)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(entry.quantity)} {formatUnit(entry.quantity_unit)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(entry.total_price, currency)}</TableCell>
                <TableCell className="text-right">{formatNumber(entry.mileage)} km</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatDateInput(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(Number(value));
}

function formatUnit(value: string) {
  return value === "liters" ? "l" : value;
}

function formatEntryType(entry: EnergyEntry) {
  if (entry.entry_type === "charging") {
    return entry.full_charge ? "Nabíjení - plné" : "Nabíjení";
  }

  const labels: Record<string, string> = {
    fuel: "Tankování",
    lpg: "LPG",
    cng: "CNG",
  };

  const label = labels[entry.entry_type] ?? "Záznam";
  return entry.full_tank ? `${label} - plná` : label;
}
