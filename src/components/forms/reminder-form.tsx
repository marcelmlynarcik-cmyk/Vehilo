"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Reminder, ReminderType, Vehicle } from "@/types/domain";

type ReminderVehicle = Pick<Vehicle, "id" | "name" | "brand" | "model" | "current_mileage">;

const reminderTypeLabels: Record<ReminderType, string> = {
  date: "Datum",
  mileage: "Kilometry",
  combined: "Datum + kilometry",
};

const reminderCategories = [
  "Servis",
  "Dokumenty",
  "Pojištění",
  "STK/MOT",
  "Emise",
  "Pneumatiky",
  "Olej a filtry",
  "Brzdy",
  "Baterie",
  "Ostatní",
];

interface ReminderFormProps {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: ReminderVehicle[];
  defaultDate: string;
  reminder?: Reminder;
}

export function ReminderForm({ action, vehicles, defaultDate, reminder }: ReminderFormProps) {
  const [vehicleId, setVehicleId] = useState(reminder?.vehicle_id ?? vehicles[0]?.id ?? "");
  const [type, setType] = useState<ReminderType>(reminder?.type ?? "date");
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null;
  const showDateFields = type === "date" || type === "combined";
  const showMileageFields = type === "mileage" || type === "combined";

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-[rgba(8,17,23,0.42)] p-5 text-sm text-muted-foreground">
        Nejdřív přidejte vozidlo. Potom půjde ukládat připomínky k datu, kilometrům nebo obojímu.
      </div>
    );
  }

  return (
    <form action={action} className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {reminder ? <input type="hidden" name="id" value={reminder.id} /> : null}
      <input type="hidden" name="vehicle_id" value={selectedVehicle?.id ?? ""} />
      <input type="hidden" name="type" value={type} />

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectWithLabel
          label="Vozidlo"
          value={vehicleId}
          onValueChange={setVehicleId}
          items={vehicles.map((vehicle): [string, string] => [
            vehicle.id,
            `${vehicle.name} - ${vehicle.brand} ${vehicle.model}`,
          ])}
        />
        <SelectWithLabel
          label="Typ připomínky"
          value={type}
          onValueChange={(value) => setType(value as ReminderType)}
          items={Object.entries(reminderTypeLabels)}
        />
        <InputWithLabel
          label="Název"
          name="title"
          defaultValue={reminder?.title}
          placeholder="Například Výměna oleje"
          required
        />
        <SelectWithLabel
          label="Kategorie"
          name="category"
          value={reminder?.category ?? reminderCategories[0]}
          items={reminderCategories.map((category): [string, string] => [category, category])}
        />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {showDateFields ? (
          <>
            <InputWithLabel
              label="Další termín"
              name="next_due_date"
              type="date"
              defaultValue={reminder?.next_due_date ?? reminder?.due_date ?? defaultDate}
              required
            />
            <InputWithLabel
              label="Upozornit dní předem"
              name="notify_before_days"
              type="number"
              defaultValue={reminder?.notify_before_days ?? 14}
            />
          </>
        ) : null}
        {showMileageFields ? (
          <>
            <InputWithLabel
              label="Další km"
              name="next_due_mileage"
              type="number"
              defaultValue={reminder?.next_due_mileage ?? selectedVehicle?.current_mileage}
              required
            />
            <InputWithLabel
              label="Upozornit km předem"
              name="notify_before_km"
              type="number"
              defaultValue={reminder?.notify_before_km ?? 1000}
            />
          </>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputWithLabel label="Opakovat po dnech" name="interval_days" type="number" defaultValue={reminder?.interval_days} />
        <InputWithLabel label="Opakovat po měsících" name="interval_months" type="number" defaultValue={reminder?.interval_months} />
        <InputWithLabel label="Opakovat po letech" name="interval_years" type="number" defaultValue={reminder?.interval_years} />
        <InputWithLabel label="Opakovat po km" name="interval_km" type="number" defaultValue={reminder?.interval_km} />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <InputWithLabel label="Naposledy hotovo" name="last_done_date" type="date" defaultValue={reminder?.last_done_date} />
        <InputWithLabel label="Naposledy hotovo při km" name="last_done_mileage" type="number" defaultValue={reminder?.last_done_mileage} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_notes">Poznámky</Label>
        <Textarea id="reminder_notes" name="notes" defaultValue={reminder?.notes ?? ""} placeholder="Například značka oleje, číslo pojistky nebo co přesně zkontrolovat." />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function InputWithLabel({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  const id = `reminder_${name}`;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectWithLabel({
  label,
  name,
  value,
  onValueChange,
  items,
}: {
  label: string;
  name?: string;
  value: string;
  onValueChange?: (value: string) => void;
  items: Array<[string, string]>;
}) {
  const [internalValue, setInternalValue] = useState(value);
  const selectedValue = onValueChange ? value : internalValue;
  const id = `reminder_${name ?? label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <Select
        value={selectedValue}
        onValueChange={(nextValue) => {
          if (!nextValue) {
            return;
          }

          setInternalValue(nextValue);
          onValueChange?.(nextValue);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <span className="truncate text-left">
            {items.find(([itemValue]) => itemValue === selectedValue)?.[1] ?? "Vyberte"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {items.map(([itemValue, itemLabel]) => (
            <SelectItem key={itemValue} value={itemValue}>
              {itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <Bell className="size-4 animate-pulse" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {pending ? "Ukládám..." : "Uložit připomínku"}
    </Button>
  );
}
