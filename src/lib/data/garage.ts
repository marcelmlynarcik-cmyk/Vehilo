import type {
  EnergyEntry,
  Expense,
  GarageData,
  Profile,
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
  profile: null,
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
    profileResult,
    vehiclesResult,
    expensesResult,
    energyResult,
    serviceResult,
    remindersResult,
    documentsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("vehicles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("energy_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("service_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("reminders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const error =
    profileResult.error?.message ??
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
      profile: (profileResult.data ?? null) as Profile | null,
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
