"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { DocumentStatus } from "@/types/domain";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
type DocumentPayload = Database["public"]["Tables"]["documents"]["Insert"] & {
  name: string;
  category: string;
  expiration_date: string | null;
  status: DocumentStatus;
};

export async function createDocument(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildDocumentPayload(formData, userId, vehicleId);
  const documentFile = optionalDocumentFile(formData, "document_file");
  let uploadedDocumentPath: string | null = null;

  if (documentFile) {
    uploadedDocumentPath = await uploadDocumentFile({ file: documentFile, supabase, userId });
    payload.file_url = uploadedDocumentPath;
  }

  const { data: document, error } = await supabase.from("documents").insert(payload).select("id").single();

  if (error || !document) {
    if (uploadedDocumentPath) {
      await deleteDocumentFile({ path: uploadedDocumentPath, supabase });
    }

    throw new Error(error?.message ?? "Dokument se nepodařilo uložit.");
  }

  await syncDocumentExpirationReminder(supabase, userId, document.id, payload);
  revalidateDocumentPaths(vehicleId);
  redirect("/documents#records");
}

export async function updateDocument(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const documentId = requiredText(formData, "id");
  const vehicleId = requiredText(formData, "vehicle_id");

  const { data: currentDocument, error: currentDocumentError } = await supabase
    .from("documents")
    .select("id,vehicle_id,file_url")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (currentDocumentError || !currentDocument) {
    throw new Error("Dokument pro úpravu nebyl nalezen.");
  }

  await requireOwnedVehicle(supabase, userId, vehicleId);

  const payload = buildDocumentPayload(formData, userId, vehicleId);
  const documentFile = optionalDocumentFile(formData, "document_file");
  const removeFile = optionalBoolean(formData, "remove_file");
  let uploadedDocumentPath: string | null = null;

  if (documentFile) {
    uploadedDocumentPath = await uploadDocumentFile({ file: documentFile, supabase, userId });
    payload.file_url = uploadedDocumentPath;
  } else if (removeFile) {
    payload.file_url = null;
  }

  const { error } = await supabase.from("documents").update(payload).eq("id", documentId).eq("user_id", userId);

  if (error) {
    if (uploadedDocumentPath) {
      await deleteDocumentFile({ path: uploadedDocumentPath, supabase });
    }

    throw new Error(error.message);
  }

  if ((documentFile || removeFile) && currentDocument.file_url) {
    await deleteDocumentFile({ path: currentDocument.file_url, supabase });
  }

  await syncDocumentExpirationReminder(supabase, userId, documentId, payload);
  revalidateDocumentPaths(vehicleId);
  revalidateDocumentPaths(currentDocument.vehicle_id);
  revalidatePath(`/documents/${documentId}`);
  redirect("/documents#records");
}

export async function deleteDocument(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const documentId = requiredText(formData, "id");

  const { data: currentDocument, error: currentDocumentError } = await supabase
    .from("documents")
    .select("id,vehicle_id,file_url")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (currentDocumentError || !currentDocument) {
    throw new Error("Dokument pro smazání nebyl nalezen.");
  }

  await supabase.from("reminders").delete().eq("document_id", documentId).eq("user_id", userId);

  const { error } = await supabase.from("documents").delete().eq("id", documentId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (currentDocument.file_url) {
    await deleteDocumentFile({ path: currentDocument.file_url, supabase });
  }

  revalidateDocumentPaths(currentDocument.vehicle_id);
  redirect("/documents#records");
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
    throw new Error("Pro práci s dokumenty se musíte přihlásit.");
  }

  return { supabase, userId: user.id };
}

async function requireOwnedVehicle(supabase: SupabaseServerClient, userId: string, vehicleId: string) {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (error || !vehicle) {
    throw new Error("Vozidlo pro tento dokument nebylo nalezeno.");
  }
}

function buildDocumentPayload(
  formData: FormData,
  userId: string,
  vehicleId: string,
): DocumentPayload {
  const issueDate = optionalDate(formData, "issue_date");
  const expirationDate = optionalDate(formData, "expiration_date");

  return {
    user_id: userId,
    vehicle_id: vehicleId,
    name: requiredText(formData, "name"),
    category: requiredText(formData, "category"),
    issue_date: issueDate,
    expiration_date: expirationDate,
    notes: optionalText(formData, "notes"),
    status: documentStatus(expirationDate),
  };
}

async function syncDocumentExpirationReminder(
  supabase: SupabaseServerClient,
  userId: string,
  documentId: string,
  document: DocumentPayload,
) {
  if (!document.expiration_date) {
    const { error } = await supabase.from("reminders").delete().eq("document_id", documentId).eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const notifyBeforeDays = await loadDefaultNotifyBeforeDays(supabase, userId);
  const payload: Database["public"]["Tables"]["reminders"]["Insert"] = {
    user_id: userId,
    vehicle_id: document.vehicle_id,
    document_id: documentId,
    type: "date",
    title: `Platnost dokumentu: ${document.name}`,
    category: "Dokumenty",
    due_date: document.expiration_date,
    next_due_date: document.expiration_date,
    next_due_mileage: null,
    notify_before_days: notifyBeforeDays,
    notify_before_km: null,
    status: reminderStatus(document.expiration_date, notifyBeforeDays),
    notes: `${document.category} - automaticky vytvořeno z dokumentu.`,
  };

  const { data: existingReminder, error: existingReminderError } = await supabase
    .from("reminders")
    .select("id")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingReminderError) {
    throw new Error(existingReminderError.message);
  }

  const result = existingReminder
    ? await supabase.from("reminders").update(payload).eq("id", existingReminder.id).eq("user_id", userId)
    : await supabase.from("reminders").insert(payload);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function loadDefaultNotifyBeforeDays(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("default_reminder_notify_before_days")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.default_reminder_notify_before_days ?? 14);
}

function reminderStatus(expirationDate: string, notifyBeforeDays: number): Database["public"]["Tables"]["reminders"]["Row"]["status"] {
  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const expiresAt = new Date(`${expirationDate}T00:00:00.000Z`).getTime();
  const daysRemaining = Math.ceil((expiresAt - startOfToday) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return "overdue";
  }

  return daysRemaining <= notifyBeforeDays ? "due_soon" : "upcoming";
}

function documentStatus(expirationDate: string | null): DocumentStatus {
  if (!expirationDate) {
    return "valid";
  }

  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const expiresAt = new Date(`${expirationDate}T00:00:00.000Z`).getTime();
  const daysRemaining = Math.ceil((expiresAt - startOfToday) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return "expired";
  }

  return daysRemaining <= 30 ? "expiring_soon" : "valid";
}

function revalidateDocumentPaths(vehicleId: string) {
  revalidatePath("/documents");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
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
    throw new Error("Dokument musí být PDF nebo obrázek.");
  }

  if (value.size > 10 * 1024 * 1024) {
    throw new Error("Dokument může mít maximálně 10 MB.");
  }

  return value;
}

async function uploadDocumentFile({
  file,
  supabase,
  userId,
}: {
  file: File;
  supabase: SupabaseServerClient;
  userId: string;
}) {
  const path = `${userId}/documents/${randomUUID()}.${extensionFromFile(file)}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("documents")
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

async function deleteDocumentFile({ path, supabase }: { path: string | null; supabase: SupabaseServerClient }) {
  if (!path || /^https?:\/\//i.test(path)) {
    return;
  }

  const { error } = await supabase.storage.from("documents").remove([path]);

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
