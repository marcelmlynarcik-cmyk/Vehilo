"use client";

import { BatteryCharging, Car, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type VehiclePowertrain =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plug_in_hybrid"
  | "electric"
  | "lpg"
  | "cng";

export function VehicleForm() {
  const [powertrain, setPowertrain] = useState<VehiclePowertrain>("petrol");
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
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        console.info("Formulář vozidla je připravený pro vložení do Supabase.");
      }}
    >
      <FormSection title="Základní údaje">
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Název vozidla" required />
          <InputWithLabel label="Značka" required />
          <InputWithLabel label="Model" required />
          <InputWithLabel label="Generace / výbava" />
          <InputWithLabel label="Rok výroby" type="number" />
          <InputWithLabel label="VIN" />
          <InputWithLabel label="SPZ" />
          <SelectWithLabel label="Stav" placeholder="Vyberte stav" items={["Aktivní", "Prodáno", "Archivováno"]} />
        </div>
      </FormSection>

      <FormSection title="Typ vozidla">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Typ pohonu</Label>
            <Select
              defaultValue={powertrain}
              onValueChange={(value) => setPowertrain(value as VehiclePowertrain)}
            >
              <SelectTrigger>
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
          <SelectWithLabel label="Karoserie" placeholder="Vyberte karoserii" items={["Hatchback", "Sedan", "Combi / Wagon", "SUV", "Van", "Coupe", "Convertible", "Pickup", "Other"]} />
          <SelectWithLabel label="Převodovka" placeholder="Vyberte převodovku" items={["Manuální", "Automatická"]} />
          <InputWithLabel label="Motor" />
          <InputWithLabel label="Výkon" />
          {isElectric ? <InputWithLabel label="Kapacita baterie v kWh" type="number" /> : null}
          {isCombustion ? <InputWithLabel label="Objem palivové nádrže" type="number" /> : null}
          {isGas ? <InputWithLabel label="Objem LPG/CNG nádrže" type="number" /> : null}
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
          <InputWithLabel label="Datum nákupu" type="date" />
          <InputWithLabel label="Nájezd při nákupu" type="number" />
          <InputWithLabel label="Kupní cena" type="number" />
          <SelectWithLabel label="Měna" placeholder="Vyberte měnu" items={["EUR", "CZK", "USD", "GBP", "PLN"]} />
          <InputWithLabel label="Prodejce" />
          <InputWithLabel label="Poznámka k nákupu" />
        </div>
      </FormSection>

      <FormSection title="Aktuální údaje">
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Aktuální nájezd" type="number" required />
          <InputWithLabel label="Aktuální odhadovaná hodnota" type="number" />
          <InputWithLabel label="Pojišťovna" />
          <InputWithLabel label="Hlavní řidič" />
          <div className="space-y-2 md:col-span-2">
            <Label>Poznámky</Label>
            <Textarea />
          </div>
        </div>
      </FormSection>

      <FormSection title="Média">
        <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <Upload className="mb-2 size-6 text-muted-foreground" aria-hidden="true" />
          <div className="font-medium">Nahrání fotografie vozidla</div>
          <div className="text-sm text-muted-foreground">
            Po nastavení backendu se soubor uloží do Supabase Storage.
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button">
          Uložit koncept
        </Button>
        <Button type="submit" className="gap-2">
          <Car className="size-4" aria-hidden="true" />
          Uložit vozidlo
        </Button>
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
  type = "text",
  required = false,
}: {
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input type={type} required={required} />
    </div>
  );
}

function SelectWithLabel({
  label,
  placeholder,
  items,
}: {
  label: string;
  placeholder: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
