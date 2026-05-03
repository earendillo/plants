import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Plant } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns how many days until an action is due.
 * Negative = overdue by N days, 0 = due today, positive = days remaining.
 * If lastActionAt is null, treats the plant as maximally overdue.
 */
export function daysUntilDue(
  lastActionAt: string | null,
  intervalDays: number,
  today: Date
): number {
  if (!lastActionAt) return -intervalDays
  const last = new Date(lastActionAt)
  // Compare dates at UTC midnight to avoid timezone drift
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const lastMs = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())
  const daysSince = Math.floor((todayMs - lastMs) / 86_400_000)
  return intervalDays - daysSince
}

/** True if plant needs watering today or is overdue. */
export function isDueForWatering(plant: Plant, today: Date): boolean {
  return daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today) <= 0
}

/** True if plant needs feeding today or is overdue. */
export function isDueForFeeding(plant: Plant, today: Date): boolean {
  return daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today) <= 0
}
