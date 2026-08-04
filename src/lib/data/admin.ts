import "server-only";

import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

export interface AdminOverviewMetric {
  key: string;
  label: string;
  value: number | null;
  description: string;
}

export interface AdminOverview {
  hasAdminDataSource: boolean;
  metrics: AdminOverviewMetric[];
  errors: string[];
}

const tableMetrics = [
  { key: "profiles", label: "Registrovaní uživatelé", description: "Počet profilů v aplikaci" },
  { key: "vehicles", label: "Vozidla", description: "Všechna evidovaná vozidla" },
  { key: "expenses", label: "Výdaje", description: "Záznamy ostatních výdajů" },
  { key: "energy_entries", label: "Palivo a energie", description: "Tankování, nabíjení, LPG a CNG" },
  { key: "service_entries", label: "Servis", description: "Servisní a údržbové záznamy" },
  { key: "reminders", label: "Připomínky", description: "Servisní, kilometrové a datumové připomínky" },
  { key: "documents", label: "Dokumenty", description: "Evidované doklady a soubory" },
] as const;

export async function loadAdminOverview(): Promise<AdminOverview> {
  if (!hasSupabaseAdminConfig()) {
    return {
      hasAdminDataSource: false,
      metrics: tableMetrics.map((metric) => ({
        ...metric,
        value: null,
      })),
      errors: ["Chybí serverová proměnná SUPABASE_SECRET_KEY nebo SUPABASE_SERVICE_ROLE_KEY."],
    };
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      hasAdminDataSource: false,
      metrics: tableMetrics.map((metric) => ({
        ...metric,
        value: null,
      })),
      errors: ["Admin Supabase klient není nakonfigurovaný."],
    };
  }

  const results = await Promise.all(
    tableMetrics.map(async (metric) => {
      const { count, error } = await supabase
        .from(metric.key)
        .select("id", { count: "exact", head: true });

      return {
        ...metric,
        value: count,
        error: error?.message,
      };
    }),
  );

  return {
    hasAdminDataSource: true,
    metrics: results.map(({ error, ...metric }) => metric),
    errors: results.map((result) => result.error).filter((error): error is string => Boolean(error)),
  };
}
