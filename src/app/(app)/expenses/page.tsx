import { Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartCard } from "@/components/charts/basic-charts";
import { ExpenseForm } from "@/components/forms/expense-form";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, sumExpenses } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";
import type { Expense, Vehicle } from "@/types/domain";
import { createExpense, deleteExpense, updateExpense } from "./actions";

type ExpensesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { data } = await loadGarageData();
  const query = await searchParams;
  const currency = data.profile?.currency ?? "CZK";
  const defaultDate = formatDateInput(new Date());
  const openExpenseDialog = query.add === "expense";
  const filters = parseExpenseFilters(query);
  const filteredExpenses = filterExpenses(data.expenses, filters);
  const total = sumExpenses(filteredExpenses);
  const currentMonthTotal = sumCurrentMonthExpenses(filteredExpenses);
  const largestExpense = filteredExpenses.reduce<Expense | null>(
    (largest, expense) => (largest == null || Number(expense.amount) > Number(largest.amount) ? expense : largest),
    null,
  );
  const costPerKm = calculateExpenseCostPerKm(filteredExpenses, data.vehicles);
  const expenseCategories = uniqueSorted(data.expenses.map((expense) => expense.category));
  const expenseYears = uniqueSorted(data.expenses.map((expense) => expense.date.slice(0, 4))).reverse();
  const monthlyExpenses = buildMonthlyExpenseSeries(filteredExpenses);
  const categoryExpenses = buildCategoryExpenseSeries(filteredExpenses);
  const cumulativeExpenses = buildCumulativeExpenseSeries(filteredExpenses);
  const visibleExpenses = filteredExpenses.slice(0, 10);
  const hiddenExpenses = filteredExpenses.slice(10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Výdaje"
        description="Sledujte servis, pojištění, dálniční známky, opravy, parkování, mýto a další náklady."
        actions={<ExpenseDialog vehicles={data.vehicles} defaultDate={defaultDate} defaultOpen={openExpenseDialog} />}
      />
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/expenses" className="grid min-w-0 gap-3 md:grid-cols-6">
            <FilterInput name="q" label="Hledání" placeholder="Popis, kategorie, poznámka" defaultValue={filters.q} />
            <FilterSelect name="vehicle" label="Vozidlo" value={filters.vehicle} allLabel="Všechna vozidla" options={data.vehicles.map((vehicle): [string, string] => [vehicle.id, vehicle.name])} />
            <FilterSelect name="category" label="Kategorie" value={filters.category} options={expenseCategories.map((category): [string, string] => [category, category])} />
            <FilterInput name="month" label="Měsíc" placeholder="RRRR-MM" defaultValue={filters.month} maxLength={7} />
            <FilterSelect name="year" label="Rok" value={filters.year} options={expenseYears.map((year): [string, string] => [year, year])} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Filtrovat</Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/expenses">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Výdaje po měsících" type="bar" data={monthlyExpenses} valueLabel="Náklady" />
        <ChartCard title="Výdaje podle kategorií" type="pie" data={categoryExpenses} valueLabel="Náklady" />
        <ChartCard title="Kumulativní náklady" type="area" data={cumulativeExpenses} valueLabel="Náklady" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Výdaje celkem" value={formatCurrency(total, currency)} description="Ze skutečných záznamů" icon={ReceiptText} />
        <MetricCard title="Tento měsíc" value={formatCurrency(currentMonthTotal, currency)} description="Podle data výdaje" icon={ReceiptText} />
        <MetricCard title="Největší výdaj" value={formatCurrency(largestExpense?.amount ?? 0, currency)} description={largestExpense?.description ?? "Zatím bez dat"} icon={ReceiptText} />
        <MetricCard title="Náklad na km" value={`${formatCurrency(costPerKm, currency, 2)}/km`} description="Jen vozidla ve filtrovaných výdajích" icon={ReceiptText} />
      </div>
      {data.expenses.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Zatím žádné výdaje" description="Po připojení Supabase a vytvoření prvního vozidla zde budete ukládat skutečné náklady." actionLabel="Přidat výdaj" />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Žádné výdaje pro tento filtr" description="Změňte filtr nebo resetujte výběr." />
      ) : (
        <Card id="records">
          <CardHeader>
            <CardTitle>Záznamy výdajů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-0">
            <div className="grid gap-3 md:hidden">
              {visibleExpenses.map((expense) => (
                <ExpenseMobileCard key={expense.id} expense={expense} vehicles={data.vehicles} currency={currency} />
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Vozidlo</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Popis</TableHead>
                    <TableHead className="text-right">Nájezd</TableHead>
                    <TableHead className="text-right">Částka</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Link href={`/expenses/${expense.id}`} className="text-[var(--accent)] hover:underline">
                          {formatDisplayDate(expense.date)}
                        </Link>
                      </TableCell>
                      <TableCell>{data.vehicles.find((vehicle) => vehicle.id === expense.vehicle_id)?.name ?? "Vozidlo"}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>
                        <Link href={`/expenses/${expense.id}`} className="font-medium hover:text-[var(--accent)]">
                          {expense.description}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{expense.mileage ? `${formatNumber(expense.mileage)} km` : "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount, expense.currency)}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <EditExpenseDialog expense={expense} vehicles={data.vehicles} />
                        <DeleteExpenseDialog expense={expense} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hiddenExpenses.length > 0 ? (
              <details className="group border-t border-border md:mx-0">
                <summary className="cursor-pointer list-none px-1 py-4 text-sm font-semibold text-[var(--accent)] md:px-4">
                  Zobrazit dalších {hiddenExpenses.length} záznamů
                </summary>
                <div className="grid gap-3 md:hidden">
                  {hiddenExpenses.map((expense) => (
                    <ExpenseMobileCard key={expense.id} expense={expense} vehicles={data.vehicles} currency={currency} />
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Vozidlo</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Popis</TableHead>
                        <TableHead className="text-right">Nájezd</TableHead>
                        <TableHead className="text-right">Částka</TableHead>
                        <TableHead className="text-right">Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hiddenExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <Link href={`/expenses/${expense.id}`} className="text-[var(--accent)] hover:underline">
                              {formatDisplayDate(expense.date)}
                            </Link>
                          </TableCell>
                          <TableCell>{data.vehicles.find((vehicle) => vehicle.id === expense.vehicle_id)?.name ?? "Vozidlo"}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>
                            <Link href={`/expenses/${expense.id}`} className="font-medium hover:text-[var(--accent)]">
                              {expense.description}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">{expense.mileage ? `${formatNumber(expense.mileage)} km` : "-"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(expense.amount, expense.currency)}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <EditExpenseDialog expense={expense} vehicles={data.vehicles} />
                            <DeleteExpenseDialog expense={expense} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      )}
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
      <Label htmlFor={`expense-filter-${name}`} className="text-xs text-muted-foreground">{label}</Label>
      <select
        id={`expense-filter-${name}`}
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
  type = "text",
  placeholder,
  defaultValue,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue: string;
  maxLength?: number;
}) {
  return (
    <div className="max-w-full min-w-0 overflow-hidden space-y-1.5">
      <Label htmlFor={`expense-filter-${name}`} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={`expense-filter-${name}`}
        name={name}
        type={type}
        inputMode={name === "month" ? "numeric" : undefined}
        pattern={name === "month" ? "[0-9]{4}-[0-9]{2}" : undefined}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="block w-full max-w-full min-w-0"
      />
    </div>
  );
}

function ExpenseDialog({
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
        Přidat výdaj
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nový výdaj</DialogTitle>
          <DialogDescription>Uložte STK, pojištění, dálniční známku, příslušenství nebo jiný náklad.</DialogDescription>
        </DialogHeader>
        <ExpenseForm action={createExpense} vehicles={vehicles} defaultDate={defaultDate} />
      </DialogContent>
    </Dialog>
  );
}

function EditExpenseDialog({ expense, vehicles }: { expense: Expense; vehicles: Vehicle[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="mr-2 size-4" aria-hidden="true" />
        Upravit
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upravit výdaj</DialogTitle>
          <DialogDescription>Změny se uloží do stejného záznamu a promítnou se do statistik.</DialogDescription>
        </DialogHeader>
        <ExpenseForm action={updateExpense} vehicles={vehicles} defaultDate={expense.date} expense={expense} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteExpenseDialog({ expense }: { expense: Expense }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        Smazat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smazat výdaj?</DialogTitle>
          <DialogDescription>Tento výdaj se odstraní z historie i statistik.</DialogDescription>
        </DialogHeader>
        <form action={deleteExpense} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={expense.id} />
          <Button variant="destructive" type="submit" className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Smazat výdaj
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseMobileCard({ expense, vehicles, currency }: { expense: Expense; vehicles: Vehicle[]; currency: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-border bg-[rgba(8,17,23,0.42)] p-4">
      <Link href={`/expenses/${expense.id}`} className="flex min-w-0 items-start justify-between gap-3 hover:text-[var(--accent)]">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{expense.description}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDisplayDate(expense.date)} · {vehicles.find((vehicle) => vehicle.id === expense.vehicle_id)?.name ?? "Vozidlo"}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm font-semibold">{formatCurrency(expense.amount, currency)}</div>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-1">{expense.category}</span>
        <span>{expense.mileage ? `${formatNumber(expense.mileage)} km` : "Bez nájezdu"}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <EditExpenseDialog expense={expense} vehicles={vehicles} />
        <DeleteExpenseDialog expense={expense} />
      </div>
    </div>
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

function sumCurrentMonthExpenses(expenses: Expense[]) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
  });
  const currentMonth = formatter.format(new Date());

  return expenses.reduce((total, expense) => {
    return expense.date.startsWith(currentMonth) ? total + Number(expense.amount) : total;
  }, 0);
}

function calculateExpenseCostPerKm(expenses: Expense[], vehicles: Vehicle[]) {
  const vehicleIds = new Set(expenses.map((expense) => expense.vehicle_id));
  const relevantVehicles = vehicles.filter((vehicle) => vehicleIds.has(vehicle.id));
  const distanceByVehicle = new Map(
    relevantVehicles.map((vehicle) => [
      vehicle.id,
      Math.max(0, Number(vehicle.current_mileage) - Number(vehicle.purchase_mileage ?? vehicle.current_mileage)),
    ]),
  );
  const totalDistance = [...distanceByVehicle.values()].reduce((total, distance) => total + distance, 0);

  if (totalDistance <= 0) {
    return 0;
  }

  return sumExpenses(expenses) / totalDistance;
}

function parseExpenseFilters(query: Awaited<ExpensesPageProps["searchParams"]>) {
  return {
    q: getQueryValue(query.q),
    vehicle: getQueryValue(query.vehicle, "all"),
    category: getQueryValue(query.category, "all"),
    month: getQueryValue(query.month),
    year: getQueryValue(query.year, "all"),
  };
}

function filterExpenses(expenses: Expense[], filters: ReturnType<typeof parseExpenseFilters>) {
  const q = filters.q.toLowerCase();

  return expenses.filter((expense) => {
    if (filters.vehicle !== "all" && expense.vehicle_id !== filters.vehicle) {
      return false;
    }

    if (filters.category !== "all" && expense.category !== filters.category) {
      return false;
    }

    if (filters.month && !expense.date.startsWith(filters.month)) {
      return false;
    }

    if (filters.year !== "all" && !expense.date.startsWith(filters.year)) {
      return false;
    }

    if (!q) {
      return true;
    }

    return [expense.category, expense.description, expense.notes ?? ""].some((value) => value.toLowerCase().includes(q));
  });
}

function buildMonthlyExpenseSeries(expenses: Expense[]) {
  const grouped = new Map<string, { value: number; details: string[] }>();

  for (const expense of expenses) {
    const month = expense.date.slice(0, 7);
    const group = grouped.get(month) ?? { value: 0, details: [] };
    group.value += Number(expense.amount);
    group.details.push(`${formatDisplayDate(expense.date)} · ${expense.category} · ${expense.description} · ${formatCurrency(expense.amount, expense.currency)}`);
    grouped.set(month, group);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "cs-CZ"))
    .map(([name, group]) => ({
      name,
      value: Math.round(group.value * 100) / 100,
      details: group.details,
    }));
}

function buildCategoryExpenseSeries(expenses: Expense[]) {
  return buildGroupedSeries(expenses, (expense) => expense.category, (expense) => Number(expense.amount));
}

function buildCumulativeExpenseSeries(expenses: Expense[]) {
  let runningTotal = 0;

  return [...expenses]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((expense) => {
      runningTotal += Number(expense.amount);
      return {
        name: formatDisplayDate(expense.date),
        value: Math.round(runningTotal * 100) / 100,
      };
    });
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
