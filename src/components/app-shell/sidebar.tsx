"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VehiloLogo } from "@/components/app-shell/logo";
import { navigationItems } from "@/components/app-shell/navigation";
import { QuickAdd } from "@/components/app-shell/quick-add";
import { SignOutButton } from "@/components/app-shell/sign-out-button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-5 backdrop-blur-[22px] lg:flex lg:flex-col">
      <Link href="/dashboard" aria-label="Vehilo dashboard">
        <VehiloLogo />
      </Link>
      <div className="mt-6">
        <QuickAdd />
      </div>
      <nav className="mt-6 grid gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "h-11 justify-start gap-3 rounded-[15px] px-3 text-muted-foreground hover:text-foreground",
                active &&
                  "border border-[rgba(45,212,163,0.22)] bg-[rgba(39,211,162,0.12)] text-foreground shadow-[inset_3px_0_0_rgba(45,212,163,0.9)]"
              )}
            >
              <Link href={item.href}>
                <Icon className={cn("size-4", active && "text-[var(--accent)]")} aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 rounded-[18px] border border-border bg-card p-3 shadow-[var(--shadow-card)]">
          <Avatar className="size-10 border border-border">
            <AvatarFallback className="bg-[rgba(39,211,162,0.14)] text-[#9ff5dc]">VH</AvatarFallback>
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
