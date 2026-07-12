"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const allowedCurrencies = new Set(["CZK", "EUR", "USD", "GBP", "PLN"]);
const allowedDistanceUnits = new Set(["kilometers", "miles"]);
const allowedFuelVolumeUnits = new Set(["liters", "gallons"]);
const allowedEnergyUnits = new Set(["kWh"]);
const allowedConsumptionFormats = new Set(["L/100 km", "MPG", "km/L"]);
const allowedElectricConsumptionFormats = new Set(["kWh/100 km", "mi/kWh"]);
const allowedLanguages = new Set(["cs"]);
const allowedThemes = new Set(["light", "dark", "system"]);

function readAllowed(formData: FormData, key: string, allowed: Set<string>, fallback: string) {
  const value = formData.get(key);

  if (typeof value === "string" && allowed.has(value)) {
    return value;
  }

  return fallback;
}

export async function updatePreferences(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase není nakonfigurovaný.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Pro uložení nastavení je potřeba přihlášení.");
  }

  const nameValue = formData.get("name");
  const name = typeof nameValue === "string" && nameValue.trim() ? nameValue.trim() : null;

  const payload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    email: user.email ?? null,
    name,
    currency: readAllowed(formData, "currency", allowedCurrencies, "CZK"),
    distance_unit: readAllowed(formData, "distance_unit", allowedDistanceUnits, "kilometers"),
    fuel_volume_unit: readAllowed(formData, "fuel_volume_unit", allowedFuelVolumeUnits, "liters"),
    energy_unit: readAllowed(formData, "energy_unit", allowedEnergyUnits, "kWh"),
    consumption_format: readAllowed(formData, "consumption_format", allowedConsumptionFormats, "L/100 km"),
    electric_consumption_format: readAllowed(
      formData,
      "electric_consumption_format",
      allowedElectricConsumptionFormats,
      "kWh/100 km",
    ),
    language: readAllowed(formData, "language", allowedLanguages, "cs"),
    theme: readAllowed(formData, "theme", allowedThemes, "system"),
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  revalidatePath("/expenses");
  revalidatePath("/fuel-energy");
  revalidatePath("/service");
}
