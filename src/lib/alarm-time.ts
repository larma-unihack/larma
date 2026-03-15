/**
 * Alarm time utilities. Single source of truth: user's preferred time is
 * { hours, minutes, timezone }. nextAlarmTime (ISO string) is always derived
 * from that for cron/scheduling.
 */

export interface AlarmTimePreference {
  hours: number;
  minutes: number;
  timezone: string;
}

/**
 * Returns the next UTC moment when the clock in the given timezone shows
 * (hours, minutes). Uses Intl only; steps through 15-min intervals for 2 days.
 */
export function getNextAlarmISO(
  hours: number,
  minutes: number,
  timezone: string,
  after: Date = new Date()
): string {
  const stepMs = 15 * 60 * 1000;
  const maxSteps = (2 * 24 * 60) / 15; // 2 days in 15-min steps
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  let t = after.getTime();
  for (let i = 0; i < maxSteps; i++) {
    const date = new Date(t);
    const parts = formatter.formatToParts(date);
    const part = (k: string) => parts.find((p) => p.type === k)?.value ?? "0";
    const h = parseInt(part("hour"), 10);
    const m = parseInt(part("minute"), 10);
    if (h === hours && m === minutes) {
      return date.toISOString();
    }
    t += stepMs;
  }
  // fallback: 24h from after
  return new Date(after.getTime() + 24 * 60 * 60 * 1000).toISOString();
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
