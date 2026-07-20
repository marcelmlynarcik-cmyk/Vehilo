import { BatteryCharging, Fuel, Pencil, Plus, Trash2, Zap } from "lucide-react";
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
import {
  buildConsumptionTrendSeries,
  buildMonthlyCostPer100KmSeries,
  buildMonthlyEnergyCostSeries,
  buildMonthlyUnitPriceSeries,
  calculateCostPer100Km,
  calculateConsumptionSummaries,
  type ConsumptionSummary,
} from "@/lib/calculations/energy";
import { loadGarageData } from "@/lib/data/garage";
import type { EnergyEntry, Vehicle } from "@/types/domain";
import { createEnergyEntry, deleteEnergyEntry, updateEnergyEntry } from "./actions";

type FuelEnergyPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function FuelEnergyPage({ searchParams }: FuelEnergyPageProps) {
  const { data } = await loadGarageData();
  const query = await searchParams;
  const currency = data.profile?.currency ?? "CZK";
  const defaultDate = formatDateInput(new Date());
  const openEnergyDialog = query.add === "energy";
  const consumptionSummaries = calculateConsumptionSummaries(data.energyEntries);
  const consumptionTrend = buildConsumptionTrendSeries(data.energyEntries);
  const monthlyCostPer100Km = buildMonthlyCostPer100KmSeries(data.energyEntries);
  const monthlyUnitPrices = buildMonthlyUnitPriceSeries(data.energyEntries);
  const monthlyCosts = buildMonthlyEnergyCostSeries(data.energyEntries);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palivo a energie"
        description="Vehilo se přizpůsobí benzínu, naftě, hybridům, plug-in hybridům, elektromobilům, LPG i CNG."
        actions={<EnergyEntryDialog vehicles={data.vehicles} defaultDate={defaultDate} defaultOpen={openEnergyDialog} />}
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
        <MetricCard title="Průměrná spotřeba" value={formatConsumptionSummaries(consumptionSummaries)} description="Mezi plnými záznamy" icon={Zap} />
        <MetricCard title="Cena na 100 km" value={formatCurrency(calculateCostPer100Km(data.energyEntries), currency)} description="Z reálných záznamů" icon={BatteryCharging} />
        <MetricCard title="Záznamy" value={String(data.energyEntries.length)} description="Tankování a nabíjení" icon={Fuel} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Spotřeba mezi plnými záznamy"
          type="line"
          data={consumptionTrend}
          emptyLabel="Čeká na další plnou nádrž"
        />
        <ChartCard
          title="Cena na 100 km"
          type="line"
          data={monthlyCostPer100Km}
          emptyLabel="Čeká na měsíce s více záznamy"
        />
        <ChartCard title="Měsíční náklady" type="bar" data={monthlyCosts} />
        <ChartCard
          title="Cena za litr / kWh"
          type="line"
          data={monthlyUnitPrices}
          emptyLabel="Čeká na záznamy s množstvím"
        />
      </div>
      {data.energyEntries.length === 0 ? (
        <div id="records">
          <EmptyState icon={Fuel} title="Zatím žádné záznamy paliva ani energie" description="Po přidání vozidla nabídne Vehilo správný formulář: litry, kWh nebo kg podle typu pohonu." actionLabel="Přidat tankování / nabíjení" />
        </div>
      ) : (
        <EnergyEntriesTable entries={data.energyEntries} vehicles={data.vehicles} currency={currency} />
      )}
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

function EnergyEntryDialog({
  vehicles,
  defaultDate,
  defaultOpen,
}: {
  vehicles: Vehicle[];
  defaultDate: string;
  defaultOpen: boolean;
}) {
  return (
    <Dialog defaultOpen={defaultOpen}>
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
  const visibleEntries = entries.slice(0, 10);
  const hiddenEntries = entries.slice(10);

  return (
    <Card id="records">
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
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEntries.map((entry) => (
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
                <TableCell className="flex justify-end gap-2">
                  <EditEnergyEntryDialog entry={entry} vehicles={vehicles} />
                  <DeleteEnergyEntryDialog entry={entry} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {hiddenEntries.length > 0 ? (
          <details className="group border-t border-border">
            <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-[var(--accent)]">
              Zobrazit dalších {hiddenEntries.length} záznamů
            </summary>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Vozidlo</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-right">Množství</TableHead>
                  <TableHead className="text-right">Cena</TableHead>
                  <TableHead className="text-right">Nájezd</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hiddenEntries.map((entry) => (
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
                    <TableCell className="flex justify-end gap-2">
                      <EditEnergyEntryDialog entry={entry} vehicles={vehicles} />
                      <DeleteEnergyEntryDialog entry={entry} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EditEnergyEntryDialog({ entry, vehicles }: { entry: EnergyEntry; vehicles: Vehicle[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="mr-2 size-4" aria-hidden="true" />
        Upravit
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upravit záznam</DialogTitle>
          <DialogDescription>
            Změny se uloží do stejného záznamu a přepočítají celkovou cenu podle množství a ceny za jednotku.
          </DialogDescription>
        </DialogHeader>
        <EnergyEntryForm action={updateEnergyEntry} vehicles={vehicles} defaultDate={entry.date} entry={entry} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteEnergyEntryDialog({ entry }: { entry: EnergyEntry }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        Smazat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smazat záznam?</DialogTitle>
          <DialogDescription>
            Tento záznam paliva nebo energie se odstraní ze statistik a historie vozidla.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteEnergyEntry} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={entry.id} />
          <Button variant="destructive" type="submit" className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Smazat záznam
          </Button>
        </form>
      </DialogContent>
    </Dialog>
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

function formatConsumptionSummaries(summaries: ConsumptionSummary[]) {
  if (summaries.length === 0) {
    return "0 /100 km";
  }

  return summaries
    .map((summary) => `${summary.value.toFixed(1)} ${formatUnit(summary.unit)}/100 km`)
    .join(" + ");
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
