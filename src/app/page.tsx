import Image from "next/image";
import {
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  FileText,
  Fuel,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { signInWithGoogle } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const heroMetrics = [
  { label: "Měsíční náklady", value: "8 420 Kč", tone: "text-emerald-300" },
  { label: "Cena za km", value: "4,80 Kč", tone: "text-sky-300" },
  { label: "Připomínky", value: "3 aktivní", tone: "text-amber-300" },
];

const productAreas = [
  {
    title: "Náklady bez dohadů",
    description: "Palivo, nabíjení, servis, pojištění, poplatky i mimořádné výdaje v jednom přehledu.",
    icon: BarChart3,
  },
  {
    title: "Správné jednotky pro každý pohon",
    description: "Benzín, nafta, hybrid, plug-in hybrid, elektro, LPG i CNG bez univerzálních a matoucích formulářů.",
    icon: Fuel,
  },
  {
    title: "Servis a historie vozidla",
    description: "Opravy, údržba, díly, faktury a poznámky zůstávají navázané na konkrétní vozidlo.",
    icon: Wrench,
  },
  {
    title: "Dokumenty a termíny",
    description: "STK, pojištění, dálniční známka, pneumatiky, olej a další věci, které nechcete řešit pozdě.",
    icon: Bell,
  },
];

const trustItems = [
  "Soukromá garáž pro jedno auto i více vozidel",
  "Přihlášení přes Google",
  "Připravené pro faktury, dokumenty a fotografie",
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
    <main className="min-h-dvh bg-[#f4f1ea] text-[#101418]">
      <section className="relative isolate overflow-hidden bg-[#101418] text-white">
        <div className="absolute inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-4 pt-5 sm:px-6 md:px-8 lg:min-h-[88svh]">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30 ring-1 ring-white/20 sm:size-16">
                <Image
                  src="/logo/Logo.png"
                  alt="Vehilo"
                  width={72}
                  height={72}
                  className="size-12 object-contain sm:size-14"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">Vehilo</div>
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-white/55 sm:text-sm">
                  Chytrá garáž
                </div>
              </div>
            </div>

            <form action={signInWithGoogle} className="hidden sm:block">
              <Button type="submit" variant="secondary" className="h-10 px-4">
                Přihlásit se
              </Button>
            </form>
          </header>

          <div className="grid min-w-0 flex-1 items-center gap-8 py-10 md:py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] lg:gap-10">
            <div className="min-w-0 max-w-3xl space-y-7">
              <Badge className="h-7 rounded-full border-white/15 bg-white/10 px-3 text-white hover:bg-white/10">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Skutečné náklady na vlastnictví vozidla
              </Badge>

              <div className="space-y-5">
                <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight text-balance min-[390px]:text-5xl sm:text-6xl lg:text-7xl">
                  Mějte svoje auta pod kontrolou.
                </h1>
                <p className="max-w-[calc(100vw-2rem)] text-base leading-7 text-white/72 sm:max-w-xl sm:text-lg lg:max-w-2xl">
                  Vehilo sjednotí náklady, servis, palivo, nabíjení, dokumenty a termíny do jednoho přehledu.
                  Bez tabulek, bez zapomenutých faktur, bez odhadů.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <form action={signInWithGoogle} className="w-[calc(100vw-2rem)] max-w-full sm:w-auto">
                  <Button type="submit" className="h-12 w-full bg-white px-5 text-[#101418] hover:bg-white/90 sm:w-auto">
                    Pokračovat přes Google
                  </Button>
                </form>
                <div className="flex items-center gap-2 text-sm text-white/62">
                  <LockKeyhole className="size-4 text-emerald-300" aria-hidden="true" />
                  Vaše data patří jen vašemu účtu.
                </div>
              </div>

              {(params.auth === "missing-supabase" || params.auth === "google-error") ? (
                <div className="max-w-xl rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {params.auth === "missing-supabase"
                    ? "Přihlášení teď není dostupné. Chybí konfigurace prostředí."
                    : "Přihlášení přes Google se nepodařilo. Zkontrolujte povolené adresy pro produkční doménu."}
                </div>
              ) : null}

              <div className="grid max-w-2xl gap-3 pt-2 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div key={item} className="flex gap-2 text-sm leading-5 text-white/70">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto min-w-0 w-[calc(100vw-2rem)] max-w-full pb-8 sm:w-full sm:max-w-[620px] lg:pb-0">
              <div className="rounded-[1.75rem] border border-white/12 bg-[#171c22] p-3 shadow-2xl shadow-black/40">
                <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-[#0f1318] p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-white/56">Přehled garáže</div>
                      <div className="text-2xl font-semibold tracking-tight">Škoda Enyaq</div>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                      <Car className="size-6" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                    {heroMetrics.map((metric) => (
                      <div key={metric.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="text-xs text-white/48">{metric.label}</div>
                        <div className={`mt-2 text-xl font-semibold tracking-tight ${metric.tone}`}>
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[1fr_0.74fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-medium text-white/70">Výdaje podle měsíce</div>
                        <Gauge className="size-4 text-sky-300" aria-hidden="true" />
                      </div>
                      <div className="flex h-36 items-end gap-2">
                        {[42, 58, 34, 72, 48, 86, 64, 76].map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-sky-300/80"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
                          <Bell className="size-4" aria-hidden="true" />
                          STK za 24 dní
                        </div>
                        <div className="mt-2 text-xs leading-5 text-amber-100/70">
                          Připomenutí před termínem i podle nájezdu.
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/76">
                          <FileText className="size-4 text-emerald-300" aria-hidden="true" />
                          12 dokumentů
                        </div>
                        <div className="mt-2 text-xs leading-5 text-white/46">
                          Faktury, pojistky a servisní záznamy.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div className="space-y-4">
          <Badge variant="outline" className="border-[#101418]/15 bg-white/60">
            Co budete mít po ruce
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Přehled, který dává smysl běžnému řidiči i celé rodinné garáži.
          </h2>
          <p className="text-base leading-7 text-[#4b535b]">
            Úvodní obrazovka má být rychlá, čitelná a použitelná na telefonu, tabletu i počítači.
            Stejný vizuální směr použijeme dál v aplikaci.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {productAreas.map((area) => {
            const Icon = area.icon;

            return (
              <article key={area.title} className="rounded-2xl border border-[#101418]/10 bg-white p-5 shadow-sm">
                <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-[#101418] text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">{area.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d656d]">{area.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#101418]/10 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-700" aria-hidden="true" />
            <p className="text-sm leading-6 text-[#4b535b]">
              Vehilo je připravené pro reálná uživatelská data a soukromé záznamy každého účtu.
            </p>
          </div>
          <form action={signInWithGoogle}>
            <Button type="submit" className="h-10 w-full px-4 sm:w-auto">
              Začít používat Vehilo
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
