import { CalendarClock, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartCard } from "@/components/charts/basic-charts";
import { ServiceEntryForm } from "@/components/forms/service-entry-form";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";
import type { ServiceEntry, Vehicle } from "@/types/domain";
import { createServiceEntry, deleteServiceEntry, updateServiceEntry } from "./actions";

type ServicePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ServicePage({ searchParams }: ServicePageProps) {
  const { data } = await loadGarageData();
  const query = await searchParams;
  const currency = data.profile?.currency ?? "CZK";
  const defaultDate = formatDateInput(new Date());
  const openServiceDialog = query.add === "service";
  const filters = parseServiceFilters(query);
  const filteredServiceEntries = filterServiceEntries(data.serviceEntries, filters);
  const serviceTotal = filteredServiceEntries.reduce((total, entry) => total + Number(entry.total_cost), 0);
  const latestService = filteredServiceEntries[0] ?? null;
  const largestService = filteredServiceEntries.reduce<ServiceEntry | null>(
    (largest, entry) => (largest == null || Number(entry.total_cost) > Number(largest.total_cost) ? entry : largest),
    null,
  );
  const thisYearTotal = filteredServiceEntries.reduce((total, entry) => {
    return entry.date.startsWith(String(new Date().getFullYear())) ? total + Number(entry.total_cost) : total;
  }, 0);
  const serviceTypes = uniqueSorted(data.serviceEntries.map((entry) => entry.service_type));
  const serviceYears = uniqueSorted(data.serviceEntries.map((entry) => entry.date.slice(0, 4))).reverse();
  const visibleServiceEntries = filteredServiceEntries.slice(0, 10);
  const hiddenServiceEntries = filteredServiceEntries.slice(10);
  const yearlyServiceCosts = buildYearlyServiceSeries(filteredServiceEntries);
  const serviceTypeCosts = buildServiceTypeSeries(filteredServiceEntries);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servis a údržba"
        description="Kompletní servisní historie, práce, díly, záruky, faktury a plánované úkony."
        actions={<ServiceDialog vehicles={data.vehicles} defaultDate={defaultDate} defaultOpen={openServiceDialog} />}
      />
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/service" className="grid min-w-0 gap-3 md:grid-cols-5">
            <FilterInput name="q" label="Hledání" placeholder="Popis, typ, servis" defaultValue={filters.q} />
            <FilterSelect name="vehicle" label="Vozidlo" value={filters.vehicle} allLabel="Všechna vozidla" options={data.vehicles.map((vehicle): [string, string] => [vehicle.id, vehicle.name])} />
            <FilterSelect name="type" label="Typ servisu" value={filters.type} options={serviceTypes.map((type): [string, string] => [type, type])} />
            <FilterSelect name="year" label="Rok" value={filters.year} options={serviceYears.map((year): [string, string] => [year, year])} />
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">Filtrovat</Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/service">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Servis letos" value={formatCurrency(thisYearTotal, currency)} description="Podle data servisu" icon={Wrench} />
        <MetricCard title="Celkem servis" value={formatCurrency(serviceTotal, currency)} description="Všechny servisní záznamy" icon={Wrench} />
        <MetricCard title="Poslední servis" value={latestService ? formatDisplayDate(latestService.date) : "-"} description={latestService?.description ?? "Zatím bez záznamu"} icon={CalendarClock} />
        <MetricCard title="Další servis" value="-" description="Dle připomínek" icon={Wrench} />
        <MetricCard title="Nejdražší servis" value={formatCurrency(largestService?.total_cost ?? 0, currency)} description={largestService?.description ?? "Zatím bez dat"} icon={Wrench} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Servisní náklady podle roku" type="bar" data={yearlyServiceCosts} valueLabel="Náklady" />
        <ChartCard title="Servisní náklady podle typu" type="pie" data={serviceTypeCosts} valueLabel="Náklady" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {data.serviceEntries.length === 0 ? (
          <EmptyState icon={Wrench} title="Servisní historie je prázdná" description="Po připojení Supabase zde vznikne časová osa oprav, údržby a EV kontrol." actionLabel="Přidat servis" />
        ) : filteredServiceEntries.length === 0 ? (
          <EmptyState icon={Wrench} title="Žádný servis pro tento filtr" description="Změňte filtr nebo resetujte výběr." />
        ) : (
          <Card id="records">
            <CardHeader>
              <CardTitle>Servisní záznamy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {visibleServiceEntries.map((entry) => (
                <ServiceRow key={entry.id} entry={entry} vehicles={data.vehicles} currency={currency} />
              ))}
              {hiddenServiceEntries.length > 0 ? (
                <details className="group border-t border-border pt-3">
                  <summary className="cursor-pointer list-none py-2 text-sm font-semibold text-[var(--accent)]">
                    Zobrazit dalších {hiddenServiceEntries.length} záznamů
                  </summary>
                  <div className="mt-3 grid gap-3">
                    {hiddenServiceEntries.map((entry) => (
                      <ServiceRow key={entry.id} entry={entry} vehicles={data.vehicles} currency={currency} />
                    ))}
                  </div>
                </details>
              ) : null}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle>Chytré servisní skupiny</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Olej", "Filtry", "Brzdy", "Rozvody", "Pneumatiky", "EV baterie", "Nabíjecí systém"].map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ServiceDialog({
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
        Přidat servis
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nový servisní záznam</DialogTitle>
          <DialogDescription>Uložte opravu, údržbu, díly, cenu práce a případnou záruku.</DialogDescription>
        </DialogHeader>
        <ServiceEntryForm action={createServiceEntry} vehicles={vehicles} defaultDate={defaultDate} />
      </DialogContent>
    </Dialog>
  );
}

function ServiceRow({ entry, vehicles, currency }: { entry: ServiceEntry; vehicles: Vehicle[]; currency: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-border bg-[rgba(8,17,23,0.42)] p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold">{entry.description}</div>
            <Badge variant="outline">{entry.service_type}</Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDisplayDate(entry.date)} · {vehicles.find((vehicle) => vehicle.id === entry.vehicle_id)?.name ?? "Vozidlo"} · {formatNumber(entry.mileage)} km
          </div>
          {entry.notes ? <div className="mt-2 text-sm text-muted-foreground">{entry.notes}</div> : null}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 md:flex-col md:items-end">
          <div className="text-sm font-semibold">{formatCurrency(entry.total_cost, currency)}</div>
          <div className="flex gap-2">
            <EditServiceDialog entry={entry} vehicles={vehicles} />
            <DeleteServiceDialog entry={entry} />
          </div>
        </div>
      </div>
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
      <Label htmlFor={`service-filter-${name}`} className="text-xs text-muted-foreground">{label}</Label>
      <select
        id={`service-filter-${name}`}
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

function FilterInput({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={`service-filter-${name}`} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={`service-filter-${name}`}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full min-w-0"
      />
    </div>
  );
}

function EditServiceDialog({ entry, vehicles }: { entry: ServiceEntry; vehicles: Vehicle[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="mr-2 size-4" aria-hidden="true" />
        Upravit
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upravit servis</DialogTitle>
          <DialogDescription>Změny se uloží do stejného servisního záznamu a přepočítají přehledy.</DialogDescription>
        </DialogHeader>
        <ServiceEntryForm action={updateServiceEntry} vehicles={vehicles} defaultDate={entry.date} entry={entry} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteServiceDialog({ entry }: { entry: ServiceEntry }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        Smazat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smazat servis?</DialogTitle>
          <DialogDescription>Tento servisní záznam se odstraní z historie i statistik.</DialogDescription>
        </DialogHeader>
        <form action={deleteServiceEntry} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={entry.id} />
          <Button variant="destructive" type="submit" className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Smazat servis
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDateInput(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Number(value));
}

function parseServiceFilters(query: Awaited<ServicePageProps["searchParams"]>) {
  return {
    q: getQueryValue(query.q),
    vehicle: getQueryValue(query.vehicle, "all"),
    type: getQueryValue(query.type, "all"),
    year: getQueryValue(query.year, "all"),
  };
}

function filterServiceEntries(entries: ServiceEntry[], filters: ReturnType<typeof parseServiceFilters>) {
  const q = filters.q.toLowerCase();

  return entries.filter((entry) => {
    if (filters.vehicle !== "all" && entry.vehicle_id !== filters.vehicle) {
      return false;
    }

    if (filters.type !== "all" && entry.service_type !== filters.type) {
      return false;
    }

    if (filters.year !== "all" && !entry.date.startsWith(filters.year)) {
      return false;
    }

    if (!q) {
      return true;
    }

    return [
      entry.service_type,
      entry.provider ?? "",
      entry.description,
      entry.parts_changed ?? "",
      entry.notes ?? "",
    ].some((value) => value.toLowerCase().includes(q));
  });
}

function buildYearlyServiceSeries(entries: ServiceEntry[]) {
  const grouped = new Map<string, { value: number; details: string[] }>();

  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    const group = grouped.get(year) ?? { value: 0, details: [] };
    group.value += Number(entry.total_cost);
    group.details.push(`${formatDisplayDate(entry.date)} · ${entry.service_type} · ${entry.description} · ${formatCurrency(entry.total_cost, entry.currency)}`);
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

function buildServiceTypeSeries(entries: ServiceEntry[]) {
  return buildGroupedSeries(entries, (entry) => entry.service_type, (entry) => Number(entry.total_cost));
}

function buildGroupedSeries<T>(items: T[], getName: (item: T) => string, getValue: (item: T) => number) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    const name = getName(item);
    grouped.set(name, (grouped.get(name) ?? 0) + getValue(item));
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "cs-CZ"))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "cs-CZ"));
}

function getQueryValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}
