/**
 * Schengen 90/180 rolling-window engine
 * 申根 90/180 天滑动窗口计算引擎
 *
 * Rule implemented (Regulation (EU) No 610/2013, Art. 5):
 *   A third-country national may stay a maximum of 90 days in ANY 180-day period.
 *   The 180-day window is a *rolling* window that is re-evaluated for every single day.
 *   Both the day of entry and the day of exit count as a full day of presence.
 *
 * Pure functions only — no React, no I/O, no Date-locale dependency.
 */

import {
  addDays,
  fromDayNumber,
  inclusiveDays,
  isValidISODate,
  toDayNumber,
  type ISODate
} from '../date-utils';

export const MAX_STAY_DAYS = 90;
export const WINDOW_DAYS = 180;

export interface Trip {
  id: string;
  entryDate: ISODate;
  exitDate: ISODate;
}

export type SchengenStatus = 'ok' | 'warning' | 'critical' | 'overstay';

export interface TripBreakdown {
  id: string;
  entryDate: ISODate;
  exitDate: ISODate;
  /** Full length of the trip, entry and exit day included. */
  totalDays: number;
  /** Portion of the trip that still counts inside the current 180-day window. */
  daysInWindow: number;
  valid: boolean;
  error?: 'invalid-date' | 'reversed-range';
}

export interface Violation {
  /** The day whose backwards-looking 180-day window exceeds 90 days. */
  date: ISODate;
  daysUsed: number;
  excess: number;
}

export interface TimelinePoint {
  date: ISODate;
  daysUsed: number;
  present: boolean;
}

export interface SchengenResult {
  referenceDate: ISODate;
  windowStart: ISODate;
  windowEnd: ISODate;
  /** Days of presence inside [windowStart, windowEnd]. */
  daysUsed: number;
  /** 90 - daysUsed, floored at 0. */
  daysRemaining: number;
  isOverstay: boolean;
  overstayDays: number;
  status: SchengenStatus;
  /** How many consecutive days you could stay if you entered on `nextEntryDate`. */
  maxConsecutiveDays: number;
  /** Earliest date on which a new entry is legal (null when the reference date itself is fine). */
  nextEntryDate: ISODate | null;
  /** Date on which the full 90-day allowance is available again, assuming no further stays. */
  fullResetDate: ISODate;
  tripBreakdown: TripBreakdown[];
  /** Any day (past or planned) where the rolling window is breached. */
  violations: Violation[];
  /** 180 data points ending on the reference date — feeds the visual timeline. */
  timeline: TimelinePoint[];
  totalTripsCounted: number;
}

interface NormalizedTrip extends TripBreakdown {
  startDay: number;
  endDay: number;
}

function normalize(trips: Trip[]): NormalizedTrip[] {
  return trips.map((trip) => {
    const validDates = isValidISODate(trip.entryDate) && isValidISODate(trip.exitDate);
    if (!validDates) {
      return {
        id: trip.id,
        entryDate: trip.entryDate,
        exitDate: trip.exitDate,
        totalDays: 0,
        daysInWindow: 0,
        valid: false,
        error: 'invalid-date' as const,
        startDay: 0,
        endDay: -1
      };
    }
    const startDay = toDayNumber(trip.entryDate);
    const endDay = toDayNumber(trip.exitDate);
    if (endDay < startDay) {
      return {
        id: trip.id,
        entryDate: trip.entryDate,
        exitDate: trip.exitDate,
        totalDays: 0,
        daysInWindow: 0,
        valid: false,
        error: 'reversed-range' as const,
        startDay,
        endDay
      };
    }
    return {
      id: trip.id,
      entryDate: trip.entryDate,
      exitDate: trip.exitDate,
      totalDays: inclusiveDays(trip.entryDate, trip.exitDate),
      daysInWindow: 0,
      valid: true,
      startDay,
      endDay
    };
  });
}

/** Set of day numbers where the traveller is present (overlapping trips are de-duplicated). */
function occupiedDays(trips: NormalizedTrip[]): Set<number> {
  const set = new Set<number>();
  for (const trip of trips) {
    if (!trip.valid) continue;
    for (let d = trip.startDay; d <= trip.endDay; d++) set.add(d);
  }
  return set;
}

function countInWindow(days: Set<number>, endDay: number): number {
  const startDay = endDay - (WINDOW_DAYS - 1);
  let count = 0;
  for (const day of days) {
    if (day >= startDay && day <= endDay) count++;
  }
  return count;
}

/**
 * Earliest day >= `fromDay` on which entering is legal, i.e. the historical presence inside
 * that day's 180-day window leaves at least one free day.
 * Bounded search: after 180 days every past stay has necessarily rolled out of the window.
 */
function findNextEntryDay(days: Set<number>, fromDay: number): number {
  for (let d = fromDay; d <= fromDay + WINDOW_DAYS + 1; d++) {
    const alreadyUsed = countInWindow(days, d);
    const usedExcludingToday = days.has(d) ? alreadyUsed - 1 : alreadyUsed;
    if (usedExcludingToday < MAX_STAY_DAYS) return d;
  }
  return fromDay + WINDOW_DAYS + 1;
}

/** How many consecutive days can be spent starting on `startDay` without breaching the rule. */
function maxConsecutiveFrom(days: Set<number>, startDay: number): number {
  const simulated = new Set(days);
  let streak = 0;
  for (let d = startDay; d < startDay + MAX_STAY_DAYS + WINDOW_DAYS; d++) {
    simulated.add(d);
    if (countInWindow(simulated, d) > MAX_STAY_DAYS) {
      simulated.delete(d);
      break;
    }
    streak++;
    if (streak >= MAX_STAY_DAYS) break;
  }
  return streak;
}

function statusFor(daysUsed: number, isOverstay: boolean): SchengenStatus {
  if (isOverstay) return 'overstay';
  if (daysUsed >= MAX_STAY_DAYS) return 'critical';
  if (daysUsed >= MAX_STAY_DAYS * 0.8) return 'warning';
  return 'ok';
}

export function calculateSchengen(trips: Trip[], referenceDate: ISODate): SchengenResult {
  const refDay = isValidISODate(referenceDate)
    ? toDayNumber(referenceDate)
    : toDayNumber(new Date());
  const normalized = normalize(trips);
  const days = occupiedDays(normalized);

  const windowStartDay = refDay - (WINDOW_DAYS - 1);
  const daysUsed = countInWindow(days, refDay);

  // Per-trip contribution to the active window.
  for (const trip of normalized) {
    if (!trip.valid) continue;
    const overlapStart = Math.max(trip.startDay, windowStartDay);
    const overlapEnd = Math.min(trip.endDay, refDay);
    trip.daysInWindow = overlapEnd >= overlapStart ? overlapEnd - overlapStart + 1 : 0;
  }

  // Rolling-window breach scan across every day of presence (covers planned/future trips too).
  const violations: Violation[] = [];
  const sortedDays = Array.from(days).sort((a, b) => a - b);
  for (const day of sortedDays) {
    const used = countInWindow(days, day);
    if (used > MAX_STAY_DAYS) {
      violations.push({
        date: fromDayNumber(day),
        daysUsed: used,
        excess: used - MAX_STAY_DAYS
      });
    }
  }

  const isOverstay = daysUsed > MAX_STAY_DAYS || violations.length > 0;
  const overstayDays = Math.max(0, daysUsed - MAX_STAY_DAYS);
  const daysRemaining = Math.max(0, MAX_STAY_DAYS - daysUsed);

  const nextEntryDay = findNextEntryDay(days, refDay);
  const nextEntryDate = nextEntryDay === refDay ? null : fromDayNumber(nextEntryDay);
  const maxConsecutiveDays = maxConsecutiveFrom(days, nextEntryDay);

  // Full allowance is restored 180 days after the last day of presence.
  const lastPresenceDay = sortedDays.length ? sortedDays[sortedDays.length - 1] : refDay;
  const fullResetDate = fromDayNumber(Math.max(lastPresenceDay, refDay) + WINDOW_DAYS);

  // Timeline: one point per day of the active window (fixed length => stable chart height).
  const timeline: TimelinePoint[] = [];
  for (let d = windowStartDay; d <= refDay; d++) {
    timeline.push({
      date: fromDayNumber(d),
      daysUsed: countInWindow(days, d),
      present: days.has(d)
    });
  }

  return {
    referenceDate: fromDayNumber(refDay),
    windowStart: fromDayNumber(windowStartDay),
    windowEnd: fromDayNumber(refDay),
    daysUsed,
    daysRemaining,
    isOverstay,
    overstayDays,
    status: statusFor(daysUsed, isOverstay),
    maxConsecutiveDays,
    nextEntryDate,
    fullResetDate,
    tripBreakdown: normalized.map(({ startDay: _s, endDay: _e, ...rest }) => rest),
    violations,
    timeline,
    totalTripsCounted: normalized.filter((t) => t.valid).length
  };
}

/** Convenience helper for the UI: the window label "12 Aug 2026 – 07 Feb 2026". */
export function windowRange(referenceDate: ISODate) {
  return {
    start: addDays(referenceDate, -(WINDOW_DAYS - 1)),
    end: referenceDate
  };
}
