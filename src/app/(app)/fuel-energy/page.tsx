import { BatteryCharging, Fuel, Pencil, Plus, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  const filters = parseEnergyFilters(query);
  const filteredEnergyEntries = filterEnergyEntries(data.energyEntries, filters);
  const consumptionSummaries = calculateConsumptionSummaries(filteredEnergyEntries);
  const consumptionTrend = buildConsumptionTrendSeries(filteredEnergyEntries);
  const monthlyCostPer100Km = buildMonthlyCostPer100KmSeries(filteredEnergyEntries);
  const monthlyUnitPrices = buildMonthlyUnitPriceSeries(filteredEnergyEntries);
  const monthlyCosts = buildMonthlyEnergyCostSeries(filteredEnergyEntries);
  const yearlyCosts = buildYearlyEnergyCostSeries(filteredEnergyEntries, currency);
  const typeCosts = buildEnergyTypeCostSeries(filteredEnergyEntries);
  const vehicleCosts = buildVehicleEnergyCostSeries(filteredEnergyEntries, data.vehicles);
  const unitPriceTitle = formatUnitPriceTitle(filteredEnergyEntries);
  const energyYears = uniqueSorted(data.energyEntries.map((entry) => entry.date.slice(0, 4))).reverse();
  const energyTypes = uniqueSorted(data.energyEntries.map((entry) => entry.entry_type));

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
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/fuel-energy" className="grid min-w-0 gap-3 md:grid-cols-4">
            <FilterSelect
              name="vehicle"
              label="Vozidlo"
              value={filters.vehicle}
              allLabel="Všechna vozidla"
              options={data.vehicles.map((vehicle): [string, string] => [vehicle.id, vehicle.name])}
            />
            <FilterSelect
              name="type"
              label="Typ záznamu"
              value={filters.type}
              options={energyTypes.map((type): [string, string] => [type, formatEntryTypeLabel(type)])}
            />
            <FilterSelect
              name="year"
              label="Rok"
              value={filters.year}
              options={energyYears.map((year): [string, string] => [year, year])}
            />
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">Filtrovat</Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/fuel-energy">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Celkové náklady" value={formatCurrency(sumEnergyCost(filteredEnergyEntries), currency)} description="Palivo, LPG, CNG a nabíjení" icon={Fuel} />
        <MetricCard title="Průměrná spotřeba" value={formatConsumptionSummaries(consumptionSummaries)} description="Mezi plnými záznamy" icon={Zap} />
        <MetricCard title="Cena na 100 km" value={formatCurrency(calculateCostPer100Km(filteredEnergyEntries), currency)} description="Z reálných záznamů" icon={BatteryCharging} />
        <MetricCard title="Záznamy" value={String(filteredEnergyEntries.length)} description="Tankování a nabíjení" icon={Fuel} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Spotřeba mezi plnými záznamy"
          type="line"
          data={consumptionTrend}
          emptyLabel="Čeká na další plnou nádrž"
          valueLabel="Spotřeba"
        />
        <ChartCard
          title="Cena na 100 km"
          type="line"
          data={monthlyCostPer100Km}
          emptyLabel="Čeká na měsíce s více záznamy"
          valueLabel="Náklady"
        />
        <ChartCard title="Měsíční náklady" type="bar" data={monthlyCosts} valueLabel="Náklady" />
        <ChartCard
          title={unitPriceTitle}
          type="line"
          data={monthlyUnitPrices}
          emptyLabel="Čeká na záznamy s množstvím"
          valueLabel="Cena za jednotku"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Náklady podle roku" type="bar" data={yearlyCosts} valueLabel="Náklady" />
        <ChartCard title="Náklady podle typu" type="pie" data={typeCosts} valueLabel="Náklady" />
        <ChartCard title="Náklady podle vozidla" type="bar" data={vehicleCosts} valueLabel="Náklady" />
      </div>
      {data.energyEntries.length === 0 ? (
        <div id="records">
          <EmptyState icon={Fuel} title="Zatím žádné záznamy paliva ani energie" description="Po přidání vozidla nabídne Vehilo správný formulář: litry, kWh nebo kg podle typu pohonu." actionLabel="Přidat tankování / nabíjení" />
        </div>
      ) : filteredEnergyEntries.length === 0 ? (
        <div id="records">
          <EmptyState icon={Fuel} title="Žádné záznamy pro toto vozidlo" description="Změňte filtr nebo přidejte tankování či nabíjení." />
        </div>
      ) : (
        <EnergyEntriesTable entries={filteredEnergyEntries} vehicles={data.vehicles} currency={currency} />
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

function FilterSelect({
  name,
  label,
  value,
  options,
  allLabel = "Všechny",
}: {
  name: string;
  label: string;
  value: string;
  options: Array<[string, string]>;
  allLabel?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={`fuel-energy-filter-${name}`} className="text-xs text-muted-foreground">{label}</Label>
      <select
        id={`fuel-energy-filter-${name}`}
        name={name}
        defaultValue={value}
        aria-label={label}
        className="h-12 w-full min-w-0 rounded-[14px] border border-[rgba(148,163,184,0.34)] bg-[rgba(13,23,30,0.98)] px-3.5 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-colors hover:border-[rgba(148,163,184,0.5)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <option value="all">{allLabel}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
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
                <TableCell>
                  <Link href={`/fuel-energy/${entry.id}`} className="text-[var(--accent)] hover:underline">
                    {formatDisplayDate(entry.date)}
                  </Link>
                </TableCell>
                <TableCell>{vehicleNames.get(entry.vehicle_id) ?? "Vozidlo"}</TableCell>
                <TableCell>
                  <Link href={`/fuel-energy/${entry.id}`} className="hover:text-[var(--accent)]">
                    <Badge variant="outline">{formatEntryType(entry)}</Badge>
                  </Link>
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
                    <TableCell>
                      <Link href={`/fuel-energy/${entry.id}`} className="text-[var(--accent)] hover:underline">
                        {formatDisplayDate(entry.date)}
                      </Link>
                    </TableCell>
                    <TableCell>{vehicleNames.get(entry.vehicle_id) ?? "Vozidlo"}</TableCell>
                    <TableCell>
                        <Link href={`/fuel-energy/${entry.id}`} className="hover:text-[var(--accent)]">
                          <Badge variant="outline">{formatEntryType(entry)}</Badge>
                        </Link>
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
  const labels: Record<string, string> = {
    liters: "l",
    gallons: "gal",
    kWh: "kWh",
    kg: "kg",
  };

  return labels[value] ?? value;
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

  const label = formatEntryTypeLabel(entry.entry_type);
  return entry.full_tank ? `${label} - plná` : label;
}

function formatEntryTypeLabel(entryType: string) {
  const labels: Record<string, string> = {
    charging: "Nabíjení",
    fuel: "Palivo",
    lpg: "LPG",
    cng: "CNG",
  };

  return labels[entryType] ?? "Záznam";
}

function formatUnitPriceTitle(entries: EnergyEntry[]) {
  const units = [...new Set(entries.map((entry) => entry.quantity_unit))].sort();

  if (units.length === 0) {
    return "Cena za jednotku";
  }

  const labels = units.map((unit) => {
    if (unit === "liters") {
      return "litr";
    }

    if (unit === "kWh") {
      return "kWh";
    }

    if (unit === "kg") {
      return "kg";
    }

    return "galon";
  });

  return `Cena za ${labels.join(" / ")}`;
}

function getQueryValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parseEnergyFilters(query: Awaited<FuelEnergyPageProps["searchParams"]>) {
  return {
    vehicle: getQueryValue(query.vehicle, "all"),
    type: getQueryValue(query.type, "all"),
    year: getQueryValue(query.year, "all"),
  };
}

function filterEnergyEntries(entries: EnergyEntry[], filters: ReturnType<typeof parseEnergyFilters>) {
  return entries.filter((entry) => {
    if (filters.vehicle !== "all" && entry.vehicle_id !== filters.vehicle) {
      return false;
    }

    if (filters.type !== "all" && entry.entry_type !== filters.type) {
      return false;
    }

    if (filters.year !== "all" && !entry.date.startsWith(filters.year)) {
      return false;
    }

    return true;
  });
}

function buildYearlyEnergyCostSeries(entries: EnergyEntry[], currency: string) {
  const grouped = new Map<string, { value: number; details: string[] }>();

  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    const group = grouped.get(year) ?? { value: 0, details: [] };
    group.value += Number(entry.total_price);
    group.details.push(`${formatDisplayDate(entry.date)} · ${formatEntryTypeLabel(entry.entry_type)} · ${formatCurrency(entry.total_price, currency)}`);
    grouped.set(year, group);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "cs-CZ"))
    .map(([name, group]) => ({
      name,
      value: Math.round(group.value * 100) / 100,
      details: group.details,
    }));
}

function buildEnergyTypeCostSeries(entries: EnergyEntry[]) {
  return buildGroupedEnergySeries(entries, (entry) => formatEntryTypeLabel(entry.entry_type));
}

function buildVehicleEnergyCostSeries(entries: EnergyEntry[], vehicles: Vehicle[]) {
  const vehicleNames = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle.name]));

  return buildGroupedEnergySeries(entries, (entry) => vehicleNames.get(entry.vehicle_id) ?? "Vozidlo");
}

function buildGroupedEnergySeries(entries: EnergyEntry[], getName: (entry: EnergyEntry) => string) {
  const grouped = new Map<string, number>();

  for (const entry of entries) {
    const name = getName(entry);
    grouped.set(name, (grouped.get(name) ?? 0) + Number(entry.total_price));
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "cs-CZ"))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "cs-CZ"));
}
