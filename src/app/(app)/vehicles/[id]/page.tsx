import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Bell, Car, FileText, Fuel, Gauge, Pencil, ReceiptText, Wrench, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/shared/metric-card";
import { calculateDepreciation, calculateVehicleCost, drivenMileage, formatCurrency, formatNumber } from "@/lib/calculations/costs";
import { loadVehicleDetailData } from "@/lib/data/vehicles";
import type { EnergyEntry, Expense, ServiceEntry, VehicleDocument } from "@/types/domain";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadVehicleDetailData(id);

  if (!detail) {
    notFound();
  }

  const { data, vehicle } = detail;
  const totalCost = calculateVehicleCost(data, vehicle.id);
  const expenses = data.expenses.filter((entry) => entry.vehicle_id === vehicle.id);
  const energyEntries = data.energyEntries.filter((entry) => entry.vehicle_id === vehicle.id);
  const serviceEntries = data.serviceEntries.filter((entry) => entry.vehicle_id === vehicle.id);
  const reminders = data.reminders.filter((entry) => entry.vehicle_id === vehicle.id);
  const documents = data.documents.filter((entry) => entry.vehicle_id === vehicle.id);
  const subtitle = [vehicle.brand, vehicle.model, vehicle.generation, vehicle.engine].filter(Boolean).join(" ");
  const drivenSincePurchase = drivenMileage(vehicle);
  const costPerKm = drivenSincePurchase > 0 ? totalCost / drivenSincePurchase : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-[28px] border border-border bg-[rgba(8,17,23,0.66)] p-4 shadow-[var(--shadow-card)] backdrop-blur-[18px] lg:grid-cols-[320px_1fr] lg:p-5">
        <div className="overflow-hidden rounded-[24px] border border-border bg-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {vehicle.photo_url ? (
            <img src={vehicle.photo_url} alt={vehicle.name} className="aspect-[4/3] h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center">
              <Car className="size-16 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{vehicle.name}</h1>
                  <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>
                    {formatStatus(vehicle.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {subtitle || "Bez doplňujících údajů"} · {vehicle.license_plate ?? "Bez SPZ"} · {formatNumber(vehicle.current_mileage)} km
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/vehicles/${vehicle.id}/edit`}>
                  <Pencil className="mr-2 size-4" aria-hidden="true" />
                  Upravit
                </Link>
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <HeroFact label="Pohon" value={formatPowertrain(vehicle.powertrain_type)} />
              <HeroFact label="Převodovka" value={formatTransmission(vehicle.transmission)} />
              <HeroFact label="VIN" value={vehicle.vin ?? "Doplnit později"} />
              <HeroFact label="Koupě" value={formatDate(vehicle.purchase_date)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/fuel-energy">Přidat tankování</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/expenses">Přidat výdaj</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/service">Přidat servis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reminders">Přidat připomínku</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Náklady celkem" value={formatCurrency(totalCost, vehicle.currency)} description="Výdaje, palivo, servis a ztráta hodnoty" icon={ReceiptText} />
        <MetricCard title="Cena za km" value={`${formatCurrency(costPerKm, vehicle.currency, 2)}/km`} description={`${formatNumber(drivenSincePurchase)} km od koupě`} icon={Gauge} />
        <MetricCard title="Servisních záznamů" value={String(serviceEntries.length)} description="Historie údržby a oprav" icon={Wrench} />
        <MetricCard title="Tankování" value={String(energyEntries.length)} description={formatPowertrain(vehicle.powertrain_type)} icon={Fuel} />
      </div>

      <Tabs defaultValue="overview">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
          <TabsList className="flex h-auto min-w-max gap-1 rounded-[18px] border border-border bg-[rgba(8,17,23,0.72)] p-1 [&_[data-slot=tabs-trigger]]:h-11 [&_[data-slot=tabs-trigger]]:shrink-0 [&_[data-slot=tabs-trigger]]:px-4 md:grid md:min-w-0 md:grid-cols-4 md:[&_[data-slot=tabs-trigger]]:px-2 lg:grid-cols-7">
          <TabsTrigger value="overview">Přehled</TabsTrigger>
          <TabsTrigger value="expenses">Výdaje</TabsTrigger>
          <TabsTrigger value="energy">Palivo</TabsTrigger>
          <TabsTrigger value="service">Servis</TabsTrigger>
          <TabsTrigger value="reminders">Připomínky</TabsTrigger>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="statistics">Statistiky</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Profil vozidla</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Značka" value={vehicle.brand} />
                <DetailRow label="Model" value={vehicle.model} />
                <DetailRow label="Generace" value={vehicle.generation} />
                <DetailRow label="Výbava" value={vehicle.trim} />
                <DetailRow label="Karoserie" value={formatBodyType(vehicle.body_type)} />
                <DetailRow label="Motor" value={vehicle.engine} />
                <DetailRow label="Výkon" value={vehicle.power} />
                <DetailRow label="Pojišťovna" value={vehicle.insurance_provider} />
                <DetailRow label="Kupní cena" value={vehicle.purchase_price == null ? null : formatCurrency(vehicle.purchase_price, vehicle.currency)} />
                <DetailRow label="Aktuální hodnota" value={vehicle.current_value == null ? null : formatCurrency(vehicle.current_value, vehicle.currency)} />
                <DetailRow label="Ztráta hodnoty" value={formatCurrency(calculateDepreciation(vehicle), vehicle.currency)} />
                <DetailRow label="Hlavní řidič" value={vehicle.primary_driver} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Datová úplnost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CompletenessRow label="VIN" done={Boolean(vehicle.vin)} />
                <CompletenessRow label="Aktuální hodnota" done={vehicle.current_value != null} />
                <CompletenessRow label="Pojištění" done={Boolean(vehicle.insurance_provider)} />
                <CompletenessRow label="Fotografie" done={Boolean(vehicle.photo_url)} />
                <CompletenessRow label="Dokumenty" done={documents.length > 0} />
              </CardContent>
            </Card>
          </div>
          {vehicle.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Poznámky</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{vehicle.notes}</CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="expenses">
          <RecordCard icon={ReceiptText} title="Poslední výdaje" emptyText="Pro toto vozidlo zatím nejsou výdaje.">
            {expenses.slice(0, 8).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </RecordCard>
        </TabsContent>

        <TabsContent value="energy">
          <RecordCard icon={Fuel} title="Poslední tankování" emptyText="Pro toto vozidlo zatím nejsou tankování ani energie.">
            {energyEntries.slice(0, 8).map((entry) => (
              <EnergyRow key={entry.id} entry={entry} currency={vehicle.currency} />
            ))}
          </RecordCard>
        </TabsContent>

        <TabsContent value="service">
          <RecordCard icon={Wrench} title="Servisní historie" emptyText="Pro toto vozidlo zatím nejsou servisní záznamy.">
            {serviceEntries.slice(0, 8).map((entry) => (
              <ServiceRow key={entry.id} entry={entry} />
            ))}
          </RecordCard>
        </TabsContent>

        <TabsContent value="reminders">
          <RecordCard icon={Bell} title="Připomínky" emptyText="Pro toto vozidlo zatím nejsou připomínky.">
            {reminders.slice(0, 8).map((reminder) => (
              <ListRow
                key={reminder.id}
                title={reminder.title}
                detail={`${reminder.category} · ${formatDate(reminder.next_due_date ?? reminder.due_date)}`}
                amount={formatReminderStatus(reminder.status)}
              />
            ))}
          </RecordCard>
        </TabsContent>

        <TabsContent value="documents">
          <RecordCard icon={FileText} title="Dokumenty" emptyText="Pro toto vozidlo zatím nejsou dokumenty.">
            {documents.slice(0, 8).map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </RecordCard>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
              <StatisticTile label="Výdaje" value={formatCurrency(sumExpenses(expenses), vehicle.currency)} icon={ReceiptText} />
              <StatisticTile label="Palivo" value={formatCurrency(sumEnergy(energyEntries), vehicle.currency)} icon={Fuel} />
              <StatisticTile label="Servis" value={formatCurrency(sumService(serviceEntries), vehicle.currency)} icon={Wrench} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-[rgba(13,23,30,0.78)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-semibold text-white">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[14px] border border-border bg-muted/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold text-white">{value || "Nevyplněno"}</div>
    </div>
  );
}

function CompletenessRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border bg-[rgba(8,17,23,0.42)] p-3 text-sm">
      <span>{label}</span>
      <Badge variant={done ? "default" : "secondary"}>{done ? "Vyplněno" : "Chybí"}</Badge>
    </div>
  );
}

function RecordCard({
  icon: Icon,
  title,
  emptyText,
  children,
}: {
  icon: LucideIcon;
  title: string;
  emptyText: string;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasChildren ? children : <div className="rounded-[16px] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{emptyText}</div>}
      </CardContent>
    </Card>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <ListRow
      title={expense.description}
      detail={`${formatDate(expense.date)} · ${expense.category}${expense.mileage ? ` · ${formatNumber(expense.mileage)} km` : ""}`}
      amount={formatCurrency(expense.amount, expense.currency)}
    />
  );
}

function EnergyRow({ entry, currency }: { entry: EnergyEntry; currency: string }) {
  const quantity = `${formatNumber(entry.quantity)} ${entry.quantity_unit}`;

  return (
    <ListRow
      title={entry.fuel_station ?? entry.charging_location ?? formatEnergyType(entry.entry_type)}
      detail={`${formatDate(entry.date)} · ${formatNumber(entry.mileage)} km · ${quantity}`}
      amount={formatCurrency(entry.total_price, currency)}
    />
  );
}

function ServiceRow({ entry }: { entry: ServiceEntry }) {
  return (
    <ListRow
      title={entry.description}
      detail={`${formatDate(entry.date)} · ${entry.service_type} · ${formatNumber(entry.mileage)} km`}
      amount={formatCurrency(entry.total_cost, entry.currency)}
    />
  );
}

function DocumentRow({ document }: { document: VehicleDocument }) {
  return (
    <ListRow
      title={document.name}
      detail={`${document.category} · platnost ${formatDate(document.expiration_date)}`}
      amount={formatDocumentStatus(document.status)}
    />
  );
}

function ListRow({ title, detail, amount }: { title: string; detail: string; amount: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-[rgba(8,17,23,0.42)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
      <div className="tabular-num shrink-0 font-semibold text-white">{amount}</div>
    </div>
  );
}

function StatisticTile({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[16px] border border-border bg-muted/35 p-4">
      <Icon className="mb-3 size-5 text-[var(--accent)]" aria-hidden="true" />
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="tabular-num mt-1 text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

function sumEnergy(entries: EnergyEntry[]) {
  return entries.reduce((total, entry) => total + Number(entry.total_price), 0);
}

function sumService(entries: ServiceEntry[]) {
  return entries.reduce((total, entry) => total + Number(entry.total_cost), 0);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Nevyplněno";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
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

function formatTransmission(value: string | null) {
  if (value === "manual") {
    return "Manuál";
  }

  if (value === "automatic") {
    return "Automat";
  }

  return "Nevyplněno";
}

function formatBodyType(value: string | null) {
  const labels: Record<string, string> = {
    hatchback: "Hatchback",
    sedan: "Sedan",
    wagon: "Combi",
    suv: "SUV",
    van: "Van",
    coupe: "Coupe",
    convertible: "Cabrio",
    pickup: "Pickup",
    other: "Jiné",
  };

  return value ? (labels[value] ?? value) : null;
}

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    active: "Aktivní",
    sold: "Prodané",
    archived: "Archivované",
  };

  return labels[value] ?? value;
}

function formatEnergyType(value: string) {
  const labels: Record<string, string> = {
    fuel: "Tankování",
    charging: "Nabíjení",
    lpg: "LPG",
    cng: "CNG",
  };

  return labels[value] ?? value;
}

function formatReminderStatus(value: string) {
  const labels: Record<string, string> = {
    ok: "V pořádku",
    upcoming: "Blíží se",
    due_soon: "Brzy",
    overdue: "Po termínu",
    done: "Hotovo",
  };

  return labels[value] ?? value;
}

function formatDocumentStatus(value: string) {
  const labels: Record<string, string> = {
    valid: "Platný",
    expiring_soon: "Končí",
    expired: "Neplatný",
  };

  return labels[value] ?? value;
}
