"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { EnergyEntryType, PowertrainType, QuantityUnit } from "@/types/domain";

const entryTypes = new Set<EnergyEntryType>(["fuel", "charging", "lpg", "cng"]);
const quantityUnits = new Set<QuantityUnit>(["liters", "kWh", "kg", "gallons"]);

export async function createEnergyEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const vehicleId = requiredText(formData, "vehicle_id");

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id,powertrain_type,fuel_type,current_mileage")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (vehicleError || !vehicle) {
    throw new Error("Vozidlo pro tento záznam nebylo nalezeno.");
  }

  const payload = buildEnergyPayload(formData, userId, vehicle);
  const { error } = await supabase.from("energy_entries").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  if (payload.mileage > Number(vehicle.current_mileage ?? 0)) {
    const { error: mileageError } = await supabase
      .from("vehicles")
      .update({ current_mileage: payload.mileage })
      .eq("id", vehicle.id)
      .eq("user_id", userId);

    if (mileageError) {
      throw new Error(mileageError.message);
    }
  }

  revalidatePath("/fuel-energy");
  revalidatePath(`/vehicles/${vehicle.id}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  redirect("/fuel-energy#records");
}

export async function updateEnergyEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const entryId = requiredText(formData, "id");
  const vehicleId = requiredText(formData, "vehicle_id");

  const { data: currentEntry, error: currentEntryError } = await supabase
    .from("energy_entries")
    .select("id,vehicle_id")
    .eq("id", entryId)
    .eq("user_id", userId)
    .single();

  if (currentEntryError || !currentEntry) {
    throw new Error("Záznam pro úpravu nebyl nalezen.");
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id,powertrain_type,fuel_type,current_mileage")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (vehicleError || !vehicle) {
    throw new Error("Vozidlo pro tento záznam nebylo nalezeno.");
  }

  const payload = buildEnergyPayload(formData, userId, vehicle);
  const { error } = await supabase
    .from("energy_entries")
    .update(payload)
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (payload.mileage > Number(vehicle.current_mileage ?? 0)) {
    const { error: mileageError } = await supabase
      .from("vehicles")
      .update({ current_mileage: payload.mileage })
      .eq("id", vehicle.id)
      .eq("user_id", userId);

    if (mileageError) {
      throw new Error(mileageError.message);
    }
  }

  revalidatePath("/fuel-energy");
  revalidatePath(`/vehicles/${vehicle.id}`);
  revalidatePath(`/vehicles/${currentEntry.vehicle_id}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  redirect("/fuel-energy#records");
}

export async function deleteEnergyEntry(formData: FormData) {
  const { supabase, userId } = await requireAuthenticatedUser();
  const entryId = requiredText(formData, "id");

  const { data: currentEntry, error: currentEntryError } = await supabase
    .from("energy_entries")
    .select("id,vehicle_id")
    .eq("id", entryId)
    .eq("user_id", userId)
    .single();

  if (currentEntryError || !currentEntry) {
    throw new Error("Záznam pro smazání nebyl nalezen.");
  }

  const { error } = await supabase
    .from("energy_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/fuel-energy");
  revalidatePath(`/vehicles/${currentEntry.vehicle_id}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  redirect("/fuel-energy#records");
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
    throw new Error("Pro přidání tankování nebo nabíjení se musíte přihlásit.");
  }

  return { supabase, userId: user.id };
}

function buildEnergyPayload(
  formData: FormData,
  userId: string,
  vehicle: Pick<
    Database["public"]["Tables"]["vehicles"]["Row"],
    "id" | "powertrain_type" | "fuel_type" | "current_mileage"
  >,
): Database["public"]["Tables"]["energy_entries"]["Insert"] {
  const entryType = normalizeEntryType(
    enumValue(formData, "entry_type", entryTypes, defaultEntryType(vehicle.powertrain_type)),
    vehicle.powertrain_type,
  );
  const quantity = positiveNumber(formData, "quantity");
  const totalPrice = optionalNumber(formData, "total_price");
  const unitPrice = optionalNumber(formData, "unit_price");
  const resolvedTotalPrice = totalPrice ?? (unitPrice == null ? null : unitPrice * quantity);

  if (resolvedTotalPrice == null || resolvedTotalPrice < 0) {
    throw new Error("Zadejte celkovou cenu nebo cenu za jednotku.");
  }

  const mileage = positiveInteger(formData, "mileage");
  const date = requiredDate(formData, "date");
  const quantityUnit = enumValue(formData, "quantity_unit", quantityUnits, defaultQuantityUnit(entryType));
  const chargingEntry = entryType === "charging";

  return {
    user_id: userId,
    vehicle_id: vehicle.id,
    date,
    mileage,
    entry_type: entryType,
    fuel_type: chargingEntry ? "electricity" : vehicle.fuel_type ?? fuelTypeForPowertrain(vehicle.powertrain_type),
    quantity,
    quantity_unit: quantityUnit,
    total_price: roundMoney(resolvedTotalPrice),
    unit_price: unitPrice == null ? roundMoney(resolvedTotalPrice / quantity) : roundMoney(unitPrice),
    full_tank: chargingEntry ? null : optionalBoolean(formData, "full_tank"),
    full_charge: chargingEntry ? optionalBoolean(formData, "full_charge") : null,
    fuel_station: chargingEntry ? null : optionalText(formData, "fuel_station"),
    charging_location: chargingEntry ? optionalText(formData, "charging_location") : null,
    charging_type: chargingEntry ? optionalText(formData, "charging_type") : null,
    charging_provider: chargingEntry ? optionalText(formData, "charging_provider") : null,
    battery_before_percent: chargingEntry ? optionalPercent(formData, "battery_before_percent") : null,
    battery_after_percent: chargingEntry ? optionalPercent(formData, "battery_after_percent") : null,
    driving_type: optionalText(formData, "driving_type"),
    notes: optionalText(formData, "notes"),
  };
}

function normalizeEntryType(entryType: EnergyEntryType, powertrain: PowertrainType) {
  if (powertrain === "electric") {
    return "charging";
  }

  if (powertrain === "lpg") {
    return "lpg";
  }

  if (powertrain === "cng") {
    return "cng";
  }

  if (powertrain !== "plug_in_hybrid" && entryType === "charging") {
    return "fuel";
  }

  return entryType;
}

function defaultEntryType(powertrain: PowertrainType): EnergyEntryType {
  if (powertrain === "electric") {
    return "charging";
  }

  if (powertrain === "lpg") {
    return "lpg";
  }

  if (powertrain === "cng") {
    return "cng";
  }

  return "fuel";
}

function defaultQuantityUnit(entryType: EnergyEntryType): QuantityUnit {
  if (entryType === "charging") {
    return "kWh";
  }

  if (entryType === "cng") {
    return "kg";
  }

  return "liters";
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

function positiveNumber(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null || value <= 0) {
    throw new Error(`Pole ${key} musí být větší než nula.`);
  }

  return value;
}

function positiveInteger(formData: FormData, key: string) {
  const value = positiveNumber(formData, key);
  return Math.round(value);
}

function optionalPercent(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);

  if (value == null) {
    return null;
  }

  if (value < 0 || value > 100) {
    throw new Error("Procenta baterie musí být mezi 0 a 100.");
  }

  return Math.round(value);
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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
