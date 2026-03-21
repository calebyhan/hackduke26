export function formatHour(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
  });
}

export function formatHourShort(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "America/Los_Angeles",
  });
}

export function isoToDate(iso: string): Date {
  return new Date(iso);
}

/**
 * Get the fractional position (0-1) of an ISO timestamp within a 24h window.
 */
export function timeToFraction(iso: string, dayStart: string): number {
  const t = new Date(iso).getTime();
  const start = new Date(dayStart).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.min(1, (t - start) / dayMs));
}

/**
 * Get the fractional position (0-1) based purely on UTC time-of-day (ignores date).
 * 00:00 UTC = 0, 12:00 UTC = 0.5, 23:59 UTC ≈ 1
 */
export function utcTimeOfDayFraction(iso: string): number {
  const d = new Date(iso);
  return (d.getUTCHours() * 60 + d.getUTCMinutes()) / (24 * 60);
}

/**
 * Get the fractional position (0-1) based on local (browser) time-of-day.
 * local midnight = 0, local noon = 0.5, local 23:59 ≈ 1
 */
export function localTimeOfDayFraction(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() * 60 + d.getMinutes()) / (24 * 60);
}

/**
 * Get duration fraction (0-1) for a given number of minutes within 24h.
 */
export function durationToFraction(minutes: number): number {
  return minutes / (24 * 60);
}
