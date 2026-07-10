import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Car,
  FileText,
  Fuel,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { signInWithGoogle } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { title: "Skutečné náklady", description: "Výdaje, servis, pojištění, energie i odpisy v jednom přehledu.", icon: BarChart3 },
  { title: "Palivo a energie", description: "Benzín, nafta, hybrid, plug-in hybrid, elektro, LPG i CNG bez špatných jednotek.", icon: Fuel },
  { title: "Servisní historie", description: "Údržba, opravy, díly, faktury, záruky a kompletní historie vlastnictví.", icon: Wrench },
  { title: "Připomínky", description: "STK/MOT, pojištění, dálniční známky, olej, filtry, brzdy i pneumatiky.", icon: Bell },
];

export default function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  return <Landing searchParams={searchParams} />;
}

async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto grid min-h-dvh w-full max-w-7xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border dark:bg-neutral-950">
              <Image
                src="/logo/Logo.png"
                alt="Vehilo"
                width={56}
                height={56}
                className="size-12 object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight">Vehilo</div>
              <div className="text-sm text-muted-foreground">Chytrý přehled vlastnictví vozidel</div>
            </div>
          </div>

          <div className="max-w-3xl space-y-5">
            <Badge variant="secondary">PWA pro osobní i vícedílnou garáž</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Všechny náklady, servis, dokumenty a připomínky pro vaše vozidla.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Vehilo vám ukáže skutečnou cenu vlastnictví auta: měsíční náklady,
              cenu za kilometr, spotřebu, servisní historii, expirace dokumentů
              a důležité připomínky pro benzín, naftu, hybrid, elektro, LPG i CNG.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title}>
                  <CardContent className="p-4">
                    <Icon className="mb-3 size-5 text-primary" aria-hidden="true" />
                    <div className="font-medium">{feature.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="lg:sticky lg:top-8">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Přihlášení do Vehilo</h2>
              <p className="text-sm text-muted-foreground">
                Přihlaste se Google účtem. Data budou uložená v Supabase a chráněná pravidly RLS pro váš uživatelský účet.
              </p>
            </div>

            {params.auth === "missing-supabase" ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Supabase zatím není nakonfigurovaný v proměnných prostředí.
              </div>
            ) : null}

            {params.auth === "google-error" ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Přihlášení přes Google se nepodařilo. Zkontrolujeme nastavení provideru v Supabase.
              </div>
            ) : null}

            <form action={signInWithGoogle}>
              <Button type="submit" className="h-11 w-full">
                Pokračovat přes Google
              </Button>
            </form>

            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Každý uživatel vidí pouze svá vozidla, výdaje, dokumenty a připomínky.
              </div>
              <div className="flex gap-2">
                <Car className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Funguje pro jedno auto i více vozidel v garáži.
              </div>
              <div className="flex gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Připravené pro dokumenty, faktury a budoucí cloudovou synchronizaci.
              </div>
            </div>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard">Zobrazit připravený dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
