import { Download, ShieldCheck, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";
import { updatePreferences } from "@/app/(app)/settings/actions";

export default async function SettingsPage() {
  const { data } = await loadGarageData();
  const profile = data.profile;
  const displayName = profile?.name ?? "Uživatel Vehilo";
  const email = profile?.email ?? "";

  return (
    <div className="space-y-6">
      <PageHeader title="Nastavení" description="Profil, jednotky, měna, notifikace, motiv, export a budoucí cloudové funkce." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-[18px] border border-border bg-muted/35 p-3">
              <Avatar className="border border-border"><AvatarFallback className="bg-[rgba(39,211,162,0.14)] text-[#9ff5dc]">{getInitials(displayName, email)}</AvatarFallback></Avatar>
              <div>
                <div className="font-medium">{displayName}</div>
                <div className="text-sm text-muted-foreground">{email || "E-mail není dostupný"}</div>
              </div>
            </div>
            <form id="preferences-form" action={updatePreferences} className="space-y-4">
              <Field label="Jméno" name="name" placeholder="Vaše jméno" defaultValue={profile?.name ?? ""} />
              <Field label="E-mail" name="email" placeholder="vas@email.cz" defaultValue={email} disabled />
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preference</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SelectField form="preferences-form" label="Měna" name="currency" value={profile?.currency ?? "CZK"} items={currencyOptions} />
            <SelectField form="preferences-form" label="Vzdálenost" name="distance_unit" value={profile?.distance_unit ?? "kilometers"} items={distanceOptions} />
            <SelectField form="preferences-form" label="Objem paliva" name="fuel_volume_unit" value={profile?.fuel_volume_unit ?? "liters"} items={fuelVolumeOptions} />
            <SelectField form="preferences-form" label="Energie" name="energy_unit" value={profile?.energy_unit ?? "kWh"} items={energyOptions} />
            <SelectField form="preferences-form" label="Spotřeba paliva" name="consumption_format" value={profile?.consumption_format ?? "L/100 km"} items={consumptionOptions} />
            <SelectField form="preferences-form" label="Spotřeba elektro" name="electric_consumption_format" value={profile?.electric_consumption_format ?? "kWh/100 km"} items={electricConsumptionOptions} />
            <SelectField form="preferences-form" label="Jazyk" name="language" value={profile?.language ?? "cs"} items={languageOptions} />
            <SelectField form="preferences-form" label="Motiv" name="theme" value={profile?.theme ?? "system"} items={themeOptions} />
            <div className="sm:col-span-2">
              <Button type="submit" form="preferences-form">Uložit nastavení</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifikace</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow title="PWA notifikace" description="Připomínky před servisem, STK/MOT a expirací dokumentů." />
            <ToggleRow title="E-mailové notifikace" description="Placeholder pro pozdější cloudové e-maily." />
            <div className="space-y-2">
              <Label htmlFor="notify_before_days">Upozornit dní předem</Label>
              <Input id="notify_before_days" placeholder="14" disabled />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Aplikace a soukromí</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start"><Download className="mr-2 size-4" />Export dat</Button>
            <Button variant="outline" className="w-full justify-start"><Upload className="mr-2 size-4" />Import dat</Button>
            <Button variant="outline" className="w-full justify-start"><ShieldCheck className="mr-2 size-4" />Cloud sync placeholder</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Vehilo Pro</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">Budoucí rozšíření pro náročnější uživatele, rodiny a menší flotily.</p>
          <div className="flex flex-wrap gap-2">
            {["Neomezená vozidla", "Pokročilé grafy", "Úložiště dokumentů", "Chytré připomínky", "PDF export", "Excel export", "Rodinná garáž", "Fleet mode", "AI insights"].map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const currencyOptions = [
  ["CZK", "CZK"],
  ["EUR", "EUR"],
  ["USD", "USD"],
  ["GBP", "GBP"],
  ["PLN", "PLN"],
] as const;

const distanceOptions = [
  ["kilometers", "Kilometry"],
  ["miles", "Míle"],
] as const;

const fuelVolumeOptions = [
  ["liters", "Litry"],
  ["gallons", "Galony"],
] as const;

const energyOptions = [["kWh", "kWh"]] as const;

const consumptionOptions = [
  ["L/100 km", "L/100 km"],
  ["MPG", "MPG"],
  ["km/L", "km/L"],
] as const;

const electricConsumptionOptions = [
  ["kWh/100 km", "kWh/100 km"],
  ["mi/kWh", "mi/kWh"],
] as const;

const languageOptions = [["cs", "Čeština"]] as const;

const themeOptions = [
  ["light", "Světlý"],
  ["dark", "Tmavý"],
  ["system", "Systém"],
] as const;

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  disabled = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}

function SelectField({
  form,
  label,
  name,
  value,
  items,
}: {
  form: string;
  label: string;
  name: string;
  value: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        form={form}
        defaultValue={value}
        className="flex h-12 w-full rounded-[14px] border border-input bg-input px-3.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {items.map(([itemValue, itemLabel]) => (
          <option key={itemValue} value={itemValue}>{itemLabel}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({ title, description }: { title: string; description: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-[18px] border border-border bg-muted/35 p-3"><div><div className="font-semibold text-white">{title}</div><div className="text-sm text-muted-foreground">{description}</div></div><Switch /></div>;
}

function getInitials(name: string, email: string) {
  const source = name !== "Uživatel Vehilo" ? name : email;
  const initials = source
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "VH";
}
