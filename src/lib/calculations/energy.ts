import type { EnergyEntry } from "@/types/domain";

export interface ConsumptionSummary {
  unit: EnergyEntry["quantity_unit"];
  value: number;
  segmentCount: number;
}

export interface ChartPoint {
  name: string;
  value: number;
  unit?: string;
  details?: string[];
}

export interface ConsumptionChartPoint extends ChartPoint {
  unit: EnergyEntry["quantity_unit"];
}

export function calculateConsumptionPer100Km(entries: EnergyEntry[]) {
  return calculateConsumptionSummaries(entries)[0]?.value ?? 0;
}

export function calculateConsumptionSummaries(entries: EnergyEntry[]): ConsumptionSummary[] {
  const segmentTotals = new Map<
    EnergyEntry["quantity_unit"],
    { quantity: number; distance: number; segmentCount: number }
  >();

  for (const group of groupEntriesForConsumption(entries).values()) {
    const orderedEntries = [...group].sort((a, b) => a.mileage - b.mileage || a.date.localeCompare(b.date));
    let previousFullEntry: EnergyEntry | null = null;
    let quantitySincePreviousFull = 0;

    orderedEntries.forEach((entry) => {
      const fullEntry = entry.full_tank || entry.full_charge;

      if (!previousFullEntry) {
        if (fullEntry) {
          previousFullEntry = entry;
          quantitySincePreviousFull = 0;
        }

        return;
      }

      const quantity = Number(entry.quantity);
      quantitySincePreviousFull += quantity > 0 ? quantity : 0;

      if (!fullEntry) {
        return;
      }

      const distance = Number(entry.mileage) - Number(previousFullEntry.mileage);

      if (distance <= 0 || quantitySincePreviousFull <= 0) {
        previousFullEntry = entry;
        quantitySincePreviousFull = 0;
        return;
      }

      const totals = segmentTotals.get(entry.quantity_unit) ?? {
        quantity: 0,
        distance: 0,
        segmentCount: 0,
      };

      totals.quantity += quantitySincePreviousFull;
      totals.distance += distance;
      totals.segmentCount += 1;
      segmentTotals.set(entry.quantity_unit, totals);

      previousFullEntry = entry;
      quantitySincePreviousFull = 0;
    });
  }

  return [...segmentTotals.entries()]
    .map(([unit, totals]) => ({
      unit,
      value: totals.distance > 0 ? (totals.quantity / totals.distance) * 100 : 0,
      segmentCount: totals.segmentCount,
    }))
    .filter((summary) => summary.segmentCount > 0)
    .sort((a, b) => unitSortOrder(a.unit) - unitSortOrder(b.unit));
}

export function calculateCostPer100Km(entries: EnergyEntry[]) {
  const vehicleGroups = groupEntriesByVehicle(entries);
  let totalCost = 0;
  let totalDistance = 0;

  for (const group of vehicleGroups.values()) {
    const ordered = [...group].sort((a, b) => a.mileage - b.mileage || a.date.localeCompare(b.date));
    const first = ordered[0];
    const last = ordered.at(-1);

    const firstMileage = Number(first?.mileage);
    const lastMileage = Number(last?.mileage);

    if (!first || !last || lastMileage <= firstMileage) {
      continue;
    }

    totalCost += ordered.reduce((total, entry) => total + Number(entry.total_price), 0);
    totalDistance += lastMileage - firstMileage;
  }

  if (totalDistance === 0) {
    return 0;
  }

  return (totalCost / totalDistance) * 100;
}

export function buildMonthlyEnergyCostSeries(entries: EnergyEntry[]): ChartPoint[] {
  return mapMonthlyGroups(entries, (group) => sumNumbers(group.map((entry) => entry.total_price)));
}

export function buildMonthlyCostPer100KmSeries(entries: EnergyEntry[]): ChartPoint[] {
  return mapMonthlyGroups(entries, (group) => {
    const ordered = [...group].sort((a, b) => a.mileage - b.mileage || a.date.localeCompare(b.date));
    const first = ordered[0];
    const last = ordered.at(-1);

    const firstMileage = Number(first?.mileage);
    const lastMileage = Number(last?.mileage);

    if (!first || !last || lastMileage <= firstMileage) {
      return null;
    }

    const cost = sumNumbers(ordered.map((entry) => entry.total_price));
    return (cost / (lastMileage - firstMileage)) * 100;
  });
}

export function buildMonthlyUnitPriceSeries(entries: EnergyEntry[]): ChartPoint[] {
  return mapMonthlyGroups(
    entries.filter((entry) => Number(entry.quantity) > 0 && entry.unit_price != null),
    (group) => weightedAverageUnitPrice(group),
  );
}

export function buildUnitPriceEntrySeries(entries: EnergyEntry[], currency: string): ChartPoint[] {
  const entriesByDate = new Map<string, number>();

  return entries
    .filter((entry) => Number(entry.quantity) > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage)
    .map((entry) => {
      const sameDateIndex = entriesByDate.get(entry.date) ?? 0;
      entriesByDate.set(entry.date, sameDateIndex + 1);

      const unitPrice = entry.unit_price ?? Number(entry.total_price) / Number(entry.quantity);
      const unit = `${currency}/${formatQuantityUnit(entry.quantity_unit)}`;
      const station = entry.fuel_station ?? entry.charging_location;
      const details = [
        `${formatDateLabel(entry.date)} · ${formatEnergyType(entry.entry_type)}`,
        `${formatQuantity(entry.quantity)} ${formatQuantityUnit(entry.quantity_unit)} · ${formatCurrencyValue(entry.total_price, currency)}`,
        station ? `Místo: ${station}` : null,
        `Nájezd: ${formatQuantity(entry.mileage)} km`,
      ].filter((detail): detail is string => detail != null);

      return {
        name: sameDateIndex === 0 ? formatDateLabel(entry.date) : `${formatDateLabel(entry.date)} #${sameDateIndex + 1}`,
        value: roundChartValue(unitPrice),
        unit,
        details,
      };
    });
}

export function buildConsumptionTrendSeries(entries: EnergyEntry[]): ConsumptionChartPoint[] {
  const points: ConsumptionChartPoint[] = [];

  for (const group of groupEntriesForConsumption(entries).values()) {
    const orderedEntries = [...group].sort((a, b) => a.mileage - b.mileage || a.date.localeCompare(b.date));
    let previousFullEntry: EnergyEntry | null = null;
    let quantitySincePreviousFull = 0;

    orderedEntries.forEach((entry) => {
      const fullEntry = entry.full_tank || entry.full_charge;

      if (!previousFullEntry) {
        if (fullEntry) {
          previousFullEntry = entry;
          quantitySincePreviousFull = 0;
        }

        return;
      }

      const quantity = Number(entry.quantity);
      quantitySincePreviousFull += quantity > 0 ? quantity : 0;

      if (!fullEntry) {
        return;
      }

      const distance = Number(entry.mileage) - Number(previousFullEntry.mileage);

      if (distance > 0 && quantitySincePreviousFull > 0) {
        points.push({
          name: formatMonthLabel(entry.date.slice(0, 7)),
          value: (quantitySincePreviousFull / distance) * 100,
          unit: entry.quantity_unit,
        });
      }

      previousFullEntry = entry;
      quantitySincePreviousFull = 0;
    });
  }

  return points.sort((a, b) => a.name.localeCompare(b.name));
}

function groupEntriesForConsumption(entries: EnergyEntry[]) {
  const groups = new Map<string, EnergyEntry[]>();

  entries.forEach((entry) => {
    const key = [
      entry.vehicle_id,
      entry.entry_type,
      entry.quantity_unit,
    ].join(":");

    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });

  return groups;
}

function groupEntriesByVehicle(entries: EnergyEntry[]) {
  const groups = new Map<string, EnergyEntry[]>();

  entries.forEach((entry) => {
    groups.set(entry.vehicle_id, [...(groups.get(entry.vehicle_id) ?? []), entry]);
  });

  return groups;
}

function mapMonthlyGroups(
  entries: EnergyEntry[],
  calculateValue: (group: EnergyEntry[]) => number | null,
): ChartPoint[] {
  const groups = new Map<string, EnergyEntry[]>();

  entries.forEach((entry) => {
    const month = entry.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), entry]);
  });

  return [...groups.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, group]) => {
      const value = calculateValue(group);

      if (value == null || !Number.isFinite(value)) {
        return null;
      }

      return {
        name: formatMonthLabel(month),
        value: roundChartValue(value),
      };
    })
    .filter((point): point is ChartPoint => point !== null);
}

function weightedAverageUnitPrice(entries: EnergyEntry[]) {
  const quantity = sumNumbers(entries.map((entry) => entry.quantity));
  const cost = sumNumbers(entries.map((entry) => entry.total_price));

  if (quantity <= 0) {
    return null;
  }

  return cost / quantity;
}

function sumNumbers(values: Array<number | string>): number {
  return values.reduce<number>((total, value) => total + Number(value), 0);
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${monthNumber}.${year.slice(2)}`;
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year.slice(2)}`;
}

function formatEnergyType(entryType: EnergyEntry["entry_type"]) {
  const labels: Record<EnergyEntry["entry_type"], string> = {
    charging: "Nabíjení",
    fuel: "Palivo",
    lpg: "LPG",
    cng: "CNG",
  };

  return labels[entryType];
}

function formatQuantityUnit(unit: EnergyEntry["quantity_unit"]) {
  const labels: Record<EnergyEntry["quantity_unit"], string> = {
    liters: "l",
    gallons: "gal",
    kWh: "kWh",
    kg: "kg",
  };

  return labels[unit];
}

function formatQuantity(value: number | string) {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(Number(value));
}

function formatCurrencyValue(value: number | string, currency: string) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function roundChartValue(value: number) {
  return Math.round(value * 100) / 100;
}

function unitSortOrder(unit: EnergyEntry["quantity_unit"]) {
  const order: Record<EnergyEntry["quantity_unit"], number> = {
    liters: 0,
    gallons: 1,
    kWh: 2,
    kg: 3,
  };

  return order[unit];
}
