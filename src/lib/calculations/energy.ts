import type { EnergyEntry } from "@/types/domain";

export interface ConsumptionSummary {
  unit: EnergyEntry["quantity_unit"];
  value: number;
  segmentCount: number;
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

    if (!first || !last || last.mileage <= first.mileage) {
      continue;
    }

    totalCost += ordered.reduce((total, entry) => total + Number(entry.total_price), 0);
    totalDistance += last.mileage - first.mileage;
  }

  if (totalDistance === 0) {
    return 0;
  }

  return (totalCost / totalDistance) * 100;
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

function unitSortOrder(unit: EnergyEntry["quantity_unit"]) {
  const order: Record<EnergyEntry["quantity_unit"], number> = {
    liters: 0,
    gallons: 1,
    kWh: 2,
    kg: 3,
  };

  return order[unit];
}
