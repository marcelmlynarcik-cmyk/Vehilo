import { AlertTriangle, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { QuickAdd } from "@/components/app-shell/quick-add";

interface AppShellProps {
  children: ReactNode;
  configured: boolean;
  authenticated: boolean;
  error?: string;
}

export function AppShell({ children, configured, authenticated, error }: AppShellProps) {
  return (
    <div className="flex min-h-dvh text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-[rgba(5,11,16,0.82)] px-4 py-3 backdrop-blur-[18px] lg:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div className="lg:hidden">
              <div className="text-[30px] font-extrabold leading-none tracking-[-0.04em] text-white">Vehilo</div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">Smart vehicle hub</div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <div className="text-sm text-muted-foreground">
                Všechny náklady, palivo, energie, servis, dokumenty a připomínky na jednom místě.
              </div>
            </div>
            <QuickAdd />
          </div>
        </header>
        <main className="flex-1 px-4 py-5 pb-safe-nav md:px-6 lg:px-8 lg:py-8 lg:pb-10">
          <div className="mx-auto max-w-[1600px] space-y-5">
            {!configured ? <SetupAlert /> : null}
            {configured && !authenticated ? <AuthAlert /> : null}
            {error ? <ErrorAlert message={error} /> : null}
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function SetupAlert() {
  return (
    <Alert>
      <WifiOff className="size-4" aria-hidden="true" />
      <AlertTitle>Supabase zatím není připojený</AlertTitle>
      <AlertDescription>
        Pro práci se skutečnými daty Vehilo doplňte `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
      </AlertDescription>
    </Alert>
  );
}

function AuthAlert() {
  return (
    <Alert>
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertTitle>Přihlášení je další backendový krok</AlertTitle>
      <AlertDescription>
        Rozhraní je připravené na skutečné záznamy. Po nastavení Supabase Auth budou stránky načítat data patřící přihlášenému uživateli.
      </AlertDescription>
    </Alert>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertTitle>Problém s načítáním dat</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
