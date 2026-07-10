"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mobileNavigationItems } from "@/components/app-shell/navigation";
import { QuickAdd } from "@/components/app-shell/quick-add";

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 items-center gap-1">
        {mobileNavigationItems.slice(0, 2).map((item) => {
          const Icon = item.icon;

          return (
            <Button key={item.href} asChild variant="ghost" className="h-12 flex-col gap-1 px-1 text-xs">
              <Link href={item.href}>
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
        <QuickAddButton />
        {mobileNavigationItems.slice(2).map((item) => {
          const Icon = item.icon;

          return (
            <Button key={item.href} asChild variant="ghost" className="h-12 flex-col gap-1 px-1 text-xs">
              <Link href={item.href}>
                <Icon className="size-4" aria-hidden="true" />
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
    <div className="flex justify-center">
      <div className="[&>button]:size-12 [&>button]:rounded-full [&>button]:px-0 [&_span]:hidden">
        <QuickAdd />
      </div>
      <Plus className="pointer-events-none absolute mt-4 size-4 text-primary-foreground" aria-hidden="true" />
    </div>
  );
}
