import type { EnergyEntry, Expense, ServiceEntry, Vehicle } from "@/types/domain";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function loadExpenseDetailData(expenseId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return null;
  }

  const { supabase, userId } = context;
  const expenseResult = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (expenseResult.error) {
    throw new Error(expenseResult.error.message);
  }

  if (!expenseResult.data) {
    return null;
  }

  const expense = expenseResult.data as Expense;
  const vehicle = await loadVehicle(expense.vehicle_id, userId);

  return { expense, vehicle };
}

export async function loadEnergyEntryDetailData(entryId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return null;
  }

  const { supabase, userId } = context;
  const entryResult = await supabase
    .from("energy_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (entryResult.error) {
    throw new Error(entryResult.error.message);
  }

  if (!entryResult.data) {
    return null;
  }

  const entry = entryResult.data as EnergyEntry;
  const vehicle = await loadVehicle(entry.vehicle_id, userId);

  return { entry, vehicle };
}

export async function loadServiceEntryDetailData(entryId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return null;
  }

  const { supabase, userId } = context;
  const entryResult = await supabase
    .from("service_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (entryResult.error) {
    throw new Error(entryResult.error.message);
  }

  if (!entryResult.data) {
    return null;
  }

  const entry = entryResult.data as ServiceEntry;
  const vehicle = await loadVehicle(entry.vehicle_id, userId);

  return { entry, vehicle };
}

async function loadVehicle(vehicleId: string, userId: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const vehicleResult = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (vehicleResult.error) {
    throw new Error(vehicleResult.error.message);
  }

  return (vehicleResult.data ?? null) as Vehicle | null;
}

async function getAuthenticatedContext() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, userId: user.id };
}
