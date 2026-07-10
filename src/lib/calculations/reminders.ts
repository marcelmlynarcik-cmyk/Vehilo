import type { Reminder } from "@/types/domain";

export function getRemainingDays(reminder: Reminder) {
  const dueDate = reminder.next_due_date ?? reminder.due_date;

  if (!dueDate) {
    return null;
  }

  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRemainingKilometers(reminder: Reminder, currentMileage: number) {
  if (reminder.next_due_mileage == null) {
    return null;
  }

  return reminder.next_due_mileage - currentMileage;
}

export function getMileageProgress(reminder: Reminder, currentMileage: number) {
  if (reminder.last_done_mileage == null || reminder.next_due_mileage == null) {
    return 0;
  }

  const total = reminder.next_due_mileage - reminder.last_done_mileage;
  const done = currentMileage - reminder.last_done_mileage;

  if (total <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, (done / total) * 100));
}
