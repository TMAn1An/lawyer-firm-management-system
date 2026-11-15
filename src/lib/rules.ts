/**
 * Scheduling rules, kept free of any database/framework code so they are easy to test.
 * Dates are plain "YYYY-MM-DD" strings in Bangladesh time (Asia/Dhaka); slots are "HH:MM".
 */

export const TIME_ZONE = "Asia/Dhaka";

/** Hourly slots with a break at 13:00 for lunch and prayer: eight a day. */
export const SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"] as const;

/** Sunday = 0 … Saturday = 6. Bangladesh's weekend is Friday and Saturday. */
export const WORKING_DAYS = [0, 1, 2, 3, 4];

export const MAX_DAYS_AHEAD = 60;

export const STATUSES = ["SUBMITTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
export type RequestStatus = (typeof STATUSES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Today's date in Bangladesh, regardless of the server's own time zone. */
export function todayInDhaka(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isWorkingDay(date: string): boolean {
  return WORKING_DAYS.includes(new Date(`${date}T00:00:00Z`).getUTCDay());
}

export function isValidSlot(slot: string): boolean {
  return (SLOTS as readonly string[]).includes(slot);
}

export type ScheduleError =
  | "INVALID_DATE"
  | "PAST_DATE"
  | "TOO_FAR"
  | "NOT_WORKING_DAY"
  | "INVALID_SLOT";

export function validateSchedule(date: string, slot: string, today: string = todayInDhaka()): ScheduleError | null {
  if (!isValidDateString(date)) return "INVALID_DATE";
  if (date < today) return "PAST_DATE";
  if (date > addDays(today, MAX_DAYS_AHEAD)) return "TOO_FAR";
  if (!isWorkingDay(date)) return "NOT_WORKING_DAY";
  if (!isValidSlot(slot)) return "INVALID_SLOT";
  return null;
}

export type CapacityError = "SLOT_TAKEN" | "DAY_FULL";

/**
 * `taken` is the list of slots already confirmed for one volunteer on one day.
 * A volunteer cannot be double-booked and never gets more than `max` appointments a day.
 */
export function checkCapacity(taken: string[], slot: string, max: number): CapacityError | null {
  if (taken.includes(slot)) return "SLOT_TAKEN";
  if (taken.length >= max) return "DAY_FULL";
  return null;
}

export function freeSlots(taken: string[], max: number): string[] {
  if (taken.length >= max) return [];
  return SLOTS.filter((s) => !taken.includes(s));
}

/** Allowed status moves. Everything else is rejected so records cannot be silently rewound. */
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED", "CONFIRMED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function maxPerDay(): number {
  const n = Number(process.env.MAX_APPOINTMENTS_PER_VOLUNTEER_PER_DAY);
  return Number.isInteger(n) && n > 0 ? Math.min(n, SLOTS.length) : SLOTS.length;
}
