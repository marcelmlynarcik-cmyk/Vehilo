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

const emptyVehicleData: GarageData = {
  profile: null,
  vehicles: [],
  expenses: [],
  energyEntries: [],
  serviceEntries: [],
  reminders: [],
  documents: [],
};

export async function loadVehicleListData() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return emptyVehicleData;
  }

  const { supabase, userId } = context;
  const [
    profileResult,
    vehiclesResult,
    expensesResult,
    energyResult,
    serviceResult,
    documentsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("energy_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("service_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  throwFirstError(
    profileResult.error?.message,
    vehiclesResult.error?.message,
    expensesResult.error?.message,
    energyResult.error?.message,
    serviceResult.error?.message,
    documentsResult.error?.message,
  );

  const vehicles = await signVehiclePhotos((vehiclesResult.data ?? []) as Vehicle[], supabase);

  return {
    profile: (profileResult.data ?? null) as Profile | null,
    vehicles,
    expenses: (expensesResult.data ?? []) as Expense[],
    energyEntries: (energyResult.data ?? []) as EnergyEntry[],
    serviceEntries: (serviceResult.data ?? []) as ServiceEntry[],
    reminders: [],
    documents: (documentsResult.data ?? []) as VehicleDocument[],
  } satisfies GarageData;
}

export async function loadVehicleDetailData(vehicleId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return null;
  }

  const { supabase, userId } = context;
  const vehicleResult = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (vehicleResult.error) {
    throw new Error(vehicleResult.error.message);
  }

  if (!vehicleResult.data) {
    return null;
  }

  const [
    expensesResult,
    energyResult,
    serviceResult,
    remindersResult,
    documentsResult,
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false }),
    supabase
      .from("energy_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false }),
    supabase
      .from("service_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false }),
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false }),
  ]);

  throwFirstError(
    expensesResult.error?.message,
    energyResult.error?.message,
    serviceResult.error?.message,
    remindersResult.error?.message,
    documentsResult.error?.message,
  );

  const [vehicle] = await signVehiclePhotos([vehicleResult.data as Vehicle], supabase);
  const data = {
    profile: null,
    vehicles: [vehicle],
    expenses: (expensesResult.data ?? []) as Expense[],
    energyEntries: (energyResult.data ?? []) as EnergyEntry[],
    serviceEntries: (serviceResult.data ?? []) as ServiceEntry[],
    reminders: (remindersResult.data ?? []) as Reminder[],
    documents: (documentsResult.data ?? []) as VehicleDocument[],
  } satisfies GarageData;

  return { vehicle, data };
}

export async function loadVehicleFormContext(vehicleId?: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { profile: null, vehicle: null };
  }

  const { supabase, userId } = context;
  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (!vehicleId) {
    return { profile: (profileResult.data ?? null) as Profile | null, vehicle: null };
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

  const [vehicle] = await signVehiclePhotos(
    vehicleResult.data ? [vehicleResult.data as Vehicle] : [],
    supabase,
  );

  return {
    profile: (profileResult.data ?? null) as Profile | null,
    vehicle: vehicle ?? null,
  };
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

function throwFirstError(...messages: Array<string | undefined>) {
  const message = messages.find(Boolean);

  if (message) {
    throw new Error(message);
  }
}

async function signVehiclePhotos(
  vehicles: Vehicle[],
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
) {
  return Promise.all(
    vehicles.map(async (vehicle) => {
      if (!vehicle.photo_url || /^https?:\/\//i.test(vehicle.photo_url)) {
        return vehicle;
      }

      const { data, error } = await supabase.storage
        .from("vehicle-photos")
        .createSignedUrl(vehicle.photo_url, 60 * 60);

      if (error || !data?.signedUrl) {
        return vehicle;
      }

      return { ...vehicle, photo_url: data.signedUrl };
    }),
  );
}
