"use client";

import { useFormStatus } from "react-dom";
import { Archive, BatteryCharging, Car, Save, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
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

const powertrainOptions = [
  ["petrol", "Benzín"],
  ["diesel", "Nafta"],
  ["hybrid", "Hybrid"],
  ["plug_in_hybrid", "Plug-in hybrid"],
  ["electric", "Elektro"],
  ["lpg", "LPG"],
  ["cng", "CNG"],
] as const satisfies readonly (readonly [VehiclePowertrain, string])[];

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
    <form action={action} encType="multipart/form-data" className="space-y-5">
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
                <SelectDisplay value={powertrain} items={powertrainOptions} placeholder="Vyberte pohon" />
              </SelectTrigger>
              <SelectContent>
                {powertrainOptions.map(([itemValue, itemLabel]) => (
                  <SelectItem key={itemValue} value={itemValue}>
                    {itemLabel}
                  </SelectItem>
                ))}
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
        <Card className="mt-4 border-[rgba(56,189,248,0.22)] bg-[rgba(14,42,52,0.34)]">
          <CardContent className="flex gap-3 p-4 text-sm leading-relaxed text-muted-foreground">
            <BatteryCharging className="mt-0.5 size-5 shrink-0 text-[var(--accent-blue)]" aria-hidden="true" />
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Poznámky</Label>
            <Textarea id="notes" name="notes" defaultValue={vehicle?.notes ?? ""} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Média">
        <VehiclePhotoField currentPhotoUrl={vehicle?.photo_url ?? null} />
      </FormSection>

      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex flex-col-reverse gap-2 rounded-[22px] border border-border bg-[rgba(8,17,23,0.9)] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-[18px] sm:static sm:flex-row sm:justify-between sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
        {mode === "edit" && archiveAction && vehicle?.status !== "archived" ? (
          <Button variant="destructive" formAction={archiveAction} className="gap-2">
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
    <section className="rounded-[24px] border border-border bg-card p-4 shadow-[var(--shadow-card)] backdrop-blur-[18px] md:p-5">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-white">{title}</h2>
      {children}
    </section>
  );
}

function VehiclePhotoField({ currentPhotoUrl }: { currentPhotoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProcessingPhoto(true);

    const preparedFile = await resizeVehiclePhoto(file).catch(() => file);
    const files = new DataTransfer();
    files.items.add(preparedFile);
    event.target.files = files.files;

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(preparedFile));
    setSelectedFileName(
      preparedFile.size < file.size
        ? `${preparedFile.name} (${formatFileSize(file.size)} -> ${formatFileSize(preparedFile.size)})`
        : `${preparedFile.name} (${formatFileSize(preparedFile.size)})`,
    );
    setRemovePhoto(false);
    setProcessingPhoto(false);
  }

  function clearSelection() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setPreviewUrl(null);
    setSelectedFileName(null);
    setRemovePhoto(Boolean(currentPhotoUrl));
  }

  return (
    <div className="grid gap-4 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.26)] bg-[rgba(8,17,23,0.42)] p-4 md:grid-cols-[220px_1fr] md:p-5">
      <input type="hidden" name="remove_photo" value={removePhoto ? "true" : "false"} />
      <div className="overflow-hidden rounded-[18px] border border-border bg-[rgba(5,11,16,0.82)]">
        {previewUrl ? (
          <div
            className="aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: `url(${previewUrl})` }}
            aria-label="Náhled fotografie vozidla"
            role="img"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center">
            <Car className="size-12 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-3">
        <div>
          <div className="font-semibold text-white">Fotografie vozidla</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Vyberte fotku z telefonu nebo počítače. Uloží se do privátního Supabase Storage.
          </div>
        </div>
        {selectedFileName ? (
          <div className="rounded-[14px] border border-[rgba(45,212,163,0.22)] bg-[rgba(45,212,163,0.10)] px-3 py-2 text-sm text-[#9ff5dc]">
            Připraveno k nahrání: {selectedFileName}
          </div>
        ) : null}
        {processingPhoto ? (
          <div className="rounded-[14px] border border-[rgba(56,189,248,0.22)] bg-[rgba(56,189,248,0.10)] px-3 py-2 text-sm text-sky-100">
            Připravuji menší verzi fotografie...
          </div>
        ) : null}
        {removePhoto ? (
          <div className="rounded-[14px] border border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm text-red-200">
            Fotografie bude po uložení odstraněna.
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="gap-2" disabled={processingPhoto} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            {previewUrl ? "Vyměnit fotku" : "Vybrat fotku"}
          </Button>
          {previewUrl ? (
            <Button type="button" variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={clearSelection}>
              <X className="size-4" aria-hidden="true" />
              Odstranit
            </Button>
          ) : null}
        </div>
        <Input
          ref={inputRef}
          id="vehicle_photo_file"
          name="photo_file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

async function resizeVehiclePhoto(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));

    if (scale === 1 && file.size <= 1_800_000) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], replaceFileExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function replaceFileExtension(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "vehicle-photo"}.${extension}`;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} kB`;
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
          <SelectDisplay value={value} items={items} placeholder={placeholder} />
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

function SelectDisplay({
  value,
  items,
  placeholder,
}: {
  value: string;
  items: readonly (readonly [string, string])[];
  placeholder: string;
}) {
  const label = items.find(([itemValue]) => itemValue === value)?.[1];

  return (
    <span className={label ? "truncate" : "truncate text-muted-foreground"}>
      {label ?? placeholder}
    </span>
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
