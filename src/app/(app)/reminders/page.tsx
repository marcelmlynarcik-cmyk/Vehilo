import { Bell, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { countReminderStatus } from "@/lib/calculations/costs";
import { loadGarageData } from "@/lib/data/garage";

export default async function RemindersPage() {
  const { data } = await loadGarageData();

  return (
    <div className="space-y-6">
      <PageHeader title="Připomínky" description="Datumové, kilometrové i kombinované připomínky pro servis, dokumenty, pojištění a STK/MOT." actions={<Button><Plus className="mr-2 size-4" />Přidat připomínku</Button>} />
      <Alert>
        <Bell className="size-4" />
        <AlertTitle>Push notifikace budou připravené pro PWA.</AlertTitle>
        <AlertDescription>Zapněte upozornění, abyste dostali připomínku před údržbou, kontrolou nebo vypršením dokumentu.</AlertDescription>
      </Alert>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="OK" value={String(countReminderStatus(data.reminders, "ok"))} description="Vše v pořádku" icon={Bell} />
        <MetricCard title="Brzy splatné" value={String(countReminderStatus(data.reminders, "due_soon"))} description="Vyžaduje plánování" icon={Bell} />
        <MetricCard title="Po termínu" value={String(countReminderStatus(data.reminders, "overdue"))} description="Vyžaduje pozornost" icon={Bell} />
        <MetricCard title="Hotovo" value={String(countReminderStatus(data.reminders, "done"))} description="Dokončené připomínky" icon={Bell} />
      </div>
      {data.reminders.length === 0 ? (
        <EmptyState icon={Bell} title="Zatím žádné připomínky" description="Vehilo bude hlídat olej, filtry, brzdy, STK/MOT, pojištění, dálniční známky, pneumatiky i EV kontroly." actionLabel="Přidat připomínku" />
      ) : null}
      <Card>
        <CardHeader><CardTitle>Chytré návrhy podle typu vozidla</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Suggestion title="Benzín / nafta" items={["Výměna oleje", "Olejový filtr", "Vzduchový filtr", "Rozvody", "Brzdová kapalina", "Pneumatiky"]} />
          <Suggestion title="Elektro" items={["Rotace pneumatik", "Kontrola brzd", "Kabinový filtr", "Zdraví baterie", "Nabíjecí kabel", "HV systém"]} />
          <Suggestion title="Plug-in hybrid" items={["Výměna oleje", "Kontrola baterie", "Nabíjecí systém", "Brzdová kapalina", "Filtry", "Pneumatiky"]} />
        </CardContent>
      </Card>
    </div>
  );
}

function Suggestion({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
      </div>
    </div>
  );
}
