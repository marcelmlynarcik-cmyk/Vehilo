import type {
  EnergyEntry,
  Expense,
  GarageData,
  Reminder,
  Vehicle,
} from "@/types/domain";

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

export function sumEnergyCost(entries: EnergyEntry[]) {
  return entries.reduce((total, entry) => total + Number(entry.total_price), 0);
}

export function totalMileage(vehicles: Vehicle[]) {
  return vehicles.reduce((total, vehicle) => total + Number(vehicle.current_mileage), 0);
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
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);

  return (
    sumExpenses(expenses) +
    sumEnergyCost(energy) +
    services.reduce((total, entry) => total + Number(entry.total_cost), 0) +
    (vehicle ? calculateDepreciation(vehicle) : 0)
  );
}

export function calculateTotalOwnershipCost(data: GarageData) {
  return data.vehicles.reduce(
    (total, vehicle) => total + calculateVehicleCost(data, vehicle.id),
    0,
  );
}

export function calculateCostPerKm(data: GarageData) {
  const mileage = totalMileage(data.vehicles);

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

export function countReminderStatus(reminders: Reminder[], status: Reminder["status"]) {
  return reminders.filter((reminder) => reminder.status === status).length;
}
