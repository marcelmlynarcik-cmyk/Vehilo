"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createServiceEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildServicePayload(formData, userId, vehicleId);
  const invoiceFile = optionalDocumentFile(formData, "invoice_file");
  let uploadedInvoicePath: string | null = null;

  if (invoiceFile) {
    uploadedInvoicePath = await uploadRecordFile({
      bucket: "service-invoices",
      folder: "service",
      file: invoiceFile,
      supabase,
      userId,
    });
    payload.invoice_url = uploadedInvoicePath;
  }

  const { error } = await supabase.from("service_entries").insert(payload);

  if (error) {
    if (uploadedInvoicePath) {
      await deleteRecordFile({ bucket: "service-invoices", path: uploadedInvoicePath, supabase });
    }

    throw new Error(error.message);
  }

  await updateVehicleMileageIfNeeded(supabase, userId, vehicleId, payload.mileage);
  revalidateServicePaths(vehicleId);
  redirect("/service#records");
}

export async function updateServiceEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const entryId = requiredText(formData, "id");
  const vehicleId = requiredText(formData, "vehicle_id");

  const { data: currentEntry, error: currentEntryError } = await supabase
    .from("service_entries")
    .select("id,vehicle_id,invoice_url")
    .eq("id", entryId)
    .eq("user_id", userId)
    .single();

  if (currentEntryError || !currentEntry) {
    throw new Error("Servisní záznam pro úpravu nebyl nalezen.");
  }

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildServicePayload(formData, userId, vehicleId);
  const invoiceFile = optionalDocumentFile(formData, "invoice_file");
  const removeInvoice = optionalBoolean(formData, "remove_invoice");
  let uploadedInvoicePath: string | null = null;

  if (invoiceFile) {
    uploadedInvoicePath = await uploadRecordFile({
      bucket: "service-invoices",
      folder: "service",
      file: invoiceFile,
      supabase,
      userId,
    });
    payload.invoice_url = uploadedInvoicePath;
  } else if (removeInvoice) {
    payload.invoice_url = null;
  }

  const { error } = await supabase.from("service_entries").update(payload).eq("id", entryId).eq("user_id", userId);

  if (error) {
    if (uploadedInvoicePath) {
      await deleteRecordFile({ bucket: "service-invoices", path: uploadedInvoicePath, supabase });
    }

    throw new Error(error.message);
  }

  if ((invoiceFile || removeInvoice) && currentEntry.invoice_url) {
    await deleteRecordFile({ bucket: "service-invoices", path: currentEntry.invoice_url, supabase });
  }

  await updateVehicleMileageIfNeeded(supabase, userId, vehicleId, payload.mileage);
  revalidateServicePaths(vehicleId);
  revalidateServicePaths(currentEntry.vehicle_id);
  revalidatePath(`/service/${entryId}`);
  redirect("/service#records");
}

export async function deleteServiceEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const entryId = requiredText(formData, "id");

  const { data: currentEntry, error: currentEntryError } = await supabase
    .from("service_entries")
    .select("id,vehicle_id,invoice_url")
    .eq("id", entryId)
    .eq("user_id", userId)
    .single();

  if (currentEntryError || !currentEntry) {
    throw new Error("Servisní záznam pro smazání nebyl nalezen.");
  }

  const { error } = await supabase.from("service_entries").delete().eq("id", entryId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (currentEntry.invoice_url) {
    await deleteRecordFile({ bucket: "service-invoices", path: currentEntry.invoice_url, supabase });
  }

  revalidateServicePaths(currentEntry.vehicle_id);
  redirect("/service#records");
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
    throw new Error("Pro práci se servisem se musíte přihlásit.");
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
    throw new Error("Vozidlo pro tento servisní záznam nebylo nalezeno.");
  }
}

async function updateVehicleMileageIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  userId: string,
  vehicleId: string,
  mileage: number,
) {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id,current_mileage")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (error || !vehicle) {
    throw new Error("Vozidlo pro aktualizaci nájezdu nebylo nalezeno.");
  }

  if (mileage <= Number(vehicle.current_mileage ?? 0)) {
    return;
  }

  const { error: mileageError } = await supabase
    .from("vehicles")
    .update({ current_mileage: mileage })
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (mileageError) {
    throw new Error(mileageError.message);
  }
}

function buildServicePayload(
  formData: FormData,
  userId: string,
  vehicleId: string,
): Database["public"]["Tables"]["service_entries"]["Insert"] {
  return {
    user_id: userId,
    vehicle_id: vehicleId,
    date: requiredDate(formData, "date"),
    mileage: positiveInteger(formData, "mileage"),
    service_type: requiredText(formData, "service_type"),
    description: requiredText(formData, "description"),
    provider: optionalText(formData, "provider"),
    parts_changed: optionalText(formData, "parts_changed"),
    labor_cost: optionalMoney(formData, "labor_cost"),
    parts_cost: optionalMoney(formData, "parts_cost"),
    total_cost: positiveMoney(formData, "total_cost"),
    currency: optionalText(formData, "currency") ?? "CZK",
    warranty_until_date: optionalDate(formData, "warranty_until_date"),
    warranty_until_mileage: optionalInteger(formData, "warranty_until_mileage"),
    notes: optionalText(formData, "notes"),
  };
}

function revalidateServicePaths(vehicleId: string) {
  revalidatePath("/service");
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
  bucket: "service-invoices";
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
  bucket: "service-invoices";
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

function positiveMoney(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null || value <= 0) {
    throw new Error(`Pole ${key} musí být větší než nula.`);
  }

  return Math.round(value * 100) / 100;
}

function optionalMoney(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);
  return value == null ? null : Math.round(value * 100) / 100;
}

function positiveInteger(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null || value <= 0) {
    throw new Error(`Pole ${key} musí být větší než nula.`);
  }

  return Math.round(value);
}

function optionalInteger(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);
  return value == null ? null : Math.round(value);
}
