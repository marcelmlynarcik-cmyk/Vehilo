"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PushState = "checking" | "unsupported" | "missing-key" | "denied" | "subscribed" | "unsubscribed";

export function PushNotificationsCard({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [state, setState] = useState<PushState>("checking");
  const [message, setMessage] = useState("");
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

  async function subscribe() {
    setMessage("");

    try {
      if (!supported) {
        setState("unsupported");
        return;
      }

      if (!vapidPublicKey) {
        setState("missing-key");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        setState("denied");
        return;
      }

      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setState("subscribed");
      setMessage("Zařízení je připravené pro push připomínky.");
    } catch (error) {
      setState("unsubscribed");
      setMessage(error instanceof Error ? error.message : "Push notifikace se nepodařilo zapnout.");
    }
  }

  async function unsubscribe() {
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();

      if (!subscription) {
        setState("unsubscribed");
        return;
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const response = await fetch("/api/push/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setState("unsubscribed");
      setMessage("Push připomínky jsou na tomto zařízení vypnuté.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Push notifikace se nepodařilo vypnout.");
    }
  }

  return (
    <div className="rounded-[18px] border border-border bg-muted/35 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-white">Push připomínky</div>
            <Badge variant={state === "subscribed" ? "secondary" : "outline"}>{formatState(state)}</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Zařízení dostane upozornění, když se servisní, STK/MOT nebo dokumentová připomínka blíží nebo je po termínu.
          </p>
          {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {state === "subscribed" ? (
            <Button type="button" variant="outline" size="sm" onClick={unsubscribe}>
              <BellOff className="mr-2 size-4" aria-hidden="true" />
              Vypnout
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={subscribe} disabled={state === "unsupported" || state === "missing-key" || state === "denied"}>
              <Bell className="mr-2 size-4" aria-hidden="true" />
              Zapnout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function isPushSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

async function getServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");

  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

async function readError(response: Response) {
  try {
    const body = await response.json();
    return typeof body.error === "string" ? body.error : "Push požadavek selhal.";
  } catch {
    return "Push požadavek selhal.";
  }
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
