import type {
  EnergyEntry,
  Expense,
  GarageData,
  Reminder,
  Vehicle,
} from "@/types/domain";

export function formatCurrency(value: number, currency = "EUR", fractionDigits = 0) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

export function sumEnergyCost(entries: EnergyEntry[]) {
  return entries.reduce((total, entry) => total + Number(entry.total_price), 0);
}

export function sumServiceCost(entries: GarageData["serviceEntries"]) {
  return entries.reduce((total, entry) => total + Number(entry.total_cost), 0);
}

export function calculateRecordedCost(data: GarageData) {
  return sumExpenses(data.expenses) + sumEnergyCost(data.energyEntries) + sumServiceCost(data.serviceEntries);
}

export function calculatePureOwnershipCost(data: GarageData) {
  return calculateRecordedCost(data) + data.vehicles.reduce((total, vehicle) => total + calculateVehicleAcquisitionCost(vehicle), 0);
}

export function calculateOperatingCostPerKm(data: GarageData) {
  const mileage = totalDrivenMileage(data.vehicles);

  if (mileage === 0) {
    return 0;
  }

  return calculateRecordedCost(data) / mileage;
}

export function calculateDailyOperatingCost(data: GarageData, date = new Date()) {
  const total = calculateRecordedCost(data);
  const firstDate = firstCostDate(data);

  if (!firstDate) {
    return 0;
  }

  const days = Math.max(1, daysBetween(firstDate, formatDateKey(date)) + 1);

  return total / days;
}

export function totalMileage(vehicles: Vehicle[]) {
  return vehicles.reduce((total, vehicle) => total + Number(vehicle.current_mileage), 0);
}

export function drivenMileage(vehicle: Vehicle) {
  const currentMileage = Number(vehicle.current_mileage);
  const purchaseMileage = vehicle.purchase_mileage == null ? 0 : Number(vehicle.purchase_mileage);

  return Math.max(0, currentMileage - purchaseMileage);
}

export function totalDrivenMileage(vehicles: Vehicle[]) {
  return vehicles.reduce((total, vehicle) => total + drivenMileage(vehicle), 0);
}

export function calculateDepreciation(vehicle: Vehicle) {
  if (vehicle.purchase_price == null || vehicle.current_value == null) {
    return 0;
  }

  return Math.max(0, Number(vehicle.purchase_price) - Number(vehicle.current_value));
}

export function calculateTotalDepreciation(vehicles: Vehicle[]) {
  return vehicles.reduce((total, vehicle) => total + calculateDepreciation(vehicle), 0);
}

export function calculateVehicleCost(data: GarageData, vehicleId: string) {
  const expenses = data.expenses.filter((expense) => expense.vehicle_id === vehicleId);
  const energy = data.energyEntries.filter((entry) => entry.vehicle_id === vehicleId);
  const services = data.serviceEntries.filter((entry) => entry.vehicle_id === vehicleId);

  return sumExpenses(expenses) + sumEnergyCost(energy) + sumServiceCost(services);
}

export function calculateTotalOwnershipCost(data: GarageData) {
  return calculatePureOwnershipCost(data);
}

export function calculateCostPerKm(data: GarageData) {
  const mileage = totalDrivenMileage(data.vehicles);

  if (mileage === 0) {
    return 0;
  }

  return calculateTotalOwnershipCost(data) / mileage;
}

export function calculateAverageMonthlyCost(data: GarageData) {
  const total = calculateRecordedCost(data);
  const firstDate = firstCostDate(data);

  if (!firstDate) {
    return 0;
  }

  const months = Math.max(
    1,
    (Date.now() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  );

  return total / months;
}

export function buildMonthlyTotalCostSeries(data: GarageData) {
  const grouped = new Map<string, number>();

  for (const expense of data.expenses) {
    addMonthlyCost(grouped, expense.date, expense.amount);
  }

  for (const entry of data.energyEntries) {
    addMonthlyCost(grouped, entry.date, entry.total_price);
  }

  for (const entry of data.serviceEntries) {
    addMonthlyCost(grouped, entry.date, entry.total_cost);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      name: formatMonthLabel(month),
      value: roundMoney(value),
    }));
}

export function buildCumulativeTotalCostSeries(data: GarageData) {
  let cumulative = 0;

  return buildMonthlyTotalCostSeries(data).map((point) => {
    cumulative += point.value;

    return {
      name: point.name,
      value: roundMoney(cumulative),
    };
  });
}

export function buildCostCategorySeries(data: GarageData) {
  const grouped = new Map<string, number>();

  for (const expense of data.expenses) {
    addNamedCost(grouped, formatExpenseCategory(expense.category), expense.amount);
  }

  for (const entry of data.energyEntries) {
    addNamedCost(grouped, "Palivo a energie", entry.total_price);
  }

  for (const entry of data.serviceEntries) {
    addNamedCost(grouped, "Servis", entry.total_cost);
  }

  return mapNamedCosts(grouped);
}

export function buildCostTypeDistributionSeries(data: GarageData) {
  const grouped = new Map<string, number>();

  addNamedCost(grouped, "Výdaje", sumExpenses(data.expenses));
  addNamedCost(grouped, "Palivo a energie", sumEnergyCost(data.energyEntries));
  addNamedCost(grouped, "Servis", sumServiceCost(data.serviceEntries));

  return mapNamedCosts(grouped);
}

export function buildVehicleCostSeries(data: GarageData) {
  const grouped = new Map<string, number>();

  for (const vehicle of data.vehicles) {
    addNamedCost(grouped, vehicle.name, calculateVehicleCost(data, vehicle.id));
  }

  return mapNamedCosts(grouped);
}

export function buildVehicleCostPer100KmSeries(data: GarageData) {
  return data.vehicles
    .map((vehicle) => {
      const mileage = drivenMileage(vehicle);

      if (mileage <= 0) {
        return null;
      }

      return {
        name: vehicle.name,
        value: roundMoney((calculateVehicleCost(data, vehicle.id) / mileage) * 100),
      };
    })
    .filter((point): point is { name: string; value: number } => point !== null)
    .sort((a, b) => b.value - a.value);
}

export function buildVehicleDepreciationSeries(vehicles: Vehicle[]) {
  return vehicles
    .map((vehicle) => ({
      name: vehicle.name,
      value: roundMoney(calculateDepreciation(vehicle)),
    }))
    .filter((point) => point.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function buildPurchaseVsCurrentValueSeries(vehicles: Vehicle[]) {
  const purchaseValue = vehicles.reduce((total, vehicle) => total + Number(vehicle.purchase_price ?? 0), 0);
  const currentValue = vehicles.reduce((total, vehicle) => total + Number(vehicle.current_value ?? 0), 0);

  return [
    { name: "Pořizovací cena", value: roundMoney(purchaseValue) },
    { name: "Aktuální hodnota", value: roundMoney(currentValue) },
  ].filter((point) => point.value > 0);
}

export function buildServiceCostTrendSeries(data: GarageData) {
  const grouped = new Map<string, number>();

  for (const entry of data.serviceEntries) {
    addMonthlyCost(grouped, entry.date, entry.total_cost);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      name: formatMonthLabel(month),
      value: roundMoney(value),
    }));
}

export function findMostExpensiveMonth(data: GarageData) {
  return buildMonthlyTotalCostSeries(data).sort((a, b) => b.value - a.value)[0] ?? null;
}

export function findMostExpensiveCategory(data: GarageData) {
  return buildCostCategorySeries(data)[0] ?? null;
}

export function findMostExpensiveVehicle(data: GarageData) {
  return buildVehicleCostSeries(data)[0] ?? null;
}

export function buildMileageMonthSeries(data: GarageData) {
  const grouped = new Map<string, number>();

  for (const entry of mileageEntries(data)) {
    const month = entry.date.slice(0, 7);
    grouped.set(month, Math.max(grouped.get(month) ?? 0, entry.mileage));
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, mileage]) => ({
      name: formatMonthLabel(month),
      value: roundMoney(mileage),
    }));
}

export function buildAverageDailyMileageByYearSeries(data: GarageData) {
  const grouped = new Map<string, number[]>();

  for (const group of groupMileageEntriesByVehicle(data).values()) {
    const ordered = [...group].sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage);

    ordered.forEach((entry, index) => {
      const previous = ordered[index - 1];

      if (!previous) {
        return;
      }

      const days = daysBetween(previous.date, entry.date);
      const distance = entry.mileage - previous.mileage;

      if (days <= 0 || distance <= 0) {
        return;
      }

      const year = entry.date.slice(0, 4);
      grouped.set(year, [...(grouped.get(year) ?? []), distance / days]);
    });
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, values]) => ({
      name: year,
      value: roundMoney(values.reduce((total, value) => total + value, 0) / values.length),
    }));
}

export function calculateCurrentMonthCost(data: GarageData, date = new Date()) {
  const month = formatMonthKey(date);
  const expenses = data.expenses
    .filter((expense) => expense.date.slice(0, 7) === month)
    .reduce((total, expense) => total + Number(expense.amount), 0);
  const energy = data.energyEntries
    .filter((entry) => entry.date.slice(0, 7) === month)
    .reduce((total, entry) => total + Number(entry.total_price), 0);
  const services = data.serviceEntries
    .filter((entry) => entry.date.slice(0, 7) === month)
    .reduce((total, entry) => total + Number(entry.total_cost), 0);

  return expenses + energy + services;
}

function calculateVehicleAcquisitionCost(vehicle: Vehicle) {
  if (vehicle.purchase_price == null) {
    return 0;
  }

  if (vehicle.current_value != null) {
    return Math.max(0, Number(vehicle.purchase_price) - Number(vehicle.current_value));
  }

  return Number(vehicle.purchase_price);
}

function firstCostDate(data: GarageData) {
  return [
    ...data.expenses.map((item) => item.date),
    ...data.energyEntries.map((item) => item.date),
    ...data.serviceEntries.map((item) => item.date),
  ].sort()[0];
}

function addMonthlyCost(grouped: Map<string, number>, date: string, value: number) {
  const month = date.slice(0, 7);
  grouped.set(month, (grouped.get(month) ?? 0) + Number(value));
}

function addNamedCost(grouped: Map<string, number>, name: string, value: number) {
  const numericValue = Number(value);

  if (numericValue <= 0) {
    return;
  }

  grouped.set(name, (grouped.get(name) ?? 0) + numericValue);
}

function mapNamedCosts(grouped: Map<string, number>) {
  return [...grouped.entries()]
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value: roundMoney(value),
    }));
}

function mileageEntries(data: GarageData) {
  return [
    ...data.energyEntries.map((entry) => ({
      vehicleId: entry.vehicle_id,
      date: entry.date,
      mileage: Number(entry.mileage),
    })),
    ...data.serviceEntries.map((entry) => ({
      vehicleId: entry.vehicle_id,
      date: entry.date,
      mileage: Number(entry.mileage),
    })),
    ...data.expenses
      .filter((expense) => expense.mileage != null)
      .map((expense) => ({
        vehicleId: expense.vehicle_id,
        date: expense.date,
        mileage: Number(expense.mileage),
      })),
  ].filter((entry) => entry.mileage > 0);
}

function groupMileageEntriesByVehicle(data: GarageData) {
  const groups = new Map<string, ReturnType<typeof mileageEntries>>();

  for (const entry of mileageEntries(data)) {
    groups.set(entry.vehicleId, [...(groups.get(entry.vehicleId) ?? []), entry]);
  }

  return groups;
}

function formatExpenseCategory(category: string) {
  const labels: Record<string, string> = {
    insurance: "Pojištění",
    parking: "Parkování",
    toll: "Dálniční známky a mýto",
    washing: "Mytí",
    accessories: "Doplňky",
    tax: "Daně a poplatky",
    other: "Ostatní",
  };

  return labels[category] ?? category;
}

function formatMonthKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
  });

  return formatter.format(date);
}

function formatDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${monthNumber}.${year.slice(2)}`;
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((end - start) / millisecondsPerDay);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function countReminderStatus(reminders: Reminder[], status: Reminder["status"]) {
  return reminders.filter((reminder) => reminder.status === status).length;
}
