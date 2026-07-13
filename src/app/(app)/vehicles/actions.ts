"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { PowertrainType, VehicleStatus } from "@/types/domain";

const powertrainTypes = new Set<PowertrainType>([
  "petrol",
  "diesel",
  "hybrid",
  "plug_in_hybrid",
  "electric",
  "lpg",
  "cng",
]);

const vehicleStatuses = new Set<VehicleStatus>(["active", "sold", "archived"]);
const currencies = new Set(["CZK", "EUR", "USD", "GBP", "PLN"]);
const transmissions = new Set(["manual", "automatic"]);

export async function createVehicle(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const payload = buildVehiclePayload(formData, userId);
  const photoFile = optionalImageFile(formData, "photo_file");

  const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  if (photoFile) {
    const photoPath = await uploadVehiclePhoto({
      file: photoFile,
      supabase,
      userId,
      vehicleId: data.id,
    });

    const { error: photoUpdateError } = await supabase
      .from("vehicles")
      .update({ photo_url: photoPath })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (photoUpdateError) {
      throw new Error(photoUpdateError.message);
    }
  }

  revalidateVehicleRoutes(data.id);
  redirect(`/vehicles/${data.id}`);
}

export async function updateVehicle(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "id");
  const payload = buildVehiclePayload(formData, userId);
  const photoFile = optionalImageFile(formData, "photo_file");
  const removePhoto = optionalBoolean(formData, "remove_photo");
  const currentPhotoPath = photoFile || removePhoto
    ? await loadCurrentVehiclePhotoPath({ supabase, userId, vehicleId })
    : null;

  const { error } = await supabase
    .from("vehicles")
    .update(payload)
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (photoFile) {
    const photoPath = await uploadVehiclePhoto({
      file: photoFile,
      supabase,
      userId,
      vehicleId,
    });

    const { error: photoUpdateError } = await supabase
      .from("vehicles")
      .update({ photo_url: photoPath })
      .eq("id", vehicleId)
      .eq("user_id", userId);

    if (photoUpdateError) {
      await deleteVehiclePhoto({ supabase, path: photoPath });
      throw new Error(photoUpdateError.message);
    }

    await deleteVehiclePhoto({ supabase, path: currentPhotoPath });
  } else if (removePhoto) {
    const { error: photoUpdateError } = await supabase
      .from("vehicles")
      .update({ photo_url: null })
      .eq("id", vehicleId)
      .eq("user_id", userId);

    if (photoUpdateError) {
      throw new Error(photoUpdateError.message);
    }

    await deleteVehiclePhoto({ supabase, path: currentPhotoPath });
  }

  revalidateVehicleRoutes(vehicleId);
  redirect(`/vehicles/${vehicleId}`);
}

export async function archiveVehicle(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "id");

  const { error } = await supabase
    .from("vehicles")
    .update({ status: "archived" satisfies VehicleStatus })
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateVehicleRoutes(vehicleId);
  redirect("/vehicles");
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
    throw new Error("Pro úpravu vozidla se musíte přihlásit.");
  }

  return { supabase, userId: user.id };
}

function buildVehiclePayload(
  formData: FormData,
  userId: string,
): Database["public"]["Tables"]["vehicles"]["Insert"] {
  const powertrain = enumValue(formData, "powertrain_type", powertrainTypes, "petrol");
  const status = enumValue(formData, "status", vehicleStatuses, "active");
  const currency = enumValue(formData, "currency", currencies, "CZK");
  const transmission = optionalEnumValue(formData, "transmission", transmissions);

  return {
    user_id: userId,
    name: requiredText(formData, "name"),
    brand: requiredText(formData, "brand"),
    model: requiredText(formData, "model"),
    generation: optionalText(formData, "generation"),
    trim: optionalText(formData, "trim"),
    year: optionalInteger(formData, "year"),
    vin: optionalText(formData, "vin"),
    license_plate: optionalText(formData, "license_plate"),
    powertrain_type: powertrain,
    fuel_type: fuelTypeForPowertrain(powertrain),
    transmission,
    body_type: optionalText(formData, "body_type"),
    engine: optionalText(formData, "engine"),
    power: optionalText(formData, "power"),
    battery_capacity_kwh: optionalNumber(formData, "battery_capacity_kwh"),
    fuel_tank_size: optionalNumber(formData, "fuel_tank_size"),
    lpg_cng_tank_size: optionalNumber(formData, "lpg_cng_tank_size"),
    purchase_date: optionalText(formData, "purchase_date"),
    purchase_mileage: optionalInteger(formData, "purchase_mileage"),
    current_mileage: optionalInteger(formData, "current_mileage") ?? 0,
    purchase_price: optionalNumber(formData, "purchase_price"),
    current_value: optionalNumber(formData, "current_value"),
    currency,
    insurance_provider: optionalText(formData, "insurance_provider"),
    primary_driver: optionalText(formData, "primary_driver"),
    status,
    notes: optionalText(formData, "notes"),
  };
}

function optionalImageFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!value.type.startsWith("image/")) {
    throw new Error("Fotografie musí být obrázek.");
  }

  if (value.size > 8 * 1024 * 1024) {
    throw new Error("Fotografie může mít maximálně 8 MB.");
  }

  return value;
}

async function uploadVehiclePhoto({
  file,
  supabase,
  userId,
  vehicleId,
}: {
  file: File;
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  userId: string;
  vehicleId: string;
}) {
  const extension = extensionFromFile(file);
  const path = `${userId}/vehicles/${vehicleId}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("vehicle-photos")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

function extensionFromFile(file: File) {
  const subtype = file.type.split("/")[1]?.toLowerCase();
  const extension = subtype?.replace(/[^a-z0-9]/g, "");

  if (extension) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  const fallback = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fallback || "jpg";
}

async function loadCurrentVehiclePhotoPath({
  supabase,
  userId,
  vehicleId,
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  userId: string;
  vehicleId: string;
}) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("photo_url")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.photo_url ?? null;
}

async function deleteVehiclePhoto({
  supabase,
  path,
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  path: string | null;
}) {
  if (!path || /^https?:\/\//i.test(path)) {
    return;
  }

  const { error } = await supabase.storage.from("vehicle-photos").remove([path]);

  if (error) {
    throw new Error(error.message);
  }
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
  return value == null ? null : Math.round(value);
}

function enumValue<T extends string>(
  formData: FormData,
  key: string,
  allowed: Set<T>,
  fallback: T,
) {
  const value = optionalText(formData, key);
  return value && allowed.has(value as T) ? (value as T) : fallback;
}

function optionalEnumValue<T extends string>(formData: FormData, key: string, allowed: Set<T>) {
  const value = optionalText(formData, key);
  return value && allowed.has(value as T) ? value : null;
}

function fuelTypeForPowertrain(powertrain: PowertrainType) {
  if (powertrain === "diesel") {
    return "diesel";
  }

  if (powertrain === "electric") {
    return "electricity";
  }

  if (powertrain === "lpg" || powertrain === "cng") {
    return powertrain;
  }

  return "petrol";
}

function revalidateVehicleRoutes(vehicleId: string) {
  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}
