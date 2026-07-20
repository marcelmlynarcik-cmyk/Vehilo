"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ReceiptText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Expense, Vehicle } from "@/types/domain";

type ExpenseVehicle = Pick<Vehicle, "id" | "name" | "brand" | "model" | "current_mileage" | "currency">;

const categories = [
  "STK",
  "Dálniční známka",
  "Pojištění",
  "Příslušenství",
  "Pneumatiky",
  "Náhradní díly",
  "Mytí a detailing",
  "Parkování",
  "Mýto",
  "Pokuty",
  "Daně a poplatky",
  "Administrativa",
  "Financování",
  "Ostatní",
];

interface ExpenseFormProps {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: ExpenseVehicle[];
  defaultDate: string;
  expense?: Expense;
}

export function ExpenseForm({ action, vehicles, defaultDate, expense }: ExpenseFormProps) {
  const [vehicleId, setVehicleId] = useState(expense?.vehicle_id ?? vehicles[0]?.id ?? "");
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null;
  const currency = expense?.currency ?? selectedVehicle?.currency ?? "CZK";

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-[rgba(8,17,23,0.42)] p-5 text-sm text-muted-foreground">
        Nejdřív přidejte vozidlo. Potom půjde ukládat STK, pojištění, dálniční známky a další výdaje.
      </div>
    );
  }

  return (
    <form action={action} className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {expense ? <input type="hidden" name="id" value={expense.id} /> : null}
      <input type="hidden" name="vehicle_id" value={selectedVehicle?.id ?? ""} />
      <input type="hidden" name="currency" value={currency} />

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
        <InputWithLabel label="Datum" name="date" type="date" defaultValue={expense?.date ?? defaultDate} required />
        <InputWithLabel
          label="Částka"
          name="amount"
          type="number"
          step="0.01"
          defaultValue={expense?.amount}
          required
        />
        <InputWithLabel
          label="Nájezd"
          name="mileage"
          type="number"
          defaultValue={expense?.mileage ?? selectedVehicle?.current_mileage}
        />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <SelectWithLabel
          label="Kategorie"
          name="category"
          value={expense?.category ?? "Ostatní"}
          items={categories.map((category): [string, string] => [category, category])}
          allowCustom
          customPlaceholder="Například Leasing nebo Čištění interiéru"
        />
        <InputWithLabel
          label="Popis"
          name="description"
          defaultValue={expense?.description}
          placeholder="Například Technická kontrola STK"
          required
        />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <SelectWithLabel
          label="Platba"
          name="payment_method"
          value={expense?.payment_method ?? ""}
          items={[
            ["Hotově", "Hotově"],
            ["Kartou", "Kartou"],
            ["Převodem", "Převodem"],
          ]}
          optional
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense_notes">Poznámky</Label>
        <Textarea id="expense_notes" name="notes" defaultValue={expense?.notes ?? ""} placeholder="Detail účelu, číslo dokladu nebo kontext." />
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
  step,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  const id = `expense_${name}`;

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
        step={step}
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
  optional = false,
  allowCustom = false,
  customPlaceholder,
}: {
  label: string;
  name?: string;
  value: string;
  onValueChange?: (value: string) => void;
  items: Array<[string, string]>;
  optional?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const customValue = "__custom";
  const valueInItems = value === "" || items.some(([itemValue]) => itemValue === value);
  const initialSelectValue = valueInItems ? value : customValue;
  const [internalValue, setInternalValue] = useState(initialSelectValue || noneValue);
  const [customInputValue, setCustomInputValue] = useState(valueInItems ? "" : value);
  const noneValue = "__none";
  const selectedValue = onValueChange ? (valueInItems ? value : customValue) : internalValue || noneValue;
  const formValue = selectedValue === noneValue ? "" : selectedValue === customValue ? customInputValue.trim() : selectedValue;
  const id = `expense_${name ?? label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {name ? <input type="hidden" name={name} value={formValue} /> : null}
      <Select
        value={selectedValue}
        onValueChange={(nextValue) => {
          const resolvedValue = nextValue ?? noneValue;

          if (resolvedValue === noneValue && !optional) {
            return;
          }

          const nextFormValue = resolvedValue === noneValue || resolvedValue === customValue ? "" : resolvedValue;
          setInternalValue(nextFormValue);
          onValueChange?.(nextFormValue);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <span className="truncate text-left">
            {items.find(([itemValue]) => itemValue === formValue)?.[1] ?? (optional ? "Nevybráno" : "Vyberte")}
          </span>
        </SelectTrigger>
        <SelectContent>
          {optional ? <SelectItem value={noneValue}>Nevybráno</SelectItem> : null}
          {items.map(([itemValue, itemLabel]) => (
            <SelectItem key={itemValue} value={itemValue}>
              {itemLabel}
            </SelectItem>
          ))}
          {allowCustom ? <SelectItem value={customValue}>Vlastní kategorie</SelectItem> : null}
        </SelectContent>
      </Select>
      {allowCustom && selectedValue === customValue ? (
        <Input
          value={customInputValue}
          onChange={(event) => setCustomInputValue(event.target.value)}
          placeholder={customPlaceholder ?? "Zadejte vlastní kategorii"}
          required={!optional}
        />
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <ReceiptText className="size-4 animate-pulse" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {pending ? "Ukládám..." : "Uložit výdaj"}
    </Button>
  );
}
