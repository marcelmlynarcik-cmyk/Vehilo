"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mobileNavigationItems } from "@/components/app-shell/navigation";
import { QuickAdd } from "@/components/app-shell/quick-add";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-5 lg:hidden">
      <div className="mx-auto grid max-w-[520px] grid-cols-5 items-end gap-1 rounded-[28px] border border-border bg-[rgba(8,17,23,0.88)] px-2 py-2 shadow-[0_-20px_55px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[22px]">
        {mobileNavigationItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "h-[58px] min-h-[58px] flex-col gap-1 rounded-[18px] px-1 text-[11px] font-semibold text-muted-foreground",
                active && "bg-[rgba(39,211,162,0.1)] text-[var(--accent)]"
              )}
            >
              <Link href={item.href}>
                <Icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
        <QuickAddButton />
        {mobileNavigationItems.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "h-[58px] min-h-[58px] flex-col gap-1 rounded-[18px] px-1 text-[11px] font-semibold text-muted-foreground",
                active && "bg-[rgba(39,211,162,0.1)] text-[var(--accent)]"
              )}
            >
              <Link href={item.href}>
                <Icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

function QuickAddButton() {
  return (
    <div className="relative flex justify-center">
      <div className="-mt-7 rounded-full bg-[var(--background)] p-1.5 shadow-[0_0_0_1px_rgba(148,163,184,0.12)] [&>button]:size-[72px] [&>button]:min-h-[72px] [&>button]:rounded-full [&>button]:px-0 [&>button]:shadow-[0_18px_42px_rgba(45,212,163,0.26),inset_0_1px_0_rgba(255,255,255,0.22)] [&_span]:hidden">
        <QuickAdd />
      </div>
    </div>
  );
}
