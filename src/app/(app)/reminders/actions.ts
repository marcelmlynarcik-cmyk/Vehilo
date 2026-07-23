"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Reminder, ReminderStatus } from "@/types/domain";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;

export async function createReminder(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildReminderPayload(formData, userId, vehicleId);
  const { error } = await supabase.from("reminders").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReminderPaths(vehicleId);
  redirect("/reminders#records");
}

export async function updateReminder(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const reminderId = requiredText(formData, "id");
  const vehicleId = requiredText(formData, "vehicle_id");
  const currentReminder = await requireOwnedReminder(supabase, userId, reminderId);

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildReminderPayload(formData, userId, vehicleId);
  const { error } = await supabase.from("reminders").update(payload).eq("id", reminderId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReminderPaths(vehicleId);
  revalidateReminderPaths(currentReminder.vehicle_id);
  redirect("/reminders#records");
}

export async function deleteReminder(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const reminderId = requiredText(formData, "id");
  const currentReminder = await requireOwnedReminder(supabase, userId, reminderId);

  const { error } = await supabase.from("reminders").delete().eq("id", reminderId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReminderPaths(currentReminder.vehicle_id);
  redirect("/reminders#records");
}

export async function postponeReminder(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const reminderId = requiredText(formData, "id");
  const days = optionalInteger(formData, "postpone_days") ?? 0;
  const kilometers = optionalInteger(formData, "postpone_km") ?? 0;

  if (days <= 0 && kilometers <= 0) {
    throw new Error("Zadejte počet dní nebo kilometrů pro odložení.");
  }

  const reminder = await requireOwnedReminder(supabase, userId, reminderId);
  const vehicle = await requireOwnedVehicle(supabase, userId, reminder.vehicle_id);
  const nextDueDate = days > 0 ? addDays(reminder.next_due_date ?? reminder.due_date ?? todayDate(), days) : reminder.next_due_date;
  const nextDueMileage = kilometers > 0
    ? (reminder.next_due_mileage ?? vehicle.current_mileage) + kilometers
    : reminder.next_due_mileage;
  const status = calculateStatus({
    dueDate: nextDueDate,
    dueMileage: nextDueMileage,
    notifyBeforeDays: reminder.notify_before_days,
    notifyBeforeKm: reminder.notify_before_km,
    currentMileage: vehicle.current_mileage,
  });

  const { error } = await supabase
    .from("reminders")
    .update({
      next_due_date: nextDueDate,
      next_due_mileage: nextDueMileage,
      status,
    })
    .eq("id", reminderId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReminderPaths(reminder.vehicle_id);
  redirect("/reminders#records");
}

export async function completeReminder(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const reminderId = requiredText(formData, "id");
  const createNext = optionalBoolean(formData, "create_next");
  const reminder = await requireOwnedReminder(supabase, userId, reminderId);
  const vehicle = await requireOwnedVehicle(supabase, userId, reminder.vehicle_id);
  const doneDate = todayDate();
  const doneMileage = optionalInteger(formData, "done_mileage") ?? vehicle.current_mileage;

  const { error } = await supabase
    .from("reminders")
    .update({
      last_done_date: doneDate,
      last_done_mileage: doneMileage,
      status: "done",
    })
    .eq("id", reminderId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (createNext) {
    const nextReminder = buildNextReminder(reminder, userId, doneDate, doneMileage, vehicle.current_mileage);

    if (!nextReminder.next_due_date && nextReminder.next_due_mileage == null) {
      throw new Error("Pro zopakování připomínky nastavte interval dní, měsíců, let nebo kilometrů.");
    }

    const { error: insertError } = await supabase.from("reminders").insert(nextReminder);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidateReminderPaths(reminder.vehicle_id);
  redirect("/reminders#records");
}

async function requireAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase není nakonfigurovaný.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Pro práci s připomínkami se musíte přihlásit.");
  }

  return { supabase, userId: user.id };
}

async function requireOwnedVehicle(supabase: SupabaseServerClient, userId: string, vehicleId: string) {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id,current_mileage")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (error || !vehicle) {
    throw new Error("Vozidlo pro tuto připomínku nebylo nalezeno.");
  }

  return {
    id: vehicle.id,
    current_mileage: Number(vehicle.current_mileage ?? 0),
  };
}

async function requireOwnedReminder(supabase: SupabaseServerClient, userId: string, reminderId: string) {
  const { data: reminder, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("id", reminderId)
    .eq("user_id", userId)
    .single();

  if (error || !reminder) {
    throw new Error("Připomínka nebyla nalezena.");
  }

  return reminder as Reminder;
}

function buildReminderPayload(
  formData: FormData,
  userId: string,
  vehicleId: string,
): Database["public"]["Tables"]["reminders"]["Insert"] {
  const type = requiredReminderType(formData);
  const nextDueDate = optionalDate(formData, "next_due_date");
  const nextDueMileage = optionalInteger(formData, "next_due_mileage");
  const notifyBeforeDays = optionalInteger(formData, "notify_before_days");
  const notifyBeforeKm = optionalInteger(formData, "notify_before_km");

  if ((type === "date" || type === "combined") && !nextDueDate) {
    throw new Error("Datum další připomínky je povinné pro datumové připomínky.");
  }

  if ((type === "mileage" || type === "combined") && nextDueMileage == null) {
    throw new Error("Kilometry další připomínky jsou povinné pro kilometrové připomínky.");
  }

  return {
    user_id: userId,
    vehicle_id: vehicleId,
    type,
    title: requiredText(formData, "title"),
    category: requiredText(formData, "category"),
    due_date: nextDueDate,
    last_done_date: optionalDate(formData, "last_done_date"),
    last_done_mileage: optionalInteger(formData, "last_done_mileage"),
    interval_days: optionalInteger(formData, "interval_days"),
    interval_months: optionalInteger(formData, "interval_months"),
    interval_years: optionalInteger(formData, "interval_years"),
    interval_km: optionalInteger(formData, "interval_km"),
    next_due_date: nextDueDate,
    next_due_mileage: nextDueMileage,
    notify_before_days: notifyBeforeDays,
    notify_before_km: notifyBeforeKm,
    status: "upcoming",
    repeat_interval: optionalText(formData, "repeat_interval"),
    notes: optionalText(formData, "notes"),
  };
}

function buildNextReminder(
  reminder: Reminder,
  userId: string,
  doneDate: string,
  doneMileage: number,
  currentMileage: number,
): Database["public"]["Tables"]["reminders"]["Insert"] {
  const nextDueDate = calculateNextDueDate(doneDate, reminder);
  const nextDueMileage = reminder.interval_km == null ? null : doneMileage + reminder.interval_km;

  return {
    user_id: userId,
    vehicle_id: reminder.vehicle_id,
    type: reminder.type,
    title: reminder.title,
    category: reminder.category,
    due_date: nextDueDate,
    last_done_date: doneDate,
    last_done_mileage: doneMileage,
    interval_days: reminder.interval_days,
    interval_months: reminder.interval_months,
    interval_years: reminder.interval_years,
    interval_km: reminder.interval_km,
    next_due_date: nextDueDate,
    next_due_mileage: nextDueMileage,
    notify_before_days: reminder.notify_before_days,
    notify_before_km: reminder.notify_before_km,
    status: calculateStatus({
      dueDate: nextDueDate,
      dueMileage: nextDueMileage,
      notifyBeforeDays: reminder.notify_before_days,
      notifyBeforeKm: reminder.notify_before_km,
      currentMileage,
    }),
    repeat_interval: reminder.repeat_interval,
    notes: reminder.notes,
  };
}

function calculateNextDueDate(doneDate: string, reminder: Reminder) {
  const date = new Date(`${doneDate}T00:00:00`);

  if (reminder.interval_years) {
    date.setFullYear(date.getFullYear() + reminder.interval_years);
  }

  if (reminder.interval_months) {
    date.setMonth(date.getMonth() + reminder.interval_months);
  }

  if (reminder.interval_days) {
    date.setDate(date.getDate() + reminder.interval_days);
  }

  if (!reminder.interval_years && !reminder.interval_months && !reminder.interval_days) {
    return null;
  }

  return formatDateInput(date);
}

function calculateStatus({
  dueDate,
  dueMileage,
  notifyBeforeDays,
  notifyBeforeKm,
  currentMileage,
}: {
  dueDate: string | null;
  dueMileage: number | null;
  notifyBeforeDays: number | null;
  notifyBeforeKm: number | null;
  currentMileage: number;
}): ReminderStatus {
  const daysRemaining = dueDate ? daysUntil(dueDate) : null;
  const kilometersRemaining = dueMileage == null ? null : dueMileage - currentMileage;

  if ((daysRemaining != null && daysRemaining < 0) || (kilometersRemaining != null && kilometersRemaining < 0)) {
    return "overdue";
  }

  if (
    (daysRemaining != null && notifyBeforeDays != null && daysRemaining <= notifyBeforeDays) ||
    (kilometersRemaining != null && notifyBeforeKm != null && kilometersRemaining <= notifyBeforeKm)
  ) {
    return "due_soon";
  }

  return "upcoming";
}

function revalidateReminderPaths(vehicleId: string) {
  revalidatePath("/reminders");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
}

function requiredReminderType(formData: FormData) {
  const value = requiredText(formData, "type");

  if (value === "date" || value === "mileage" || value === "combined") {
    return value;
  }

  throw new Error("Neplatný typ připomínky.");
}

function requiredText(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    throw new Error(`Pole ${key} je povinné.`);
  }

  return value;
}

function optionalText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function optionalDate(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Datum musí být ve formátu RRRR-MM-DD.");
  }

  return value;
}

function optionalNumber(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalInteger(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null) {
    return null;
  }

  if (value < 0) {
    throw new Error(`Pole ${key} nesmí být záporné.`);
  }

  return Math.round(value);
}

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return formatDateInput(nextDate);
}

function daysUntil(date: string) {
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function todayDate() {
  return formatDateInput(new Date());
}

function formatDateInput(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
