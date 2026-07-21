import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car, Gauge, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { formatCurrency, formatNumber } from "@/lib/calculations/costs";
import { loadExpenseDetailData } from "@/lib/data/records";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadExpenseDetailData(id);

  if (!detail) {
    notFound();
  }

  const { expense, vehicle, receiptUrl } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/expenses#records">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zpět na výdaje
          </Link>
        </Button>
        <Badge variant="secondary" className="w-fit">{expense.category}</Badge>
      </div>

      <section className="rounded-[28px] border border-border bg-[rgba(8,17,23,0.66)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">{formatDisplayDate(expense.date)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{expense.description}</h1>
          <p className="mt-3 text-muted-foreground">
            {vehicle ? vehicle.name : "Vozidlo"} · {formatCurrency(expense.amount, expense.currency)}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Částka" value={formatCurrency(expense.amount, expense.currency)} description="Uložený výdaj" icon={ReceiptText} />
        <MetricCard title="Vozidlo" value={vehicle?.name ?? "Vozidlo"} description={vehicle ? `${vehicle.brand} ${vehicle.model}` : "Bez detailu"} icon={Car} />
        <MetricCard title="Nájezd" value={expense.mileage ? `${formatNumber(expense.mileage)} km` : "-"} description="Při výdaji" icon={Gauge} />
        <MetricCard title="Kategorie" value={expense.category} description="Typ nákladu" icon={ReceiptText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail záznamu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Datum" value={formatDisplayDate(expense.date)} />
          <DetailRow label="Vozidlo" value={vehicle?.name ?? "Vozidlo"} />
          <DetailRow label="Kategorie" value={expense.category} />
          <DetailRow label="Částka" value={formatCurrency(expense.amount, expense.currency)} />
          <DetailRow label="Nájezd" value={expense.mileage ? `${formatNumber(expense.mileage)} km` : null} />
          <DetailRow label="Doklad" value={expense.receipt_url ? "Přiložen" : null} />
        </CardContent>
      </Card>

      {receiptUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Příloha</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={receiptUrl} target="_blank" rel="noreferrer">
                Otevřít doklad / fotku
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {expense.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Poznámky</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{expense.notes}</CardContent>
        </Card>
      ) : null}
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

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
