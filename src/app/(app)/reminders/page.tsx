import { Bell, CalendarClock, CheckCircle2, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ReminderForm } from "@/components/forms/reminder-form";
import { countReminderStatus } from "@/lib/calculations/costs";
import { getMileageProgress, getRemainingDays, getRemainingKilometers } from "@/lib/calculations/reminders";
import { loadGarageData } from "@/lib/data/garage";
import { cn } from "@/lib/utils";
import type { Reminder, Vehicle } from "@/types/domain";
import { completeReminder, createReminder, deleteReminder, postponeReminder, updateReminder } from "./actions";

type RemindersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RemindersPage({ searchParams }: RemindersPageProps) {
  const { data } = await loadGarageData();
  const query = await searchParams;
  const defaultDate = formatDateInput(new Date());
  const openReminderDialog = query.add === "reminder";
  const vehicleNames = new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle.name]));
  const reminders = [...data.reminders].sort((a, b) => reminderSortScore(a) - reminderSortScore(b));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Připomínky"
        description="Datumové, kilometrové i kombinované připomínky pro servis, dokumenty, pojištění a STK/MOT."
        actions={<ReminderDialog vehicles={data.vehicles} defaultDate={defaultDate} defaultOpen={openReminderDialog} />}
      />
      <Alert>
        <Bell className="size-4" />
        <AlertTitle>Push notifikace budou součástí připomínek.</AlertTitle>
        <AlertDescription>
          Android a iPhone push doručení naváže na tento seznam, stav připomínek a uživatelské povolení upozornění.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="OK" value={String(countReminderStatus(data.reminders, "ok"))} description="Vše v pořádku" icon={Bell} />
        <MetricCard title="Brzy splatné" value={String(countReminderStatus(data.reminders, "due_soon"))} description="Vyžaduje plánování" icon={Clock3} />
        <MetricCard title="Po termínu" value={String(countReminderStatus(data.reminders, "overdue"))} description="Vyžaduje pozornost" icon={CalendarClock} />
        <MetricCard title="Hotovo" value={String(countReminderStatus(data.reminders, "done"))} description="Dokončené připomínky" icon={CheckCircle2} />
      </div>
      {data.reminders.length === 0 ? (
        <EmptyState icon={Bell} title="Zatím žádné připomínky" description="Vehilo bude hlídat olej, filtry, brzdy, STK/MOT, pojištění, dálniční známky, pneumatiky i EV kontroly." actionLabel="Přidat připomínku" />
      ) : (
        <Card id="records">
          <CardHeader>
            <CardTitle>Seznam připomínek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {reminders.map((reminder) => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                vehicles={data.vehicles}
                vehicleName={vehicleNames.get(reminder.vehicle_id) ?? "Vozidlo"}
                defaultDate={defaultDate}
              />
            ))}
          </CardContent>
        </Card>
      )}
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

function ReminderDialog({
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
        <Plus className="mr-2 size-4" />
        Přidat připomínku
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nová připomínka</DialogTitle>
          <DialogDescription>Nastavte datum, kilometry nebo kombinaci obou. Push upozornění bude navázané na tyto termíny.</DialogDescription>
        </DialogHeader>
        <ReminderForm action={createReminder} vehicles={vehicles} defaultDate={defaultDate} />
      </DialogContent>
    </Dialog>
  );
}

function ReminderRow({
  reminder,
  vehicles,
  vehicleName,
  defaultDate,
}: {
  reminder: Reminder;
  vehicles: Vehicle[];
  vehicleName: string;
  defaultDate: string;
}) {
  const vehicle = vehicles.find((item) => item.id === reminder.vehicle_id) ?? null;
  const remainingDays = getRemainingDays(reminder);
  const remainingKilometers = vehicle ? getRemainingKilometers(reminder, vehicle.current_mileage) : null;
  const progress = vehicle ? getMileageProgress(reminder, vehicle.current_mileage) : 0;
  const active = reminder.status === "due_soon" || reminder.status === "overdue";

  return (
    <div
      className={cn(
        "min-w-0 rounded-[18px] border p-4 transition-colors",
        active
          ? "border-[rgba(246,185,59,0.58)] bg-[rgba(246,185,59,0.12)] shadow-[0_0_0_1px_rgba(246,185,59,0.1),0_18px_44px_rgba(0,0,0,0.22)]"
          : "border-border bg-[rgba(8,17,23,0.42)]",
        reminder.status === "done" && "opacity-70",
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold">{reminder.title}</div>
            <Badge variant={active ? "default" : "secondary"}>{formatReminderStatus(reminder.status)}</Badge>
            <Badge variant="outline">{formatReminderType(reminder.type)}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {vehicleName} · {reminder.category}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {remainingDays == null ? null : <span>{formatRemainingDays(remainingDays)}</span>}
            {remainingKilometers == null ? null : <span>{formatRemainingKilometers(remainingKilometers)}</span>}
            {reminder.next_due_date ? <span>Termín {formatDisplayDate(reminder.next_due_date)}</span> : null}
            {reminder.next_due_mileage == null ? null : <span>{formatNumber(reminder.next_due_mileage)} km</span>}
          </div>
          {reminder.next_due_mileage != null && reminder.last_done_mileage != null ? (
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          {reminder.notes ? <div className="text-sm text-muted-foreground">{reminder.notes}</div> : null}
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <CompleteReminderDialog reminder={reminder} vehicle={vehicle} />
          <PostponeReminderDialog reminder={reminder} />
          <EditReminderDialog reminder={reminder} vehicles={vehicles} defaultDate={defaultDate} />
          <DeleteReminderDialog reminder={reminder} />
        </div>
      </div>
    </div>
  );
}

function CompleteReminderDialog({ reminder, vehicle }: { reminder: Reminder; vehicle: Vehicle | null }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
        Hotovo
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Označit jako hotovo?</DialogTitle>
          <DialogDescription>Po dokončení se můžete rovnou rozhodnout, jestli má Vehilo vytvořit stejnou připomínku znovu.</DialogDescription>
        </DialogHeader>
        <form action={completeReminder} className="space-y-4">
          <input type="hidden" name="id" value={reminder.id} />
          <div className="space-y-2">
            <Label htmlFor={`done-mileage-${reminder.id}`}>Aktuální nájezd</Label>
            <Input id={`done-mileage-${reminder.id}`} name="done_mileage" type="number" min={0} defaultValue={vehicle?.current_mileage ?? reminder.next_due_mileage ?? ""} />
          </div>
          <label className="flex items-start gap-3 rounded-[14px] border border-border bg-[rgba(8,17,23,0.42)] p-3 text-sm">
            <input type="checkbox" name="create_next" value="true" className="mt-0.5 size-4 accent-[var(--accent)]" />
            <span>Vytvořit stejnou připomínku znovu podle nastaveného intervalu.</span>
          </label>
          <Button type="submit" className="w-full gap-2">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Uložit dokončení
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PostponeReminderDialog({ reminder }: { reminder: Reminder }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Clock3 className="mr-2 size-4" aria-hidden="true" />
        Odložit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odložit připomínku</DialogTitle>
          <DialogDescription>Zadejte vlastní počet dní, kilometrů nebo obojí.</DialogDescription>
        </DialogHeader>
        <form action={postponeReminder} className="space-y-4">
          <input type="hidden" name="id" value={reminder.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`postpone-days-${reminder.id}`}>Dní</Label>
              <Input id={`postpone-days-${reminder.id}`} name="postpone_days" type="number" min={0} placeholder="Např. 14" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`postpone-km-${reminder.id}`}>Kilometrů</Label>
              <Input id={`postpone-km-${reminder.id}`} name="postpone_km" type="number" min={0} placeholder="Např. 1000" />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            <Clock3 className="size-4" aria-hidden="true" />
            Odložit připomínku
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditReminderDialog({ reminder, vehicles, defaultDate }: { reminder: Reminder; vehicles: Vehicle[]; defaultDate: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="mr-2 size-4" aria-hidden="true" />
        Upravit
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upravit připomínku</DialogTitle>
          <DialogDescription>Změny se uloží do stejné připomínky a přepočítají její termín.</DialogDescription>
        </DialogHeader>
        <ReminderForm action={updateReminder} vehicles={vehicles} defaultDate={defaultDate} reminder={reminder} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteReminderDialog({ reminder }: { reminder: Reminder }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        Smazat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smazat připomínku?</DialogTitle>
          <DialogDescription>Tato připomínka se odstraní ze seznamu i budoucích upozornění.</DialogDescription>
        </DialogHeader>
        <form action={deleteReminder} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={reminder.id} />
          <Button variant="destructive" type="submit" className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Smazat připomínku
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Suggestion({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-muted/35 p-4">
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
      </div>
    </div>
  );
}

function reminderSortScore(reminder: Reminder) {
  const statusScore: Record<string, number> = {
    overdue: 0,
    due_soon: 1,
    upcoming: 2,
    ok: 3,
    done: 4,
  };

  return statusScore[reminder.status] ?? 5;
}

function formatReminderStatus(value: string) {
  const labels: Record<string, string> = {
    ok: "OK",
    upcoming: "Naplánováno",
    due_soon: "Brzy splatné",
    overdue: "Po termínu",
    done: "Hotovo",
  };

  return labels[value] ?? value;
}

function formatReminderType(value: string) {
  const labels: Record<string, string> = {
    date: "Datum",
    mileage: "Kilometry",
    combined: "Datum + km",
  };

  return labels[value] ?? value;
}

function formatRemainingDays(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} dní po termínu`;
  }

  if (days === 0) {
    return "Dnes";
  }

  return `Za ${days} dní`;
}

function formatRemainingKilometers(kilometers: number) {
  if (kilometers < 0) {
    return `${formatNumber(Math.abs(kilometers))} km po termínu`;
  }

  return `Za ${formatNumber(kilometers)} km`;
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDateInput(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Number(value));
}
