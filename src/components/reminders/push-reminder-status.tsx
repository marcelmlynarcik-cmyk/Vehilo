"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PushState = "checking" | "unsupported" | "missing-key" | "denied" | "subscribed" | "unsubscribed";

export function PushReminderStatus({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [state, setState] = useState<PushState>("checking");
  const supported = useMemo(() => isPushSupported(), []);

  useEffect(() => {
    if (!supported) {
      setState("unsupported");
      return;
    }

    if (!vapidPublicKey) {
      setState("missing-key");
      return;
    }

    navigator.serviceWorker.getRegistration("/").then((registration) => {
      if (!registration) {
        setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
        return;
      }

      registration.pushManager.getSubscription().then((subscription) => {
        setState(subscription ? "subscribed" : Notification.permission === "denied" ? "denied" : "unsubscribed");
      });
    });
  }, [supported, vapidPublicKey]);

  const enabled = state === "subscribed";
  const blocked = state === "denied";
  const Icon = enabled ? Bell : BellOff;

  return (
    <div className="rounded-[18px] border border-border bg-muted/35 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className={enabled ? "size-4 text-[var(--accent)]" : "size-4 text-muted-foreground"} aria-hidden="true" />
            <div className="font-semibold text-white">Push notifikace</div>
            <Badge variant={enabled ? "secondary" : "outline"}>{formatState(state)}</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{statusMessage(state)}</p>
        </div>
        {!enabled ? (
          <Button type="button" variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/settings#notifications">
              <Settings className="mr-2 size-4" aria-hidden="true" />
              Nastavení
            </Link>
          </Button>
        ) : null}
      </div>
      {blocked ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Povolení je blokované v prohlížeči. Změňte ho v nastavení webu a potom push připomínky znovu zapněte.
        </p>
      ) : null}
    </div>
  );
}

function isPushSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

function statusMessage(state: PushState) {
  const messages: Record<PushState, string> = {
    checking: "Kontroluje se stav push připomínek na tomto zařízení.",
    unsupported: "Tento prohlížeč nebo režim aplikace push notifikace nepodporuje.",
    "missing-key": "Push notifikace nejsou v nasazení nakonfigurované.",
    denied: "Push notifikace jsou pro tento web blokované.",
    subscribed: "Toto zařízení dostane upozornění při blížícím se termínu nebo dosažení kilometrů.",
    unsubscribed: "Push notifikace jsou na tomto zařízení vypnuté. Zapnete je v nastavení.",
  };

  return messages[state];
}

function formatState(state: PushState) {
  const labels: Record<PushState, string> = {
    checking: "Kontroluji",
    unsupported: "Nepodporováno",
    "missing-key": "Nenastaveno",
    denied: "Blokováno",
    subscribed: "Zapnuto",
    unsubscribed: "Vypnuto",
  };

  return labels[state];
}
