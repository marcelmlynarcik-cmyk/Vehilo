import "server-only";

import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

export interface AdminOverviewMetric {
  key: string;
  label: string;
  value: number | null;
  description: string;
}

export interface AdminChartDatum {
  name: string;
  value: number;
  details?: string[];
}

export interface AdminOverview {
  hasAdminDataSource: boolean;
  metrics: AdminOverviewMetric[];
  newUsersByDay: AdminChartDatum[];
  newUsersByMonth: AdminChartDatum[];
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
      newUsersByDay: [],
      newUsersByMonth: [],
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
      newUsersByDay: [],
      newUsersByMonth: [],
      errors: ["Admin Supabase klient není nakonfigurovaný."],
    };
  }

  const [metricResults, profilesResult] = await Promise.all([
    Promise.all(tableMetrics.map(async (metric) => {
      const { count, error } = await supabase
        .from(metric.key)
        .select("id", { count: "exact", head: true });

      return {
        ...metric,
        value: count,
        error: error?.message,
      };
    })),
    supabase
      .from("profiles")
      .select("id, created_at")
      .order("created_at", { ascending: true }),
  ]);

  return {
    hasAdminDataSource: true,
    metrics: metricResults.map(({ error, ...metric }) => metric),
    newUsersByDay: buildNewUsersByDaySeries(profilesResult.data ?? []),
    newUsersByMonth: buildNewUsersByMonthSeries(profilesResult.data ?? []),
    errors: [
      ...metricResults.map((result) => result.error),
      profilesResult.error?.message,
    ].filter((error): error is string => Boolean(error)),
  };
}

function buildNewUsersByMonthSeries(profiles: Array<{ id: string; created_at: string }>) {
  const months = buildRecentMonthKeys(12);
  const counts = new Map(months.map((month) => [month, 0]));

  for (const profile of profiles) {
    const month = profile.created_at.slice(0, 7);

    if (counts.has(month)) {
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
  }

  return months.map((month) => {
    const value = counts.get(month) ?? 0;

    return {
      name: formatMonthLabel(month),
      value,
      details: [`${formatFullMonthLabel(month)}: ${value.toLocaleString("cs-CZ")} nových uživatelů`],
    };
  });
}

function buildNewUsersByDaySeries(profiles: Array<{ id: string; created_at: string }>) {
  const days = buildRecentDayKeys(30);
  const counts = new Map(days.map((day) => [day, 0]));

  for (const profile of profiles) {
    const day = profile.created_at.slice(0, 10);

    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return days.map((day) => {
    const value = counts.get(day) ?? 0;

    return {
      name: formatDayLabel(day),
      value,
      details: [`${formatFullDayLabel(day)}: ${value.toLocaleString("cs-CZ")} nových uživatelů`],
    };
  });
}

function buildRecentDayKeys(dayCount: number) {
  const days: string[] = [];
  const today = new Date();

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    days.push(date.toISOString().slice(0, 10));
  }

  return days;
}

function buildRecentMonthKeys(monthCount: number) {
  const months: string[] = [];
  const today = new Date();

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1));
    months.push(date.toISOString().slice(0, 7));
  }

  return months;
}

function formatDayLabel(day: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00.000Z`));
}

function formatMonthLabel(month: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}

function formatFullMonthLabel(month: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}

function formatFullDayLabel(day: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00.000Z`));
}
