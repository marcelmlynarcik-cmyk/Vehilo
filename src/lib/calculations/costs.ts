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

export function calculateVehicleCost(data: GarageData, vehicleId: string) {
  const expenses = data.expenses.filter((expense) => expense.vehicle_id === vehicleId);
  const energy = data.energyEntries.filter((entry) => entry.vehicle_id === vehicleId);
  const services = data.serviceEntries.filter((entry) => entry.vehicle_id === vehicleId);

  return sumExpenses(expenses) + sumEnergyCost(energy) + sumServiceCost(services);
}

export function calculateTotalOwnershipCost(data: GarageData) {
  return calculateRecordedCost(data);
}

export function calculateCostPerKm(data: GarageData) {
  const mileage = totalDrivenMileage(data.vehicles);

  if (mileage === 0) {
    return 0;
  }

  return calculateTotalOwnershipCost(data) / mileage;
}

export function calculateAverageMonthlyCost(data: GarageData) {
  const total = calculateTotalOwnershipCost(data);
  const firstDate = [
    ...data.expenses.map((item) => item.date),
    ...data.energyEntries.map((item) => item.date),
    ...data.serviceEntries.map((item) => item.date),
  ].sort()[0];

  if (!firstDate) {
    return 0;
  }

  const months = Math.max(
    1,
    (Date.now() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  );

  return total / months;
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

function formatMonthKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
  });

  return formatter.format(date);
}

export function countReminderStatus(reminders: Reminder[], status: Reminder["status"]) {
  return reminders.filter((reminder) => reminder.status === status).length;
}
