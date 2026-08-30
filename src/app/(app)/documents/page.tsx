import Link from "next/link";
import { CalendarClock, ExternalLink, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentForm } from "@/components/forms/document-form";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleDocument } from "@/types/domain";
import { createDocument, deleteDocument, updateDocument } from "./actions";

type DocumentsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { data } = await loadGarageData();
  const query = await searchParams;
  const openDocumentDialog = query.add === "document";
  const selectedVehicleId = getQueryValue(query.vehicle);
  const vehicleNames = new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle.name]));
  const documents = data.documents
    .filter((document) => !selectedVehicleId || document.vehicle_id === selectedVehicleId)
    .sort((a, b) => documentSortScore(a) - documentSortScore(b));
  const visibleDocuments = documents.slice(0, 10);
  const hiddenDocuments = documents.slice(10);
  const documentUrls = await createSignedDocumentUrls(documents);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumenty"
        description="Uložte technické průkazy, pojištění, STK/MOT, faktury, smlouvy, dálniční známky a povolení."
        actions={<DocumentDialog vehicles={data.vehicles} defaultVehicleId={selectedVehicleId} defaultOpen={openDocumentDialog} />}
      />
      {selectedVehicleId ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-white">Dokumenty pro vozidlo</div>
              <div className="mt-1 text-sm text-muted-foreground">{vehicleNames.get(selectedVehicleId) ?? "Vybrané vozidlo"}</div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/documents">Zobrazit všechna vozidla</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Platné" value={String(documents.filter((item) => item.status === "valid").length)} description="Bez blížícího se konce" icon={FileText} />
        <MetricCard title="Brzy vyprší" value={String(documents.filter((item) => item.status === "expiring_soon").length)} description="Do 30 dní" icon={CalendarClock} />
        <MetricCard title="Prošlé" value={String(documents.filter((item) => item.status === "expired").length)} description="Vyžaduje pozornost" icon={FileText} />
      </div>
      {data.documents.length === 0 ? (
        <EmptyState icon={FileText} title="Zatím žádné dokumenty" description="Pro první doklad, smlouvu nebo pojištění použijte tlačítko Přidat dokument nahoře na stránce." />
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title="Žádné dokumenty pro tento filtr" description="Zobrazte všechna vozidla nebo přidejte dokument pro vybrané vozidlo." />
      ) : (
        <Card id="records">
          <CardHeader>
            <CardTitle>Seznam dokumentů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-0">
            <div className="grid gap-3 md:hidden">
              {visibleDocuments.map((document) => (
                <DocumentMobileCard
                  key={document.id}
                  document={document}
                  vehicles={data.vehicles}
                  vehicleName={vehicleNames.get(document.vehicle_id) ?? "Vozidlo"}
                  documentUrl={documentUrls.get(document.id) ?? null}
                />
              ))}
            </div>
            <div className="hidden md:block">
              <DocumentTable documents={visibleDocuments} vehicles={data.vehicles} vehicleNames={vehicleNames} documentUrls={documentUrls} />
            </div>
            {hiddenDocuments.length > 0 ? (
              <details className="group border-t border-border md:mx-0">
                <summary className="cursor-pointer list-none px-1 py-4 text-sm font-semibold text-[var(--accent)] md:px-4">
                  Zobrazit dalších {hiddenDocuments.length} dokumentů
                </summary>
                <div className="grid gap-3 md:hidden">
                  {hiddenDocuments.map((document) => (
                    <DocumentMobileCard
                      key={document.id}
                      document={document}
                      vehicles={data.vehicles}
                      vehicleName={vehicleNames.get(document.vehicle_id) ?? "Vozidlo"}
                      documentUrl={documentUrls.get(document.id) ?? null}
                    />
                  ))}
                </div>
                <div className="hidden md:block">
                  <DocumentTable documents={hiddenDocuments} vehicles={data.vehicles} vehicleNames={vehicleNames} documentUrls={documentUrls} />
                </div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Kategorie dokumentů</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Technický průkaz", "Pojištění", "STK/MOT", "Emise", "Servisní faktura", "Kupní smlouva", "Leasing", "Dálniční známka", "Parkovací povolení"].map((item) => (
            <Badge key={item} variant="secondary">{item}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentDialog({
  vehicles,
  defaultVehicleId,
  defaultOpen,
}: {
  vehicles: Vehicle[];
  defaultVehicleId: string;
  defaultOpen: boolean;
}) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Přidat dokument
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nový dokument</DialogTitle>
          <DialogDescription>Uložte doklad, smlouvu, pojištění, STK/MOT nebo jiný dokument k vozidlu.</DialogDescription>
        </DialogHeader>
        <DocumentForm action={createDocument} vehicles={vehicles} defaultVehicleId={defaultVehicleId} />
      </DialogContent>
    </Dialog>
  );
}

function EditDocumentDialog({ document, vehicles }: { document: VehicleDocument; vehicles: Vehicle[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="mr-2 size-4" aria-hidden="true" />
        Upravit
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upravit dokument</DialogTitle>
          <DialogDescription>Změny se uloží do stejného dokumentu a stav se přepočítá podle platnosti.</DialogDescription>
        </DialogHeader>
        <DocumentForm action={updateDocument} vehicles={vehicles} document={document} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog({ document }: { document: VehicleDocument }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        Smazat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smazat dokument?</DialogTitle>
          <DialogDescription>Dokument i přiložený soubor se odstraní z evidence.</DialogDescription>
        </DialogHeader>
        <form action={deleteDocument} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={document.id} />
          <Button variant="destructive" type="submit" className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Smazat dokument
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentTable({
  documents,
  vehicles,
  vehicleNames,
  documentUrls,
}: {
  documents: VehicleDocument[];
  vehicles: Vehicle[];
  vehicleNames: Map<string, string>;
  documentUrls: Map<string, string>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Název</TableHead>
          <TableHead>Vozidlo</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Platí do</TableHead>
          <TableHead>Stav</TableHead>
          <TableHead>Soubor</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell>
              <Link href={`/documents/${document.id}`} className="font-medium hover:text-[var(--accent)]">
                {document.name}
              </Link>
            </TableCell>
            <TableCell>{vehicleNames.get(document.vehicle_id) ?? "Vozidlo"}</TableCell>
            <TableCell>{document.category}</TableCell>
            <TableCell>{document.expiration_date ? formatDisplayDate(document.expiration_date) : "-"}</TableCell>
            <TableCell><DocumentStatusBadge status={document.status} /></TableCell>
            <TableCell>{document.file_url ? "Přiložen" : "-"}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <OpenDocumentButton documentUrl={documentUrls.get(document.id) ?? null} />
              <EditDocumentDialog document={document} vehicles={vehicles} />
              <DeleteDocumentDialog document={document} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DocumentMobileCard({
  document,
  vehicles,
  vehicleName,
  documentUrl,
}: {
  document: VehicleDocument;
  vehicles: Vehicle[];
  vehicleName: string;
  documentUrl: string | null;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-border bg-[rgba(8,17,23,0.42)] p-4">
      <Link href={`/documents/${document.id}`} className="flex min-w-0 items-start justify-between gap-3 hover:text-[var(--accent)]">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{document.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {vehicleName} · {document.category}
          </div>
        </div>
        <DocumentStatusBadge status={document.status} />
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{document.expiration_date ? `Platí do ${formatDisplayDate(document.expiration_date)}` : "Bez konce platnosti"}</span>
        <span>{document.file_url ? "Soubor přiložen" : "Bez souboru"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <OpenDocumentButton documentUrl={documentUrl} />
        <EditDocumentDialog document={document} vehicles={vehicles} />
        <DeleteDocumentDialog document={document} />
      </div>
    </div>
  );
}

function OpenDocumentButton({ documentUrl }: { documentUrl: string | null }) {
  if (!documentUrl) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={documentUrl} target="_blank" rel="noreferrer">
        <ExternalLink className="mr-2 size-4" aria-hidden="true" />
        Otevřít
      </Link>
    </Button>
  );
}

async function createSignedDocumentUrls(documents: VehicleDocument[]) {
  const urls = new Map<string, string>();
  const privateDocuments = documents.filter((document) => {
    if (!document.file_url) {
      return false;
    }

    if (/^https?:\/\//i.test(document.file_url)) {
      urls.set(document.id, document.file_url);
      return false;
    }

    return true;
  });

  if (privateDocuments.length === 0) {
    return urls;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return urls;
  }

  await Promise.all(
    privateDocuments.map(async (document) => {
      if (!document.file_url) {
        return;
      }

      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.file_url, 60 * 10);

      if (!error && data?.signedUrl) {
        urls.set(document.id, data.signedUrl);
      }
    }),
  );

  return urls;
}

function DocumentStatusBadge({ status }: { status: VehicleDocument["status"] }) {
  const variant: "destructive" | "default" | "secondary" = status === "expired" ? "destructive" : status === "expiring_soon" ? "default" : "secondary";
  return <Badge variant={variant}>{formatDocumentStatus(status)}</Badge>;
}

function documentSortScore(document: VehicleDocument) {
  const statusScore: Record<VehicleDocument["status"], number> = {
    expired: 0,
    expiring_soon: 1,
    valid: 2,
  };

  const dateScore = document.expiration_date ? new Date(`${document.expiration_date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
  return statusScore[document.status] * 10_000_000_000_000 + dateScore;
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

function getQueryValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}
