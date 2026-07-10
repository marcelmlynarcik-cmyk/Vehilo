import type {
  EnergyEntry,
  Expense,
  GarageData,
  Reminder,
  ServiceEntry,
  Vehicle,
  VehicleDocument,
} from "@/types/domain";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface GarageLoadResult {
  configured: boolean;
  authenticated: boolean;
  data: GarageData;
  error?: string;
}

const emptyGarageData: GarageData = {
  vehicles: [],
  expenses: [],
  energyEntries: [],
  serviceEntries: [],
  reminders: [],
  documents: [],
};

export async function loadGarageData(): Promise<GarageLoadResult> {
  if (!hasSupabaseConfig()) {
    return {
      configured: false,
      authenticated: false,
      data: emptyGarageData,
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      authenticated: false,
      data: emptyGarageData,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      configured: true,
      authenticated: false,
      data: emptyGarageData,
      error: userError.message,
    };
  }

  if (!user) {
    return {
      configured: true,
      authenticated: false,
      data: emptyGarageData,
    };
  }

  const [
    vehiclesResult,
    expensesResult,
    energyResult,
    serviceResult,
    remindersResult,
    documentsResult,
  ] = await Promise.all([
    supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("energy_entries").select("*").order("date", { ascending: false }),
    supabase.from("service_entries").select("*").order("date", { ascending: false }),
    supabase.from("reminders").select("*").order("created_at", { ascending: false }),
    supabase.from("documents").select("*").order("created_at", { ascending: false }),
  ]);

  const error =
    vehiclesResult.error?.message ??
    expensesResult.error?.message ??
    energyResult.error?.message ??
    serviceResult.error?.message ??
    remindersResult.error?.message ??
    documentsResult.error?.message;

  return {
    configured: true,
    authenticated: true,
    data: {
      vehicles: (vehiclesResult.data ?? []) as Vehicle[],
      expenses: (expensesResult.data ?? []) as Expense[],
      energyEntries: (energyResult.data ?? []) as EnergyEntry[],
      serviceEntries: (serviceResult.data ?? []) as ServiceEntry[],
      reminders: (remindersResult.data ?? []) as Reminder[],
      documents: (documentsResult.data ?? []) as VehicleDocument[],
    },
    error,
  };
}
