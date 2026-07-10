import { Download, ShieldCheck, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nastavení" description="Profil, jednotky, měna, notifikace, motiv, export a budoucí cloudové funkce." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>VH</AvatarFallback></Avatar>
              <div><div className="font-medium">Uživatel Vehilo</div><div className="text-sm text-muted-foreground">Supabase Auth bude připojený v dalším kroku.</div></div>
            </div>
            <Field label="Jméno" placeholder="Vaše jméno" />
            <Field label="E-mail" placeholder="vas@email.cz" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preference</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Měna" value="EUR" items={["EUR", "CZK", "USD", "GBP", "PLN"]} />
            <SelectField label="Vzdálenost" value="Kilometry" items={["Kilometry", "Míle"]} />
            <SelectField label="Objem paliva" value="Litry" items={["Litry", "Galony"]} />
            <SelectField label="Energie" value="kWh" items={["kWh"]} />
            <SelectField label="Spotřeba paliva" value="L/100 km" items={["L/100 km", "MPG", "km/L"]} />
            <SelectField label="Spotřeba elektro" value="kWh/100 km" items={["kWh/100 km", "mi/kWh"]} />
            <SelectField label="Jazyk" value="Čeština" items={["Čeština", "English", "Slovenčina", "Deutsch", "Polski"]} />
            <SelectField label="Motiv" value="System" items={["Světlý", "Tmavý", "System"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifikace</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow title="PWA notifikace" description="Připomínky před servisem, STK/MOT a expirací dokumentů." />
            <ToggleRow title="E-mailové notifikace" description="Placeholder pro pozdější cloudové e-maily." />
            <Field label="Upozornit dní předem" placeholder="14" />
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

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input placeholder={placeholder} /></div>;
}

function SelectField({ label, value, items }: { label: string; value: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select defaultValue={value}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function ToggleRow({ title, description }: { title: string; description: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><div className="font-medium">{title}</div><div className="text-sm text-muted-foreground">{description}</div></div><Switch /></div>;
}
