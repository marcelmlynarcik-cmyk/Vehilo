"use client";

import Link from "next/link";
import {
  BatteryCharging,
  Bell,
  Car,
  FileText,
  Fuel,
  Plus,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const actions = [
  { label: "Přidat tankování / nabíjení", icon: Fuel, href: "/fuel-energy?add=energy" },
  { label: "Přidat výdaj", icon: ReceiptText },
  { label: "Přidat servis", icon: Wrench },
  { label: "Přidat připomínku", icon: Bell },
  { label: "Přidat vozidlo", icon: Car },
  { label: "Přidat dokument", icon: FileText },
  { label: "Přidat nabíjení", icon: BatteryCharging, href: "/fuel-energy?add=energy" },
];

export function QuickAdd() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="gap-2 max-sm:size-14 max-sm:min-h-14 max-sm:rounded-[18px] max-sm:px-0">
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Rychle přidat</span>
          </Button>
        }
      >
        <span className="hidden">
          <Plus className="size-4" aria-hidden="true" />
          Rychle přidat
        </span>
      </SheetTrigger>
      <SheetContent side="bottom" className="sm:left-auto sm:right-4 sm:top-4 sm:w-[440px] sm:rounded-[24px] sm:border">
        <SheetHeader className="text-left">
          <SheetTitle>Přidat do Vehilo</SheetTitle>
          <SheetDescription>
            Po připojení Supabase zde budete vytvářet skutečné záznamy.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-5 pb-5 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;

            const content = (
              <>
                <Icon className="size-4" aria-hidden="true" />
                {action.label}
              </>
            );

            return action.href ? (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="h-14 justify-start gap-3 rounded-[16px]"
              >
                <Link href={action.href}>{content}</Link>
              </Button>
            ) : (
              <Button
                key={action.label}
                variant="outline"
                className="h-14 justify-start gap-3 rounded-[16px]"
                type="button"
              >
                {content}
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
