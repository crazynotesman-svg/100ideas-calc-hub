/**
 * Deterministic, timezone-free date helpers.
 * Everything is reduced to an integer "day number" (days since 1970-01-01 UTC) so that
 * results are identical on the server and in the browser — a hard requirement for CLS = 0
 * and for hydration-safe rendering.
 */

export type ISODate = string; // yyyy-mm-dd

export const MS_PER_DAY = 86_400_000;

export function toDayNumber(input: ISODate | Date): number {
  if (input instanceof Date) {
    return Math.floor(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()) / MS_PER_DAY);
  }
  const [y, m, d] = input.split('-').map(Number);
  return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / MS_PER_DAY);
}

export function fromDayNumber(day: number): ISODate {
  const date = new Date(day * MS_PER_DAY);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: ISODate, days: number): ISODate {
  return fromDayNumber(toDayNumber(date) + days);
}

/** Inclusive difference: 2026-01-01 -> 2026-01-01 equals 1 day of presence. */
export function inclusiveDays(from: ISODate, to: ISODate): number {
  return toDayNumber(to) - toDayNumber(from) + 1;
}

export function isValidISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Today in UTC as yyyy-mm-dd. */
export function todayISO(): ISODate {
  return fromDayNumber(Math.floor(Date.now() / MS_PER_DAY));
}
