"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createExpense(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildExpensePayload(formData, userId, vehicleId);
  const receiptFile = optionalDocumentFile(formData, "receipt_file");
  let uploadedReceiptPath: string | null = null;

  if (receiptFile) {
    uploadedReceiptPath = await uploadRecordFile({
      bucket: "receipts",
      folder: "expenses",
      file: receiptFile,
      supabase,
      userId,
    });
    payload.receipt_url = uploadedReceiptPath;
  }

  const { error } = await supabase.from("expenses").insert(payload);

  if (error) {
    if (uploadedReceiptPath) {
      await deleteRecordFile({ bucket: "receipts", path: uploadedReceiptPath, supabase });
    }

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
    .select("id,vehicle_id,receipt_url")
    .eq("id", expenseId)
    .eq("user_id", userId)
    .single();

  if (currentExpenseError || !currentExpense) {
    throw new Error("Výdaj pro úpravu nebyl nalezen.");
  }

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildExpensePayload(formData, userId, vehicleId);
  const receiptFile = optionalDocumentFile(formData, "receipt_file");
  const removeReceipt = optionalBoolean(formData, "remove_receipt");
  let uploadedReceiptPath: string | null = null;

  if (receiptFile) {
    uploadedReceiptPath = await uploadRecordFile({
      bucket: "receipts",
      folder: "expenses",
      file: receiptFile,
      supabase,
      userId,
    });
    payload.receipt_url = uploadedReceiptPath;
  } else if (removeReceipt) {
    payload.receipt_url = null;
  }

  const { error } = await supabase.from("expenses").update(payload).eq("id", expenseId).eq("user_id", userId);

  if (error) {
    if (uploadedReceiptPath) {
      await deleteRecordFile({ bucket: "receipts", path: uploadedReceiptPath, supabase });
    }

    throw new Error(error.message);
  }

  if ((receiptFile || removeReceipt) && currentExpense.receipt_url) {
    await deleteRecordFile({ bucket: "receipts", path: currentExpense.receipt_url, supabase });
  }

  revalidateExpensePaths(vehicleId);
  revalidateExpensePaths(currentExpense.vehicle_id);
  revalidatePath(`/expenses/${expenseId}`);
  redirect("/expenses#records");
}

export async function deleteExpense(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const expenseId = requiredText(formData, "id");

  const { data: currentExpense, error: currentExpenseError } = await supabase
    .from("expenses")
    .select("id,vehicle_id,receipt_url")
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

  if (currentExpense.receipt_url) {
    await deleteRecordFile({ bucket: "receipts", path: currentExpense.receipt_url, supabase });
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

function optionalDocumentFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  const allowedTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]);

  if (!allowedTypes.has(value.type)) {
    throw new Error("Příloha musí být PDF nebo obrázek.");
  }

  if (value.size > 10 * 1024 * 1024) {
    throw new Error("Příloha může mít maximálně 10 MB.");
  }

  return value;
}

async function uploadRecordFile({
  bucket,
  folder,
  file,
  supabase,
  userId,
}: {
  bucket: "receipts";
  folder: string;
  file: File;
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  userId: string;
}) {
  const path = `${userId}/${folder}/${randomUUID()}.${extensionFromFile(file)}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function deleteRecordFile({
  bucket,
  path,
  supabase,
}: {
  bucket: "receipts";
  path: string | null;
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
}) {
  if (!path || /^https?:\/\//i.test(path)) {
    return;
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

function extensionFromFile(file: File) {
  const subtype = file.type.split("/")[1]?.toLowerCase();
  const extension = subtype?.replace(/[^a-z0-9]/g, "");

  if (extension) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  const fallback = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fallback || "bin";
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
