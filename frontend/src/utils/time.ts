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
 * Get duration fraction (0-1) for a given number of minutes within 24h.
 */
export function durationToFraction(minutes: number): number {
  return minutes / (24 * 60);
}

/**
 * Returns the PST/PDT offset in ms at the moment `d` (e.g., -7*3600000 for PDT).
 * Uses Intl.DateTimeFormat so it's browser-timezone-agnostic.
 */
function getPstOffsetMs(d: Date): number {
  const parts = (tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
  const toMin = (ps: Intl.DateTimeFormatPart[]) =>
    parseInt(ps.find((p) => p.type === "hour")?.value ?? "0") * 60 +
    parseInt(ps.find((p) => p.type === "minute")?.value ?? "0");
  let diff = toMin(parts("America/Los_Angeles")) - toMin(parts("UTC"));
  if (diff > 12 * 60) diff -= 24 * 60;
  if (diff < -12 * 60) diff += 24 * 60;
  return diff * 60_000;
}

/**
 * Returns the UTC epoch ms of PST/PDT midnight for the PST calendar date of `iso`.
 * This is the single anchor for the 24-hour PT timeline.
 *
 * Example: "2026-03-21T19:00:00Z" (PDT = UTC-7) → ms for 2026-03-21T07:00:00Z
 */
export function getPstDayStartMs(iso: string): number {
  const d = new Date(iso);
  const pstDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(d);
  // UTC ms of the calendar midnight (00:00 UTC) for the PST date
  const utcMidnightMs = new Date(`${pstDate}T00:00:00Z`).getTime();
  // Subtract offset (offset is negative for LA, so subtracting moves us later in UTC)
  return utcMidnightMs - getPstOffsetMs(d);
}

/**
 * Fractional position of `iso` within the 24h PST day anchored at `pstDayStartMs`.
 * 0 = PST midnight, 0.5 = PST noon, 1 = next PST midnight.
 * Values outside [0, 1] indicate adjacent days.
 */
export function pstDayFraction(iso: string, pstDayStartMs: number): number {
  return (new Date(iso).getTime() - pstDayStartMs) / (24 * 60 * 60 * 1000);
}
