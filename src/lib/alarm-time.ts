/**
 * Alarm time utilities. Single source of truth: user's preferred time is
 * { hours, minutes, timezone }. nextAlarmTime (ISO string) is always derived
 * from that for cron/scheduling.
 */

export const DEFAULT_SNOOZE_MINUTES = 5;
export const MIN_SNOOZE_MINUTES = 1;
export const MAX_SNOOZE_MINUTES = 60;

export interface AlarmTimePreference {
  hours: number;
  minutes: number;
  timezone: string;
}

type ZonedTimeParts = {
  hour: number;
  minute: number;
};

type ZonedDateParts = {
  year: string;
  month: string;
  day: string;
};

function getZonedTimeParts(date: Date, timezone: string): ZonedTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const part = (k: string) => parts.find((p) => p.type === k)?.value ?? "0";

  return {
    hour: parseInt(part("hour"), 10),
    minute: parseInt(part("minute"), 10),
  };
}

function getZonedDateParts(date: Date, timezone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const part = (k: string) => parts.find((p) => p.type === k)?.value ?? "00";

  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
  };
}

/**
 * Returns the next UTC moment when the clock in the given timezone shows
 * (hours, minutes). Uses Intl only; scans minute-by-minute for up to 2 days.
 */
export function getNextAlarmISO(
  hours: number,
  minutes: number,
  timezone: string,
  after: Date = new Date()
): string {
  const stepMs = 60 * 1000;
  const maxSteps = 2 * 24 * 60;
  let t = Math.floor(after.getTime() / stepMs) * stepMs + stepMs;
  for (let i = 0; i < maxSteps; i++) {
    const date = new Date(t);
    const zoned = getZonedTimeParts(date, timezone);
    if (zoned.hour === hours && zoned.minute === minutes) {
      return date.toISOString();
    }
    t += stepMs;
  }
  // fallback: 24h from after
  return new Date(after.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export function isCurrentAlarmMinute(
  hours: number,
  minutes: number,
  timezone: string,
  now: Date = new Date()
): boolean {
  const zoned = getZonedTimeParts(now, timezone);
  return zoned.hour === hours && zoned.minute === minutes;
}

export function getLocalDateKey(
  date: Date,
  timezone: string
): string {
  const parts = getZonedDateParts(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getNextDayAlarmISO(
  hours: number,
  minutes: number,
  timezone: string,
  after: Date = new Date()
): string {
  const stepMs = 60 * 1000;
  const maxSteps = 3 * 24 * 60;
  const currentDateKey = getLocalDateKey(after, timezone);
  let t = Math.floor(after.getTime() / stepMs) * stepMs + stepMs;
  let nextDateKey: string | null = null;

  for (let i = 0; i < maxSteps; i += 1) {
    const date = new Date(t);
    const dateKey = getLocalDateKey(date, timezone);
    if (dateKey !== currentDateKey) {
      nextDateKey = dateKey;
      break;
    }
    t += stepMs;
  }

  if (!nextDateKey) {
    return new Date(after.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  for (let i = 0; i < maxSteps; i += 1) {
    const date = new Date(t);
    const zoned = getZonedTimeParts(date, timezone);
    const dateKey = getLocalDateKey(date, timezone);
    if (dateKey === nextDateKey && zoned.hour === hours && zoned.minute === minutes) {
      return date.toISOString();
    }
    t += stepMs;
  }

  return new Date(after.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export function normalizeSnoozeMinutes(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_SNOOZE_MINUTES;
  }

  const rounded = Math.round(value);
  if (rounded < MIN_SNOOZE_MINUTES) return MIN_SNOOZE_MINUTES;
  if (rounded > MAX_SNOOZE_MINUTES) return MAX_SNOOZE_MINUTES;
  return rounded;
}

/**
 * Normalize user doc time field: may be { hours, minutes } with top-level timezone
 * or { hours, minutes, timezone }. Returns single shape { hours, minutes, timezone }.
 */
export function normalizeTime(
  time: unknown,
  fallbackTimezone: string
): AlarmTimePreference | null {
  if (!time || typeof time !== "object") return null;
  const o = time as Record<string, unknown>;
  const h = typeof o.hours === "number" ? o.hours : null;
  const m = typeof o.minutes === "number" ? o.minutes : null;
  if (h == null || m == null || h < 0 || h > 23 || m < 0 || m > 59) return null;
  const tz =
    (typeof o.timezone === "string" ? o.timezone : null) || fallbackTimezone;
  return { hours: h, minutes: m, timezone: tz };
}
