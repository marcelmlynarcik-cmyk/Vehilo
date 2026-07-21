import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Car, Gauge, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { formatCurrency, formatNumber } from "@/lib/calculations/costs";
import { loadServiceEntryDetailData } from "@/lib/data/records";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadServiceEntryDetailData(id);

  if (!detail) {
    notFound();
  }

  const { entry, vehicle } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/service#records">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zpět na servis
          </Link>
        </Button>
        <Badge variant="secondary" className="w-fit">{entry.service_type}</Badge>
      </div>

      <section className="rounded-[28px] border border-border bg-[rgba(8,17,23,0.66)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">{formatDisplayDate(entry.date)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{entry.description}</h1>
          <p className="mt-3 text-muted-foreground">
            {vehicle ? vehicle.name : "Vozidlo"} · {formatCurrency(entry.total_cost, entry.currency)}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Celkem" value={formatCurrency(entry.total_cost, entry.currency)} description="Cena servisu" icon={Wrench} />
        <MetricCard title="Práce" value={formatCurrency(entry.labor_cost ?? 0, entry.currency)} description="Cena práce" icon={Wrench} />
        <MetricCard title="Díly" value={formatCurrency(entry.parts_cost ?? 0, entry.currency)} description="Cena dílů" icon={Wrench} />
        <MetricCard title="Nájezd" value={`${formatNumber(entry.mileage)} km`} description="Při servisu" icon={Gauge} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail servisu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Datum" value={formatDisplayDate(entry.date)} />
          <DetailRow label="Vozidlo" value={vehicle?.name ?? "Vozidlo"} />
          <DetailRow label="Typ servisu" value={entry.service_type} />
          <DetailRow label="Servis / dodavatel" value={entry.provider} />
          <DetailRow label="Vyměněné díly" value={entry.parts_changed} />
          <DetailRow label="Faktura" value={entry.invoice_url ? "Přiložena" : null} />
          <DetailRow label="Záruka do data" value={entry.warranty_until_date ? formatDisplayDate(entry.warranty_until_date) : null} />
          <DetailRow label="Záruka do km" value={entry.warranty_until_mileage ? `${formatNumber(entry.warranty_until_mileage)} km` : null} />
        </CardContent>
      </Card>

      {entry.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Poznámky</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{entry.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[14px] border border-border bg-muted/35 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {label === "Záruka do data" || label === "Záruka do km" ? <CalendarClock className="size-3" aria-hidden="true" /> : null}
        {label === "Vozidlo" ? <Car className="size-3" aria-hidden="true" /> : null}
        {label}
      </div>
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
