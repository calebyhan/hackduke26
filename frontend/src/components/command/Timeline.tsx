import { useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import type { ForecastResponse, WeatherResponse } from "../../types/forecast";
import type { ScheduleEntry } from "../../types/optimize";
import type { Appliance } from "../../types/appliance";
import { moerToColor } from "../../utils/colors";
import { getPstDayStartMs, pstDayFraction, durationToFraction } from "../../utils/time";
import type { ForecastPoint } from "../../types/forecast";

/**
 * PST minute-of-day (0–1439) for a given ISO timestamp.
 * Used for time-of-day matching against forecast points, ignoring date.
 */
function pstMinOfDay(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

/**
 * Average MOER for forecast points overlapping a window [startIso, startIso + durationMinutes).
 * Matches by PST time-of-day so fixture dates don't need to match forecast dates.
 */
function getWindowMoer(startIso: string, durationMinutes: number, points: ForecastPoint[]): number {
  if (!points.length) return 600;
  const startMin = pstMinOfDay(startIso);
  const endMin = startMin + durationMinutes;
  const overlapping = points.filter((p) => {
    const pMin = pstMinOfDay(p.start);
    return pMin >= startMin && pMin < endMin;
  });
  if (overlapping.length) {
    return overlapping.reduce((sum, p) => sum + p.moer_lbs_per_mwh, 0) / overlapping.length;
  }
  // Fallback: closest point by PST time-of-day
  let best = points[0];
  let bestDiff = Infinity;
  for (const p of points) {
    const diff = Math.abs(pstMinOfDay(p.start) - startMin);
    if (diff < bestDiff) { best = p; bestDiff = diff; }
  }
  return best.moer_lbs_per_mwh;
}

const CHIP_IDENTITY_COLORS: Record<string, string> = {
  ev: "#3b82f6",
  dishwasher: "#8b5cf6",
  washer: "#06b6d4",
  dryer: "#f97316",
  hvac: "#6b7280",
};
const EXTRA_COLORS = ["#ec4899", "#14b8a6", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#84cc16"];
function getIdentityColor(id: string): string {
  if (CHIP_IDENTITY_COLORS[id]) return CHIP_IDENTITY_COLORS[id];
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return EXTRA_COLORS[hash % EXTRA_COLORS.length];
}

interface TimelineProps {
  forecast: ForecastResponse;
  schedule: ScheduleEntry[];
  appliances: Appliance[];
  weather?: WeatherResponse | null;
}

const CHIP_H = 26;
const CHIP_GAP = 3;

function assignRows(
  schedule: ScheduleEntry[],
  applianceMap: Record<string, Appliance>
) {
  const entries = schedule
    .map((entry) => {
      const appliance = applianceMap[entry.appliance_id];
      if (!appliance) return null;
      const startMs = new Date(entry.start).getTime();
      const endMs = startMs + appliance.duration_minutes * 60_000;
      return { entry, appliance, startMs, endMs };
    })
    .filter(Boolean)
    .sort((a, b) => a!.startMs - b!.startMs) as {
      entry: ScheduleEntry;
      appliance: Appliance;
      startMs: number;
      endMs: number;
    }[];

  const rowEnds: number[] = [];
  return entries.map(({ entry, appliance, startMs, endMs }) => {
    let row = rowEnds.findIndex((end) => end <= startMs);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = endMs;
    return { entry, appliance, row };
  });
}

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export default function Timeline({
  forecast,
  schedule,
  appliances,
  weather,
}: TimelineProps) {
  // Single source of truth: UTC ms of PST midnight for today's PDT/PST day.
  // Anchored to current time so the timeline always shows "today" regardless
  // of when the forecast was fetched (fixture starts at UTC midnight = March 20 PDT).
  const pstDayStartMs = useMemo(
    () => getPstDayStartMs(new Date().toISOString()),
    []
  );

  // MOER gradient sampled at each PST hour (0–24) across the day.
  const gradient = useMemo(() => {
    const stops = Array.from({ length: 25 }, (_, h) => {
      const sample = new Date(pstDayStartMs + h * 3_600_000);
      const moer = getWindowMoer(sample.toISOString(), 60, forecast.points);
      return `${moerToColor(moer)} ${((h / 24) * 100).toFixed(2)}%`;
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [pstDayStartMs, forecast.points]);

  // Fixed PST hour ticks: 12 AM, 3 AM, … 9 PM
  const ticks = useMemo(() => {
    const labels = ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"];
    return labels.map((label, i) => ({ label, pct: (i * 3 / 24) * 100 }));
  }, []);

  // "Now" marker position relative to the PST day anchor.
  const nowPct = useMemo(
    () => pstDayFraction(new Date().toISOString(), pstDayStartMs) * 100,
    [pstDayStartMs]
  );

  // Temperature overlay — only points within the current PST day.
  const tempPath = useMemo(() => {
    if (!weather?.hourly?.length) return null;
    const BAR_H = 48;
    const pts = weather.hourly
      .map((h) => ({ x: pstDayFraction(h.time, pstDayStartMs), temp: h.temperature_c }))
      .filter((p) => p.x >= 0 && p.x <= 1);

    if (pts.length < 2) return null;

    const temps = pts.map((p) => p.temp);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = maxT - minT || 1;
    const toY = (t: number) => BAR_H - 4 - ((t - minT) / range) * (BAR_H - 8);
    const points = pts.map((p) => `${(p.x * 100).toFixed(2)},${toY(p.temp).toFixed(1)}`).join(" ");

    return { points, minF: cToF(minT), maxF: cToF(maxT) };
  }, [weather, pstDayStartMs]);

  const applianceMap = useMemo(
    () => Object.fromEntries(appliances.map((a) => [a.id, a])),
    [appliances]
  );

  const rowedSchedule = useMemo(
    () => assignRows(schedule, applianceMap),
    [schedule, applianceMap]
  );

  const numRows = Math.max(1, ...rowedSchedule.map(({ row }) => row + 1));
  const chipsHeight = numRows * CHIP_H + (numRows - 1) * CHIP_GAP;

  return (
    <div className="bg-bg-card rounded-xl p-4 w-full">
      <div className="relative">
        {/* Current time vertical marker */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${nowPct}%`,
            top: 0,
            bottom: 28,
            width: 2,
            background: "rgba(255,255,255,0.75)",
            borderRadius: 1,
          }}
        />
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2"
          style={{ left: `${nowPct}%`, top: -18 }}
        >
          <span className="text-[9px] font-mono bg-white/20 text-white px-1 rounded leading-tight">NOW</span>
        </div>

        {/* MOER gradient bar */}
        <div
          className="h-12 rounded-lg w-full relative overflow-hidden"
          style={{ background: gradient }}
        >
          {tempPath && (
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 48"
              preserveAspectRatio="none"
            >
              <polyline
                points={tempPath.points}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="0.7"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          )}
          {tempPath && (
            <div className="absolute top-1 right-1.5">
              <span className="text-[9px] font-mono bg-black/50 text-white px-1 rounded leading-tight">
                {tempPath.minF}–{tempPath.maxF}°F
              </span>
            </div>
          )}
        </div>

        {/* Appliance chips — multi-row to avoid overlap */}
        <div className="relative mt-2" style={{ height: chipsHeight }}>
          {rowedSchedule.map(({ entry, appliance, row }) => {
            const frac = pstDayFraction(entry.start, pstDayStartMs);
            const left = frac * 100;
            const width = durationToFraction(appliance.duration_minutes) * 100;
            const top = row * (CHIP_H + CHIP_GAP);
            const accentColor = getIdentityColor(entry.appliance_id);

            // Chip is on the next PST day (fraction ≥ 1) — normalize to position within that day
            const isNextDay = frac >= 1;
            const normalizedLeft = isNextDay ? (frac % 1) * 100 : left;

            // Wrap-around only applies to today's chips that cross PST midnight (not next-day chips)
            const wrapsAtMidnight = !isNextDay && normalizedLeft + width > 100;
            const primaryWidth = Math.max(wrapsAtMidnight ? 100 - normalizedLeft : Math.min(width, 100 - normalizedLeft), 2);
            const wrapWidth = wrapsAtMidnight ? Math.max(normalizedLeft + width - 100, 2) : 0;

            // Chip gradient mirrors the bar at the chip's position
            const chipGradientStyle = (l: number, w: number) => ({
              backgroundImage: gradient,
              backgroundSize: `${(10000 / Math.max(w, 0.01)).toFixed(2)}% 100%`,
              backgroundPosition: `${(l * 100 / Math.max(100 - w, 0.01)).toFixed(2)}% 0`,
            });

            const baseStyle = {
              top,
              height: CHIP_H,
              opacity: appliance.shiftable ? 1 : 0.85,
            };

            const ChipLabel = ({ nextDay }: { nextDay: boolean }) => (
              <>
                <span className="truncate pl-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {appliance.name}
                </span>
                {nextDay && (
                  <span className="shrink-0 mx-1 text-[8px] bg-white/25 px-1 py-0.5 rounded font-mono leading-none">
                    +1
                  </span>
                )}
              </>
            );

            // Skip chips entirely before the PST day (frac < 0)
            if (frac < 0) return null;

            return (
              <Fragment key={entry.appliance_id}>
                {/* Primary segment */}
                <motion.div
                  layoutId={entry.appliance_id}
                  className="absolute flex items-center rounded-md text-xs font-medium text-white cursor-default overflow-hidden"
                  style={{
                    left: `${Math.min(normalizedLeft, 99)}%`,
                    width: `${primaryWidth}%`,
                    borderLeft: `3px solid ${accentColor}`,
                    outline: `1px solid rgba(255,255,255,0.15)`,
                    ...chipGradientStyle(Math.min(normalizedLeft, 99), primaryWidth),
                    ...baseStyle,
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <ChipLabel nextDay={isNextDay} />
                </motion.div>

                {/* Wrap-around segment (past PST midnight) */}
                {wrapsAtMidnight && (
                  <motion.div
                    layoutId={`${entry.appliance_id}-wrap`}
                    className="absolute flex items-center rounded-md text-xs font-medium text-white cursor-default overflow-hidden"
                    style={{
                      left: "0%",
                      width: `${wrapWidth}%`,
                      borderLeft: `3px dashed ${accentColor}`,
                      outline: `1px solid rgba(255,255,255,0.15)`,
                      ...chipGradientStyle(0, wrapWidth),
                      ...baseStyle,
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  >
                    <ChipLabel nextDay={true} />
                  </motion.div>
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Time ticks — PST hours */}
        <div className="relative h-5 mt-1">
          {ticks.map(({ label, pct }, i) => (
            <span
              key={label}
              className={`absolute text-[10px] text-text-muted ${
                i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
              }`}
              style={{ left: `${pct}%` }}
            >
              {label}
            </span>
          ))}
          <span className="absolute right-0 text-[10px] font-mono font-semibold text-text-muted bg-white/10 px-1 rounded">PT</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald inline-block" /> Clean
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber inline-block" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-crimson inline-block" /> Dirty
        </span>
      </div>
    </div>
  );
}
