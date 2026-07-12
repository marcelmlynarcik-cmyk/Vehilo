"use client";

import { useFormStatus } from "react-dom";
import { Archive, BatteryCharging, Car, Save, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vehicle } from "@/types/domain";

type VehiclePowertrain =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plug_in_hybrid"
  | "electric"
  | "lpg"
  | "cng";

interface VehicleFormProps {
  action: (formData: FormData) => void | Promise<void>;
  archiveAction?: (formData: FormData) => void | Promise<void>;
  vehicle?: Vehicle;
  defaultCurrency?: string;
  mode?: "create" | "edit";
}

export function VehicleForm({
  action,
  archiveAction,
  vehicle,
  defaultCurrency = "CZK",
  mode = "create",
}: VehicleFormProps) {
  const [powertrain, setPowertrain] = useState<VehiclePowertrain>(
    vehicle?.powertrain_type ?? "diesel",
  );
  const [status, setStatus] = useState<string>(vehicle?.status ?? "active");
  const [currency, setCurrency] = useState(vehicle?.currency ?? defaultCurrency);
  const [transmission, setTransmission] = useState(vehicle?.transmission ?? "");
  const [bodyType, setBodyType] = useState(vehicle?.body_type ?? "");
  const isElectric = powertrain === "electric" || powertrain === "plug_in_hybrid";
  const isCombustion = powertrain !== "electric";
  const isGas = powertrain === "lpg" || powertrain === "cng";
  const helperText =
    powertrain === "electric"
      ? "Vehilo bude pro toto vozidlo používat kWh a kWh/100 km."
      : powertrain === "cng"
        ? "Vehilo bude pro CNG používat kg a kg/100 km."
      : "Vehilo použije správné jednotky paliva, energie a spotřeby podle typu pohonu.";

  return (
    <form action={action} className="space-y-4">
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      <FormSection title="Základní údaje">
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Název vozidla" name="name" defaultValue={vehicle?.name} required />
          <InputWithLabel label="Značka" name="brand" defaultValue={vehicle?.brand} required />
          <InputWithLabel label="Model" name="model" defaultValue={vehicle?.model} required />
          <InputWithLabel label="Generace" name="generation" defaultValue={vehicle?.generation} />
          <InputWithLabel label="Výbava" name="trim" defaultValue={vehicle?.trim} />
          <InputWithLabel label="Rok výroby" name="year" type="number" defaultValue={vehicle?.year} />
          <InputWithLabel label="VIN" name="vin" defaultValue={vehicle?.vin} />
          <InputWithLabel label="SPZ" name="license_plate" defaultValue={vehicle?.license_plate} />
          <SelectWithLabel
            label="Stav"
            name="status"
            value={status}
            onValueChange={setStatus}
            placeholder="Vyberte stav"
            items={[
              ["active", "Aktivní"],
              ["sold", "Prodané"],
              ["archived", "Archivované"],
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="Typ vozidla">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="powertrain_type">Typ pohonu</Label>
            <input type="hidden" name="powertrain_type" value={powertrain} />
            <Select
              value={powertrain}
              onValueChange={(value) => {
                if (value) {
                  setPowertrain(value as VehiclePowertrain);
                }
              }}
            >
              <SelectTrigger id="powertrain_type" className="w-full">
                <SelectValue placeholder="Vyberte pohon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petrol">Benzín</SelectItem>
                <SelectItem value="diesel">Nafta</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="plug_in_hybrid">Plug-in hybrid</SelectItem>
                <SelectItem value="electric">Elektro</SelectItem>
                <SelectItem value="lpg">LPG</SelectItem>
                <SelectItem value="cng">CNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SelectWithLabel
            label="Karoserie"
            name="body_type"
            value={bodyType}
            onValueChange={setBodyType}
            placeholder="Vyberte karoserii"
            items={[
              ["hatchback", "Hatchback"],
              ["sedan", "Sedan"],
              ["wagon", "Combi"],
              ["suv", "SUV"],
              ["van", "Van"],
              ["coupe", "Coupe"],
              ["convertible", "Cabrio"],
              ["pickup", "Pickup"],
              ["other", "Jiné"],
            ]}
          />
          <SelectWithLabel
            label="Převodovka"
            name="transmission"
            value={transmission}
            onValueChange={setTransmission}
            placeholder="Vyberte převodovku"
            items={[
              ["manual", "Manuální"],
              ["automatic", "Automatická"],
            ]}
          />
          <InputWithLabel label="Motor" name="engine" defaultValue={vehicle?.engine} />
          <InputWithLabel label="Výkon" name="power" defaultValue={vehicle?.power} />
          {isElectric ? (
            <InputWithLabel
              label="Kapacita baterie v kWh"
              name="battery_capacity_kwh"
              type="number"
              step="0.1"
              defaultValue={vehicle?.battery_capacity_kwh}
            />
          ) : null}
          {isCombustion ? (
            <InputWithLabel
              label="Objem palivové nádrže"
              name="fuel_tank_size"
              type="number"
              step="0.1"
              defaultValue={vehicle?.fuel_tank_size}
            />
          ) : null}
          {isGas ? (
            <InputWithLabel
              label="Objem LPG/CNG nádrže"
              name="lpg_cng_tank_size"
              type="number"
              step="0.1"
              defaultValue={vehicle?.lpg_cng_tank_size}
            />
          ) : null}
        </div>
        <Card className="mt-4">
          <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
            <BatteryCharging className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {helperText}
          </CardContent>
        </Card>
      </FormSection>

      <FormSection title="Nákup">
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Datum nákupu" name="purchase_date" type="date" defaultValue={vehicle?.purchase_date} />
          <InputWithLabel label="Nájezd při nákupu" name="purchase_mileage" type="number" defaultValue={vehicle?.purchase_mileage} />
          <InputWithLabel label="Kupní cena" name="purchase_price" type="number" step="0.01" defaultValue={vehicle?.purchase_price} />
          <SelectWithLabel
            label="Měna"
            name="currency"
            value={currency}
            onValueChange={setCurrency}
            placeholder="Vyberte měnu"
            items={[
              ["CZK", "CZK"],
              ["EUR", "EUR"],
              ["USD", "USD"],
              ["GBP", "GBP"],
              ["PLN", "PLN"],
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="Aktuální údaje">
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Aktuální nájezd" name="current_mileage" type="number" defaultValue={vehicle?.current_mileage} required />
          <InputWithLabel label="Aktuální odhadovaná hodnota" name="current_value" type="number" step="0.01" defaultValue={vehicle?.current_value} />
          <InputWithLabel label="Pojišťovna" name="insurance_provider" defaultValue={vehicle?.insurance_provider} />
          <InputWithLabel label="Hlavní řidič" name="primary_driver" defaultValue={vehicle?.primary_driver} />
          <InputWithLabel label="URL fotografie" name="photo_url" defaultValue={vehicle?.photo_url} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Poznámky</Label>
            <Textarea id="notes" name="notes" defaultValue={vehicle?.notes ?? ""} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Média">
        <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <Upload className="mb-2 size-6 text-muted-foreground" aria-hidden="true" />
          <div className="font-medium">Nahrání fotografie vozidla</div>
          <div className="text-sm text-muted-foreground">
            Upload do Supabase Storage navážeme v dalším kroku. Teď lze uložit externí URL fotografie.
          </div>
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        {mode === "edit" && archiveAction && vehicle?.status !== "archived" ? (
          <Button variant="outline" formAction={archiveAction} className="gap-2 text-muted-foreground">
            <Archive className="size-4" aria-hidden="true" />
            Archivovat vozidlo
          </Button>
        ) : (
          <div />
        )}
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="mb-4 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function InputWithLabel({
  label,
  name,
  type = "text",
  required = false,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string | number | null;
}) {
  const id = `vehicle_${name}`;

  return (
    <div className="space-y-2">
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
      />
    </div>
  );
}

function SelectWithLabel({
  label,
  name,
  value,
  onValueChange,
  placeholder,
  items,
}: {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: Array<[string, string]>;
}) {
  const id = `vehicle_${name}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
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

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="gap-2" disabled={pending}>
      {mode === "create" ? (
        <Car className="size-4" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {pending ? "Ukládám..." : mode === "create" ? "Uložit vozidlo" : "Uložit změny"}
    </Button>
  );
}
