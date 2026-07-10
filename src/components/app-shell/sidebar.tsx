import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VehiloLogo } from "@/components/app-shell/logo";
import { navigationItems } from "@/components/app-shell/navigation";
import { QuickAdd } from "@/components/app-shell/quick-add";
import { SignOutButton } from "@/components/app-shell/sign-out-button";

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-sidebar/70 px-4 py-5 lg:flex lg:flex-col">
      <Link href="/dashboard" aria-label="Vehilo dashboard">
        <VehiloLogo />
      </Link>
      <div className="mt-6">
        <QuickAdd />
      </div>
      <nav className="mt-6 grid gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="justify-start gap-3"
            >
              <Link href={item.href}>
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <Avatar className="size-9">
            <AvatarFallback>VH</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Vehilo user</div>
            <div className="truncate text-xs text-muted-foreground">Google účet</div>
          </div>
        </div>
        <div className="mt-2">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
