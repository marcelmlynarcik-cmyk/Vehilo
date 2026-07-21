"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Save, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PowertrainType, ServiceEntry, Vehicle } from "@/types/domain";

type ServiceVehicle = Pick<Vehicle, "id" | "name" | "brand" | "model" | "current_mileage" | "currency" | "powertrain_type">;

const sharedServiceTypes = [
  "Pravidelná údržba",
  "Brzdy",
  "Pneumatiky",
  "Podvozek",
  "Řízení",
  "Klimatizace",
  "Karoserie a skla",
  "Elektroinstalace",
  "Baterie",
  "Světla",
  "Diagnostika",
  "Bezpečnostní systémy",
  "Interiér",
  "Oprava",
  "Ostatní servis",
];

const combustionServiceTypes = [
  "Olej a filtry",
  "Palivový filtr",
  "Vzduchový filtr",
  "Kabinový filtr",
  "Rozvody",
  "Motor",
  "Turbo",
  "Vstřikování",
  "Výfuk",
  "Chlazení motoru",
  "Spojka",
  "Převodovka",
  "DPF / emise",
  "Zapalování",
];

const electricServiceTypes = [
  "Trakční baterie",
  "Nabíjecí systém",
  "Nabíjecí port",
  "Nabíjecí kabel",
  "Elektromotor",
  "Invertor",
  "Rekuperace",
  "Tepelné čerpadlo",
  "Software",
  "Chlazení baterie",
];

interface ServiceEntryFormProps {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: ServiceVehicle[];
  defaultDate: string;
  entry?: ServiceEntry;
}

export function ServiceEntryForm({ action, vehicles, defaultDate, entry }: ServiceEntryFormProps) {
  const [vehicleId, setVehicleId] = useState(entry?.vehicle_id ?? vehicles[0]?.id ?? "");
  const [laborCost, setLaborCost] = useState(formatDecimalInput(entry?.labor_cost));
  const [partsCost, setPartsCost] = useState(formatDecimalInput(entry?.parts_cost));
  const [totalCost, setTotalCost] = useState(formatDecimalInput(entry?.total_cost));
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null;
  const currency = entry?.currency ?? selectedVehicle?.currency ?? "CZK";
  const availableServiceTypes = selectedVehicle ? serviceTypesForPowertrain(selectedVehicle.powertrain_type) : sharedServiceTypes;
  const selectedServiceType = entry?.service_type ?? availableServiceTypes[0] ?? "Ostatní servis";

  useEffect(() => {
    const labor = parseDecimal(laborCost);
    const parts = parseDecimal(partsCost);

    if (labor == null && parts == null) {
      return;
    }

    setTotalCost(String(Math.round(((labor ?? 0) + (parts ?? 0)) * 100) / 100));
  }, [laborCost, partsCost]);

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-[rgba(8,17,23,0.42)] p-5 text-sm text-muted-foreground">
        Nejdřív přidejte vozidlo. Potom půjde ukládat servisní zásahy, díly a záruky.
      </div>
    );
  }

  return (
    <form action={action} encType="multipart/form-data" className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
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
        <InputWithLabel label="Datum" name="date" type="date" defaultValue={entry?.date ?? defaultDate} required />
        <InputWithLabel
          label="Nájezd"
          name="mileage"
          type="number"
          defaultValue={entry?.mileage ?? selectedVehicle?.current_mileage}
          required
        />
        <SelectWithLabel
          key={vehicleId}
          label="Typ servisu"
          name="service_type"
          value={selectedServiceType}
          items={availableServiceTypes.map((type): [string, string] => [type, type])}
          allowCustom
          customPlaceholder="Například geometrie, výměna zámku nebo servis tažného zařízení"
        />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <InputWithLabel
          label="Popis"
          name="description"
          defaultValue={entry?.description}
          placeholder="Například Výměna filtrů a oleje"
          required
        />
        <InputWithLabel label="Servis / dodavatel" name="provider" defaultValue={entry?.provider} />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <InputWithLabel label="Práce" name="labor_cost" type="number" step="0.01" value={laborCost} onChange={setLaborCost} />
        <InputWithLabel label="Díly" name="parts_cost" type="number" step="0.01" value={partsCost} onChange={setPartsCost} />
        <InputWithLabel label="Celkem" name="total_cost" type="number" step="0.01" value={totalCost} onChange={setTotalCost} required />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <InputWithLabel label="Vyměněné díly" name="parts_changed" defaultValue={entry?.parts_changed} />
        <InputWithLabel label="Záruka do data" name="warranty_until_date" type="date" defaultValue={entry?.warranty_until_date} />
        <InputWithLabel label="Záruka do km" name="warranty_until_mileage" type="number" defaultValue={entry?.warranty_until_mileage} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service_notes">Poznámky</Label>
        <Textarea id="service_notes" name="notes" defaultValue={entry?.notes ?? ""} placeholder="Co přesně se dělalo, značky dílů nebo souvislost s poruchou." />
      </div>

      <div className="space-y-3 rounded-[18px] border border-border bg-[rgba(8,17,23,0.42)] p-4">
        <div>
          <Label htmlFor="service_invoice_file">Faktura / dokument / fotka</Label>
          <p className="mt-1 text-xs text-muted-foreground">PDF nebo obrázek, maximálně 10 MB.</p>
        </div>
        <Input id="service_invoice_file" name="invoice_file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" />
        {entry?.invoice_url ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="remove_invoice" value="true" className="size-4 accent-[var(--accent)]" />
            Odstranit stávající přílohu
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
  step,
  defaultValue,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string | number | null;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const id = `service_${name}`;

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
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        defaultValue={value === undefined ? defaultValue ?? "" : undefined}
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
  const id = `service_${name ?? label.toLowerCase().replace(/\s+/g, "_")}`;

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
      {pending ? <Wrench className="size-4 animate-pulse" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {pending ? "Ukládám..." : "Uložit servis"}
    </Button>
  );
}

function parseDecimal(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDecimalInput(value: number | null | undefined) {
  return value == null || !Number.isFinite(Number(value)) ? "" : String(Number(value));
}

function serviceTypesForPowertrain(powertrain: PowertrainType) {
  if (powertrain === "electric") {
    return mergeServiceTypes(sharedServiceTypes, electricServiceTypes);
  }

  if (powertrain === "plug_in_hybrid" || powertrain === "hybrid") {
    return mergeServiceTypes(sharedServiceTypes, combustionServiceTypes, electricServiceTypes);
  }

  return mergeServiceTypes(sharedServiceTypes, combustionServiceTypes);
}

function mergeServiceTypes(...groups: string[][]) {
  return [...new Set(groups.flat())];
}
