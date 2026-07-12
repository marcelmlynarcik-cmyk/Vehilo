import { Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartCard } from "@/components/charts/basic-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, sumExpenses } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function ExpensesPage() {
  const { data } = await loadGarageData();
  const currency = data.profile?.currency ?? "CZK";
  const total = sumExpenses(data.expenses);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Výdaje"
        description="Sledujte servis, pojištění, dálniční známky, opravy, parkování, mýto a další náklady."
        actions={<Button><Plus className="mr-2 size-4" aria-hidden="true" />Přidat výdaj</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Výdaje celkem" value={formatCurrency(total, currency)} description="Ze skutečných záznamů" icon={ReceiptText} />
        <MetricCard title="Tento měsíc" value={formatCurrency(0, currency)} description="Po přidání dat se dopočítá" icon={ReceiptText} />
        <MetricCard title="Největší výdaj" value={formatCurrency(0, currency)} description="Zatím bez dat" icon={ReceiptText} />
        <MetricCard title="Náklad na km" value={`${formatCurrency(0, currency)}/km`} description="Dle vozidel a výdajů" icon={ReceiptText} />
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Popis</TableHead>
                  <TableHead className="text-right">Částka</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount, expense.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
