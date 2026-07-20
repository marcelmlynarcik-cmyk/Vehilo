"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createExpense(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildExpensePayload(formData, userId, vehicleId);
  const { error } = await supabase.from("expenses").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidateExpensePaths(vehicleId);
  redirect("/expenses#records");
}

export async function updateExpense(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const expenseId = requiredText(formData, "id");
  const vehicleId = requiredText(formData, "vehicle_id");

  const { data: currentExpense, error: currentExpenseError } = await supabase
    .from("expenses")
    .select("id,vehicle_id")
    .eq("id", expenseId)
    .eq("user_id", userId)
    .single();

  if (currentExpenseError || !currentExpense) {
    throw new Error("Výdaj pro úpravu nebyl nalezen.");
  }

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildExpensePayload(formData, userId, vehicleId);
  const { error } = await supabase.from("expenses").update(payload).eq("id", expenseId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateExpensePaths(vehicleId);
  revalidateExpensePaths(currentExpense.vehicle_id);
  redirect("/expenses#records");
}

export async function deleteExpense(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const expenseId = requiredText(formData, "id");

  const { data: currentExpense, error: currentExpenseError } = await supabase
    .from("expenses")
    .select("id,vehicle_id")
    .eq("id", expenseId)
    .eq("user_id", userId)
    .single();

  if (currentExpenseError || !currentExpense) {
    throw new Error("Výdaj pro smazání nebyl nalezen.");
  }

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateExpensePaths(currentExpense.vehicle_id);
  redirect("/expenses#records");
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
    throw new Error("Pro práci s výdaji se musíte přihlásit.");
  }

  return { supabase, userId: user.id };
}

async function requireOwnedVehicle(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  userId: string,
  vehicleId: string,
) {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (error || !vehicle) {
    throw new Error("Vozidlo pro tento výdaj nebylo nalezeno.");
  }
}

function buildExpensePayload(
  formData: FormData,
  userId: string,
  vehicleId: string,
): Database["public"]["Tables"]["expenses"]["Insert"] {
  return {
    user_id: userId,
    vehicle_id: vehicleId,
    date: requiredDate(formData, "date"),
    category: requiredText(formData, "category"),
    description: requiredText(formData, "description"),
    amount: positiveNumber(formData, "amount"),
    currency: optionalText(formData, "currency") ?? "CZK",
    mileage: optionalInteger(formData, "mileage"),
    payment_method: null,
    notes: optionalText(formData, "notes"),
  };
}

function revalidateExpensePaths(vehicleId: string) {
  revalidatePath("/expenses");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
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

function requiredDate(formData: FormData, key: string) {
  const value = requiredText(formData, key);

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

function positiveNumber(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null || value <= 0) {
    throw new Error(`Pole ${key} musí být větší než nula.`);
  }

  return Math.round(value * 100) / 100;
}

function optionalInteger(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);
  return value == null ? null : Math.round(value);
}
