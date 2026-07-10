import type { EnergyEntry } from "@/types/domain";

export function calculateConsumptionPer100Km(entries: EnergyEntry[]) {
  const ordered = [...entries].sort((a, b) => a.mileage - b.mileage);
  const validPairs = ordered
    .filter((entry) => entry.full_tank || entry.full_charge)
    .map((entry, index, list) => {
      const previous = list[index - 1];
      if (!previous) {
        return null;
      }

      const distance = entry.mileage - previous.mileage;
      if (distance <= 0) {
        return null;
      }

      return (Number(entry.quantity) / distance) * 100;
    })
    .filter((value): value is number => value !== null);

  if (validPairs.length === 0) {
    return 0;
  }

  return validPairs.reduce((total, value) => total + value, 0) / validPairs.length;
}

export function calculateCostPer100Km(entries: EnergyEntry[]) {
  const ordered = [...entries].sort((a, b) => a.mileage - b.mileage);
  const first = ordered[0];
  const last = ordered.at(-1);

  if (!first || !last || last.mileage <= first.mileage) {
    return 0;
  }

  const cost = ordered.reduce((total, entry) => total + Number(entry.total_price), 0);
  return (cost / (last.mileage - first.mileage)) * 100;
}
