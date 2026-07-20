import { Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const total = sumExpenses(data.expenses);
  const currentMonthTotal = sumCurrentMonthExpenses(data.expenses);
  const largestExpense = data.expenses.reduce<Expense | null>(
    (largest, expense) => (largest == null || Number(expense.amount) > Number(largest.amount) ? expense : largest),
    null,
  );
  const costPerKm = calculateExpenseCostPerKm(data.expenses, data.vehicles);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Výdaje"
        description="Sledujte servis, pojištění, dálniční známky, opravy, parkování, mýto a další náklady."
        actions={<ExpenseDialog vehicles={data.vehicles} defaultDate={defaultDate} defaultOpen={openExpenseDialog} />}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Výdaje celkem" value={formatCurrency(total, currency)} description="Ze skutečných záznamů" icon={ReceiptText} />
        <MetricCard title="Tento měsíc" value={formatCurrency(currentMonthTotal, currency)} description="Podle data výdaje" icon={ReceiptText} />
        <MetricCard title="Největší výdaj" value={formatCurrency(largestExpense?.amount ?? 0, currency)} description={largestExpense?.description ?? "Zatím bez dat"} icon={ReceiptText} />
        <MetricCard title="Náklad na km" value={`${formatCurrency(costPerKm, currency)}/km`} description="Od nákupu po aktuální nájezd" icon={ReceiptText} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="Hledat" />
          <Select><SelectTrigger><SelectValue placeholder="Vozidlo" /></SelectTrigger><SelectContent><SelectItem value="all">Všechna vozidla</SelectItem></SelectContent></Select>
          <Select><SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger><SelectContent><SelectItem value="all">Všechny kategorie</SelectItem></SelectContent></Select>
          <Input type="month" />
          <Input placeholder="Rok" />
        </CardContent>
      </Card>
      {data.expenses.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Zatím žádné výdaje" description="Po připojení Supabase a vytvoření prvního vozidla zde budete ukládat skutečné náklady." actionLabel="Přidat výdaj" />
      ) : (
        <Card id="records">
          <CardHeader>
            <CardTitle>Záznamy výdajů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-0">
            <div className="grid gap-3 md:hidden">
              {data.expenses.map((expense) => (
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
                  {data.expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDisplayDate(expense.date)}</TableCell>
                      <TableCell>{data.vehicles.find((vehicle) => vehicle.id === expense.vehicle_id)?.name ?? "Vozidlo"}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.description}</TableCell>
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
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Výdaje po měsících" type="bar" />
        <ChartCard title="Výdaje podle kategorií" type="pie" />
        <ChartCard title="Kumulativní náklady" type="area" />
      </div>
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
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{expense.description}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDisplayDate(expense.date)} · {vehicles.find((vehicle) => vehicle.id === expense.vehicle_id)?.name ?? "Vozidlo"}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm font-semibold">{formatCurrency(expense.amount, currency)}</div>
      </div>
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
  const distanceByVehicle = new Map(
    vehicles.map((vehicle) => [
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
