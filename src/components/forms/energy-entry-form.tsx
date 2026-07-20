"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { BatteryCharging, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EnergyEntryType, PowertrainType, QuantityUnit, Vehicle } from "@/types/domain";

type EnergyVehicle = Pick<
  Vehicle,
  "id" | "name" | "brand" | "model" | "powertrain_type" | "current_mileage"
>;

const entryTypeLabels: Record<EnergyEntryType, string> = {
  fuel: "Tankování",
  charging: "Nabíjení",
  lpg: "LPG",
  cng: "CNG",
};

const unitLabels: Record<QuantityUnit, string> = {
  liters: "l",
  gallons: "gal",
  kWh: "kWh",
  kg: "kg",
};

interface EnergyEntryFormProps {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: EnergyVehicle[];
  defaultDate: string;
}

export function EnergyEntryForm({ action, vehicles, defaultDate }: EnergyEntryFormProps) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null,
    [vehicleId, vehicles],
  );
  const [entryType, setEntryType] = useState<EnergyEntryType>(
    selectedVehicle ? defaultEntryType(selectedVehicle.powertrain_type) : "fuel",
  );

  useEffect(() => {
    if (selectedVehicle) {
      setEntryType(defaultEntryType(selectedVehicle.powertrain_type));
    }
  }, [selectedVehicle]);

  const availableEntryTypes = selectedVehicle
    ? entryTypesForPowertrain(selectedVehicle.powertrain_type)
    : (["fuel"] satisfies EnergyEntryType[]);
  const quantityUnit = defaultQuantityUnit(entryType);
  const isCharging = entryType === "charging";

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-[rgba(8,17,23,0.42)] p-5 text-sm text-muted-foreground">
        Nejdřív přidejte vozidlo. Potom půjde ukládat tankování, LPG, CNG nebo nabíjení.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="vehicle_id" value={selectedVehicle?.id ?? ""} />
      <input type="hidden" name="entry_type" value={entryType} />
      <input type="hidden" name="quantity_unit" value={quantityUnit} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          label="Typ záznamu"
          value={entryType}
          onValueChange={(value) => setEntryType(value as EnergyEntryType)}
          items={availableEntryTypes.map((type): [string, string] => [type, entryTypeLabels[type]])}
        />
        <InputWithLabel label="Datum" name="date" type="date" defaultValue={defaultDate} required />
        <InputWithLabel
          label="Nájezd"
          name="mileage"
          type="number"
          defaultValue={selectedVehicle?.current_mileage}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputWithLabel
          label={isCharging ? `Množství (${unitLabels[quantityUnit]})` : `Natankováno (${unitLabels[quantityUnit]})`}
          name="quantity"
          type="number"
          step="0.001"
          required
        />
        <InputWithLabel label="Celková cena" name="total_price" type="number" step="0.01" required />
        <InputWithLabel
          label={isCharging ? `Cena za ${unitLabels[quantityUnit]}` : `Cena za ${unitLabels[quantityUnit]}`}
          name="unit_price"
          type="number"
          step="0.001"
        />
        <SelectWithLabel
          label="Typ jízdy"
          name="driving_type"
          value=""
          items={[
            ["city", "Město"],
            ["mixed", "Kombinovaně"],
            ["highway", "Dálnice"],
            ["long_trip", "Delší trasa"],
          ]}
          optional
        />
      </div>

      {isCharging ? <ChargingFields /> : <FuelFields entryType={entryType} />}

      <div className="space-y-2">
        <Label htmlFor="energy_notes">Poznámky</Label>
        <Textarea id="energy_notes" name="notes" placeholder="Například aditivum, sleva, počasí nebo styl jízdy." />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function FuelFields({ entryType }: { entryType: EnergyEntryType }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <InputWithLabel
        label={entryType === "lpg" || entryType === "cng" ? "Plnicí stanice" : "Čerpací stanice"}
        name="fuel_station"
      />
      <CheckField name="full_tank" label="Plná nádrž" defaultChecked />
    </div>
  );
}

function ChargingFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <InputWithLabel label="Místo nabíjení" name="charging_location" />
      <SelectWithLabel
        label="Typ nabíjení"
        name="charging_type"
        value=""
        items={[
          ["home", "Domácí"],
          ["workplace", "Práce"],
          ["public_ac", "Veřejné AC"],
          ["public_dc", "Veřejné DC"],
          ["other", "Jiné"],
        ]}
        optional
      />
      <InputWithLabel label="Poskytovatel" name="charging_provider" />
      <CheckField name="full_charge" label="Plné nabití" />
      <InputWithLabel label="Baterie před (%)" name="battery_before_percent" type="number" min="0" max="100" />
      <InputWithLabel label="Baterie po (%)" name="battery_after_percent" type="number" min="0" max="100" />
    </div>
  );
}

function InputWithLabel({
  label,
  name,
  type = "text",
  required = false,
  step,
  min,
  max,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  defaultValue?: string | number | null;
}) {
  const id = `energy_${name}`;

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
        min={min}
        max={max}
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
  items,
  optional = false,
}: {
  label: string;
  name?: string;
  value: string;
  onValueChange?: (value: string) => void;
  items: Array<[string, string]>;
  optional?: boolean;
}) {
  const [internalValue, setInternalValue] = useState(value);
  const noneValue = "__none";
  const selectedValue = onValueChange ? value : internalValue || noneValue;
  const formValue = selectedValue === noneValue ? "" : selectedValue;
  const id = `energy_${name ?? label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {name ? <input type="hidden" name={name} value={formValue} /> : null}
      <Select
        value={selectedValue}
        onValueChange={(nextValue) => {
          const resolvedValue = nextValue ?? noneValue;

          if (resolvedValue === noneValue && !optional) {
            return;
          }

          const nextFormValue = resolvedValue === noneValue ? "" : resolvedValue;

          setInternalValue(nextFormValue);
          onValueChange?.(nextFormValue);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectDisplay value={formValue} items={items} placeholder={optional ? "Nevybráno" : "Vyberte"} />
        </SelectTrigger>
        <SelectContent>
          {optional ? <SelectItem value={noneValue}>Nevybráno</SelectItem> : null}
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

function SelectDisplay({
  value,
  items,
  placeholder,
}: {
  value: string;
  items: Array<[string, string]>;
  placeholder: string;
}) {
  return (
    <span className="truncate text-left">
      {items.find(([itemValue]) => itemValue === value)?.[1] ?? placeholder}
    </span>
  );
}

function CheckField({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[14px] border border-input bg-input px-3.5 text-sm font-medium text-foreground">
      <input
        name={name}
        value="true"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border accent-[var(--accent-green)]"
      />
      {label}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? (
        <BatteryCharging className="size-4 animate-pulse" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {pending ? "Ukládám..." : "Uložit záznam"}
    </Button>
  );
}

function entryTypesForPowertrain(powertrain: PowertrainType): EnergyEntryType[] {
  if (powertrain === "electric") {
    return ["charging"];
  }

  if (powertrain === "plug_in_hybrid") {
    return ["fuel", "charging"];
  }

  if (powertrain === "lpg") {
    return ["lpg"];
  }

  if (powertrain === "cng") {
    return ["cng"];
  }

  return ["fuel"];
}

function defaultEntryType(powertrain: PowertrainType): EnergyEntryType {
  return entryTypesForPowertrain(powertrain)[0] ?? "fuel";
}

function defaultQuantityUnit(entryType: EnergyEntryType): QuantityUnit {
  if (entryType === "charging") {
    return "kWh";
  }

  if (entryType === "cng") {
    return "kg";
  }

  return "liters";
}
