import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Car, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { loadDocumentDetailData } from "@/lib/data/records";
import type { VehicleDocument } from "@/types/domain";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadDocumentDetailData(id);

  if (!detail) {
    notFound();
  }

  const { document, vehicle, documentUrl } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/documents#records">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zpět na dokumenty
          </Link>
        </Button>
        <DocumentStatusBadge status={document.status} />
      </div>

      <section className="rounded-[28px] border border-border bg-[rgba(8,17,23,0.66)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">{document.category}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{document.name}</h1>
          <p className="mt-3 text-muted-foreground">
            {vehicle ? vehicle.name : "Vozidlo"} · {document.expiration_date ? `platí do ${formatDisplayDate(document.expiration_date)}` : "bez konce platnosti"}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Vozidlo" value={vehicle?.name ?? "Vozidlo"} description={vehicle ? `${vehicle.brand} ${vehicle.model}` : "Bez detailu"} icon={Car} />
        <MetricCard title="Kategorie" value={document.category} description="Typ dokumentu" icon={FileText} />
        <MetricCard title="Platí do" value={document.expiration_date ? formatDisplayDate(document.expiration_date) : "-"} description="Konec platnosti" icon={CalendarClock} />
        <MetricCard title="Soubor" value={document.file_url ? "Přiložen" : "-"} description="PDF nebo obrázek" icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail dokumentu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Název" value={document.name} />
          <DetailRow label="Vozidlo" value={vehicle?.name ?? "Vozidlo"} />
          <DetailRow label="Kategorie" value={document.category} />
          <DetailRow label="Datum vystavení" value={document.issue_date ? formatDisplayDate(document.issue_date) : null} />
          <DetailRow label="Platí do" value={document.expiration_date ? formatDisplayDate(document.expiration_date) : null} />
          <DetailRow label="Soubor" value={document.file_url ? "Přiložen" : null} />
        </CardContent>
      </Card>

      {documentUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Příloha</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={documentUrl} target="_blank" rel="noreferrer">
                Otevřít dokument
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {document.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Poznámky</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{document.notes}</CardContent>
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

function DocumentStatusBadge({ status }: { status: VehicleDocument["status"] }) {
  const variant: "destructive" | "default" | "secondary" = status === "expired" ? "destructive" : status === "expiring_soon" ? "default" : "secondary";
  return <Badge variant={variant}>{formatDocumentStatus(status)}</Badge>;
}

function formatDocumentStatus(value: VehicleDocument["status"]) {
  const labels: Record<VehicleDocument["status"], string> = {
    valid: "Platné",
    expiring_soon: "Brzy vyprší",
    expired: "Prošlé",
  };

  return labels[value];
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
