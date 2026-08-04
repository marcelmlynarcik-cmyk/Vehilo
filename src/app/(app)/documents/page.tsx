import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";

export default async function DocumentsPage() {
  const { data } = await loadGarageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumenty"
        description="Uložte technické průkazy, pojištění, STK/MOT, faktury, smlouvy, dálniční známky a povolení."
        actions={
          <Button disabled>
            <Plus className="mr-2 size-4" />
            Přidat dokument
            <Badge variant="outline" className="ml-2">Připravujeme</Badge>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Platné" value={String(data.documents.filter((item) => item.status === "valid").length)} description="Bez blížícího se konce" icon={FileText} />
        <MetricCard title="Brzy vyprší" value={String(data.documents.filter((item) => item.status === "expiring_soon").length)} description="Napojení na připomínky se připravuje" icon={FileText} />
        <MetricCard title="Prošlé" value={String(data.documents.filter((item) => item.status === "expired").length)} description="Vyžaduje pozornost" icon={FileText} />
      </div>
      {data.documents.length === 0 ? (
        <EmptyState icon={FileText} title="Dokumenty se připravují" description="Metadata a soubory dokumentů budou dostupné po dokončení dokumentového modulu a Supabase Storage toku." />
      ) : null}
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
