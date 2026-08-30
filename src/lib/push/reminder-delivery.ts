import "server-only";

import webpush, { type PushSubscription } from "web-push";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";
import type { ReminderStatus } from "@/types/domain";

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];
type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
type PushSubscriptionRow = Database["public"]["Tables"]["push_subscriptions"]["Row"];
type NotificationKind = "due_soon" | "overdue";

const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:marcel.mlynarcik@gmail.com";
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

type DeliveryScope = {
  userId?: string;
  vehicleId?: string;
};

export async function deliverReminderPushNotifications(scope: DeliveryScope = {}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { ok: false, error: "Supabase admin není nakonfigurovaný.", sent: 0, skipped: 0, failed: 0 };
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    return { ok: false, error: "VAPID klíče nejsou nakonfigurované.", sent: 0, skipped: 0, failed: 0 };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  let remindersQuery = supabase
    .from("reminders")
    .select("*")
    .neq("status", "done")
    .limit(500);

  if (scope.userId) {
    remindersQuery = remindersQuery.eq("user_id", scope.userId);
  }

  if (scope.vehicleId) {
    remindersQuery = remindersQuery.eq("vehicle_id", scope.vehicleId);
  }

  const { data: reminders, error: remindersError } = await remindersQuery;

  if (remindersError) {
    return { ok: false, error: remindersError.message, sent: 0, skipped: 0, failed: 0 };
  }

  const activeReminders = (reminders ?? []) as ReminderRow[];
  const vehicleIds = [...new Set(activeReminders.map((reminder) => reminder.vehicle_id))];

  if (vehicleIds.length === 0) {
    return { ok: true, sent: 0, skipped: 0, failed: 0 };
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*")
    .in("id", vehicleIds);

  if (vehiclesError) {
    return { ok: false, error: vehiclesError.message, sent: 0, skipped: 0, failed: 0 };
  }

  const vehiclesById = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle as VehicleRow]));
  const dueReminders = activeReminders
    .map((reminder) => buildReminderNotification(reminder, vehiclesById.get(reminder.vehicle_id)))
    .filter((item): item is ReminderNotification => Boolean(item));

  if (dueReminders.length === 0) {
    await updateReminderStatuses(supabase, activeReminders, vehiclesById);
    return { ok: true, sent: 0, skipped: 0, failed: 0 };
  }

  await updateReminderStatuses(supabase, activeReminders, vehiclesById);

  const userIds = [...new Set(dueReminders.map((item) => item.reminder.user_id))];
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds)
    .eq("enabled", true);

  if (subscriptionsError) {
    return { ok: false, error: subscriptionsError.message, sent: 0, skipped: 0, failed: 0 };
  }

  const subscriptionsByUser = groupSubscriptionsByUser((subscriptions ?? []) as PushSubscriptionRow[]);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const notification of dueReminders) {
    const userSubscriptions = subscriptionsByUser.get(notification.reminder.user_id) ?? [];

    for (const subscription of userSubscriptions) {
      const inserted = await reserveNotification(supabase, notification, subscription);

      if (!inserted) {
        skipped += 1;
        continue;
      }

      const result = await sendReminderNotification(notification, subscription);

      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
      }

      await finalizeNotification(supabase, inserted.id, result);

      if (result.expired) {
        await supabase.from("push_subscriptions").update({ enabled: false }).eq("id", subscription.id);
      }
    }
  }

  return { ok: true, sent, skipped, failed };
}

export async function deliverReminderPushNotificationsSoon(scope: DeliveryScope) {
  try {
    await deliverReminderPushNotifications(scope);
  } catch (error) {
    console.error("Immediate reminder push delivery failed", error);
  }
}

export async function sendTestPushNotification(subscription: Json) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { ok: false, error: "VAPID klíče nejsou nakonfigurované.", expired: false };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  try {
    await webpush.sendNotification(toWebPushSubscription(subscription), JSON.stringify({
      title: "Testovací připomínka",
      body: "Push notifikace ve Vehilo fungují.",
      url: "/reminders",
    }));

    return { ok: true, error: null, expired: false };
  } catch (error) {
    const statusCode = getStatusCode(error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Testovací push notifikaci se nepodařilo odeslat.",
      expired: statusCode === 404 || statusCode === 410,
    };
  }
}

type ReminderNotification = {
  reminder: ReminderRow;
  vehicle: VehicleRow;
  kind: NotificationKind;
  notificationKey: string;
  title: string;
  body: string;
};

function buildReminderNotification(reminder: ReminderRow, vehicle: VehicleRow | undefined): ReminderNotification | null {
  if (!vehicle) {
    return null;
  }

  const status = calculateReminderStatus(reminder, vehicle);

  if (status !== "due_soon" && status !== "overdue") {
    return null;
  }

  const dueDate = reminder.next_due_date ?? reminder.due_date;
  const dueMileage = reminder.next_due_mileage;
  const detail = [
    dueDate ? `termín ${formatDate(dueDate)}` : null,
    dueMileage != null ? `${dueMileage.toLocaleString("cs-CZ")} km` : null,
  ].filter(Boolean).join(", ");

  return {
    reminder,
    vehicle,
    kind: status,
    notificationKey: `${status}:${dueDate ?? "no-date"}:${dueMileage ?? "no-mileage"}`,
    title: status === "overdue" ? "Připomínka je po termínu" : "Připomínka se blíží",
    body: `${vehicle.name}: ${reminder.title}${detail ? ` (${detail})` : ""}`,
  };
}

function calculateReminderStatus(reminder: ReminderRow, vehicle: VehicleRow): ReminderStatus {
  const dueDate = reminder.next_due_date ?? reminder.due_date;
  const daysRemaining = dueDate ? daysUntil(dueDate) : null;
  const kilometersRemaining = reminder.next_due_mileage == null
    ? null
    : reminder.next_due_mileage - Number(vehicle.current_mileage ?? 0);

  if ((daysRemaining != null && daysRemaining < 0) || (kilometersRemaining != null && kilometersRemaining < 0)) {
    return "overdue";
  }

  if (
    (daysRemaining != null && reminder.notify_before_days != null && daysRemaining <= reminder.notify_before_days) ||
    (kilometersRemaining != null && reminder.notify_before_km != null && kilometersRemaining <= reminder.notify_before_km)
  ) {
    return "due_soon";
  }

  return "upcoming";
}

async function updateReminderStatuses(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  reminders: ReminderRow[],
  vehiclesById: Map<string, VehicleRow>,
) {
  await Promise.all(reminders.map((reminder) => {
    const vehicle = vehiclesById.get(reminder.vehicle_id);

    if (!vehicle) {
      return null;
    }

    const status = calculateReminderStatus(reminder, vehicle);

    if (status === reminder.status) {
      return null;
    }

    return supabase.from("reminders").update({ status }).eq("id", reminder.id);
  }));
}

function groupSubscriptionsByUser(subscriptions: PushSubscriptionRow[]) {
  const map = new Map<string, PushSubscriptionRow[]>();

  for (const subscription of subscriptions) {
    const list = map.get(subscription.user_id) ?? [];
    list.push(subscription);
    map.set(subscription.user_id, list);
  }

  return map;
}

async function reserveNotification(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  notification: ReminderNotification,
  subscription: PushSubscriptionRow,
) {
  const { data, error } = await supabase
    .from("reminder_push_notifications")
    .insert({
      user_id: notification.reminder.user_id,
      reminder_id: notification.reminder.id,
      push_subscription_id: subscription.id,
      notification_key: notification.notificationKey,
    })
    .select("id")
    .single();

  if (error) {
    return null;
  }

  return data;
}

async function sendReminderNotification(notification: ReminderNotification, subscription: PushSubscriptionRow) {
  try {
    await webpush.sendNotification(toWebPushSubscription(subscription.subscription), JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: "/reminders",
    }));

    return { ok: true, error: null, expired: false };
  } catch (error) {
    const statusCode = getStatusCode(error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Push notifikaci se nepodařilo odeslat.",
      expired: statusCode === 404 || statusCode === 410,
    };
  }
}

async function finalizeNotification(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  id: string,
  result: { ok: boolean; error: string | null },
) {
  await supabase
    .from("reminder_push_notifications")
    .update({ success: result.ok, error: result.error })
    .eq("id", id);
}

function toWebPushSubscription(value: Json): PushSubscription {
  if (!isRecord(value) || typeof value.endpoint !== "string" || !isRecord(value.keys)) {
    throw new Error("Uložená push subscription nemá platný formát.");
  }

  const p256dh = value.keys.p256dh;
  const auth = value.keys.auth;

  if (typeof p256dh !== "string" || typeof auth !== "string") {
    throw new Error("Uložená push subscription nemá platné klíče.");
  }

  return {
    endpoint: value.endpoint,
    keys: { p256dh, auth },
  };
}

function getStatusCode(error: unknown) {
  return isRecord(error) && typeof error.statusCode === "number" ? error.statusCode : null;
}

function daysUntil(date: string) {
  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dueDate = new Date(`${date}T00:00:00.000Z`).getTime();

  return Math.ceil((dueDate - startOfToday) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00.000Z`));
}

function isRecord(value: unknown): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
