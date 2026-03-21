import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ForecastResponse, WeatherResponse } from "../../types/forecast";
import type { ScheduleEntry } from "../../types/optimize";
import type { Appliance } from "../../types/appliance";
import { moerToColor } from "../../utils/colors";
import { localTimeOfDayFraction, timeToFraction, durationToFraction } from "../../utils/time";

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
  const dayStart = forecast.points[0]?.start ?? "";

  const gradient = useMemo(() => {
    const stops = forecast.points.map((p, i) => {
      const pct = (i / forecast.points.length) * 100;
      return `${moerToColor(p.moer_lbs_per_mwh)} ${pct}%`;
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [forecast.points]);

  // Local-time ticks every 3 hours
  const ticks = useMemo(() => {
    const labels = ["12 AM","3 AM","6 AM","9 AM","12 PM","3 PM","6 PM","9 PM"];
    return labels.map((label, i) => ({ label, pct: (i * 3 / 24) * 100 }));
  }, []);

  // Current local time as % of day
  const nowPct = useMemo(() => {
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;
  }, []);

  const tempPath = useMemo(() => {
    if (!weather?.hourly?.length || !dayStart) return null;
    const BAR_H = 48;
    const pts = weather.hourly
      .map((h) => {
        const x = timeToFraction(h.time, dayStart);
        if (x < 0 || x > 1) return null;
        return { x, temp: h.temperature_c };
      })
      .filter(Boolean) as { x: number; temp: number }[];

    if (pts.length < 2) return null;

    const temps = pts.map((p) => p.temp);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = maxT - minT || 1;
    const toY = (t: number) => BAR_H - 4 - ((t - minT) / range) * (BAR_H - 8);
    const points = pts.map((p) => `${(p.x * 100).toFixed(2)},${toY(p.temp).toFixed(1)}`).join(" ");

    return { points, minF: cToF(minT), maxF: cToF(maxT) };
  }, [weather, dayStart]);

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
        {/* Current time vertical marker — spans bar + chips */}
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
        {/* "Now" label above the bar */}
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
            const left = localTimeOfDayFraction(entry.start) * 100;
            const width = durationToFraction(appliance.duration_minutes) * 100;
            const renderedWidth = Math.max(width, 2);
            const top = row * (CHIP_H + CHIP_GAP);
            const moerColor = moerToColor(entry.avg_moer_lbs_per_mwh);
            const accentColor = getIdentityColor(entry.appliance_id);

            return (
              <motion.div
                key={entry.appliance_id}
                layoutId={entry.appliance_id}
                className="absolute flex items-center rounded-md text-xs font-medium text-white cursor-default overflow-hidden"
                style={{
                  left: `${left}%`,
                  width: `${renderedWidth}%`,
                  top,
                  height: CHIP_H,
                  backgroundColor: moerColor,
                  opacity: appliance.shiftable ? 1 : 0.75,
                  borderLeft: `3px solid ${accentColor}`,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <span className="truncate pl-1.5 pr-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                  {appliance.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Time ticks */}
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
          <span className="absolute right-0 text-[10px] text-text-muted/50 italic">Local time</span>
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
