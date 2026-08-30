"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vehicle, VehicleDocument } from "@/types/domain";

type DocumentVehicle = Pick<Vehicle, "id" | "name" | "brand" | "model">;

const documentCategories = [
  "Technický průkaz",
  "Pojištění",
  "STK/MOT",
  "Emise",
  "Servisní faktura",
  "Kupní smlouva",
  "Leasing",
  "Dálniční známka",
  "Parkovací povolení",
  "Ostatní",
];

interface DocumentFormProps {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: DocumentVehicle[];
  defaultVehicleId?: string;
  document?: VehicleDocument;
}

export function DocumentForm({ action, vehicles, defaultVehicleId, document }: DocumentFormProps) {
  const requestedVehicleId = document?.vehicle_id ?? defaultVehicleId ?? "";
  const initialVehicleId = vehicles.some((vehicle) => vehicle.id === requestedVehicleId) ? requestedVehicleId : vehicles[0]?.id ?? "";
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null;
  const selectedCategory = document?.category ?? documentCategories[0];

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-[rgba(8,17,23,0.42)] p-5 text-sm text-muted-foreground">
        Nejdřív přidejte vozidlo. Potom půjde ukládat doklady, smlouvy, pojištění a další dokumenty.
      </div>
    );
  }

  return (
    <form action={action} encType="multipart/form-data" className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {document ? <input type="hidden" name="id" value={document.id} /> : null}
      <input type="hidden" name="vehicle_id" value={selectedVehicle?.id ?? ""} />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
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
          label="Kategorie"
          name="category"
          value={selectedCategory}
          items={documentCategories.map((category): [string, string] => [category, category])}
          allowCustom
          customPlaceholder="Například zelená karta, povolení nebo smlouva"
        />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <InputWithLabel label="Název" name="name" defaultValue={document?.name} placeholder="Například Povinné ručení 2026" required />
        <InputWithLabel label="Datum vystavení" name="issue_date" type="date" defaultValue={document?.issue_date} />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <InputWithLabel label="Platí do" name="expiration_date" type="date" defaultValue={document?.expiration_date} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document_notes">Poznámky</Label>
        <Textarea id="document_notes" name="notes" defaultValue={document?.notes ?? ""} placeholder="Číslo smlouvy, pojišťovna, kde je originál nebo další detail." />
      </div>

      <div className="space-y-3 rounded-[18px] border border-border bg-[rgba(8,17,23,0.42)] p-4">
        <div>
          <Label htmlFor="document_file">Soubor dokumentu</Label>
          <p className="mt-1 text-xs text-muted-foreground">PDF nebo obrázek, maximálně 10 MB.</p>
        </div>
        <Input id="document_file" name="document_file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" />
        {document?.file_url ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="remove_file" value="true" className="size-4 accent-[var(--accent)]" />
            Odstranit stávající soubor
          </label>
        ) : null}
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
  const id = `document_${name}`;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input id={id} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </div>
  );
}

function SelectWithLabel({
  label,
  name,
  value,
  onValueChange,
  items,
  allowCustom = false,
  customPlaceholder,
}: {
  label: string;
  name?: string;
  value: string;
  onValueChange?: (value: string) => void;
  items: Array<[string, string]>;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const customValue = "__custom";
  const valueInItems = items.some(([itemValue]) => itemValue === value);
  const initialSelectValue = valueInItems ? value : customValue;
  const [internalValue, setInternalValue] = useState(initialSelectValue);
  const [customInputValue, setCustomInputValue] = useState(valueInItems ? "" : value);
  const selectedValue = onValueChange ? (valueInItems ? value : customValue) : internalValue;
  const formValue = selectedValue === customValue ? customInputValue.trim() : selectedValue;
  const id = `document_${name ?? label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {name ? <input type="hidden" name={name} value={formValue} /> : null}
      <Select
        value={selectedValue}
        onValueChange={(nextValue) => {
          const resolvedValue = nextValue ?? customValue;
          const nextFormValue = resolvedValue === customValue ? "" : resolvedValue;
          setInternalValue(resolvedValue);
          onValueChange?.(nextFormValue);
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
          {allowCustom ? <SelectItem value={customValue}>Vlastní kategorie</SelectItem> : null}
        </SelectContent>
      </Select>
      {allowCustom && selectedValue === customValue ? (
        <Input
          value={customInputValue}
          onChange={(event) => setCustomInputValue(event.target.value)}
          placeholder={customPlaceholder ?? "Zadejte vlastní kategorii"}
          required
        />
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <FileText className="size-4 animate-pulse" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {pending ? "Ukládám..." : "Uložit dokument"}
    </Button>
  );
}
