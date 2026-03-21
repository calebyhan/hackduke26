import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ForecastResponse, WeatherResponse } from "../../types/forecast";
import type { ScheduleEntry } from "../../types/optimize";
import type { Appliance } from "../../types/appliance";
import { moerToColor } from "../../utils/colors";
import { formatHourShort, timeToFraction, durationToFraction } from "../../utils/time";

interface TimelineProps {
  forecast: ForecastResponse;
  schedule: ScheduleEntry[];
  appliances: Appliance[];
  weather?: WeatherResponse | null;
}

const CHIP_COLORS: Record<string, string> = {
  ev: "#3b82f6",
  dishwasher: "#8b5cf6",
  washer: "#06b6d4",
  dryer: "#f97316",
  hvac: "#6b7280",
};

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

  // Time tick labels every 3 hours
  const ticks = useMemo(() => {
    const result: { label: string; pct: number }[] = [];
    for (let i = 0; i < forecast.points.length; i += 36) {
      // 36 * 5min = 3 hours
      result.push({
        label: formatHourShort(forecast.points[i].start),
        pct: (i / forecast.points.length) * 100,
      });
    }
    return result;
  }, [forecast.points]);

  // Build SVG polyline points for temperature overlay (top 48px = h-12 bar)
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

    // Map temp to y: hot = top (y=4), cold = bottom (y=BAR_H-4)
    const toY = (t: number) =>
      BAR_H - 4 - ((t - minT) / range) * (BAR_H - 8);

    const points = pts.map((p) => `${(p.x * 100).toFixed(2)},${toY(p.temp).toFixed(1)}`).join(" ");
    const minTemp = Math.round(minT);
    const maxTemp = Math.round(maxT);

    return { points, minTemp, maxTemp };
  }, [weather, dayStart]);

  const applianceMap = useMemo(
    () => Object.fromEntries(appliances.map((a) => [a.id, a])),
    [appliances]
  );

  return (
    <div className="bg-bg-card rounded-xl p-4 w-full">
      {/* Gradient bar */}
      <div className="relative">
        <div
          className="h-12 rounded-lg w-full relative"
          style={{ background: gradient }}
        >
          {tempPath && (
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 100 48"
              preserveAspectRatio="none"
            >
              <polyline
                points={tempPath.points}
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          )}
          {tempPath && (
            <div className="absolute top-0.5 right-1.5 flex flex-col items-end gap-0 leading-tight">
              <span className="text-[9px] text-white/70">{tempPath.maxTemp}°C</span>
              <span className="text-[9px] text-white/40">{tempPath.minTemp}°C</span>
            </div>
          )}
        </div>

        {/* Appliance chips */}
        <div className="relative h-10 mt-1">
          {schedule.map((entry) => {
            const appliance = applianceMap[entry.appliance_id];
            if (!appliance) return null;

            const left = timeToFraction(entry.start, dayStart) * 100;
            const width =
              durationToFraction(appliance.duration_minutes) * 100;

            return (
              <motion.div
                key={entry.appliance_id}
                layoutId={entry.appliance_id}
                className="absolute top-0 h-8 rounded-md flex items-center px-2 text-xs font-medium text-white truncate cursor-default"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 3)}%`,
                  backgroundColor: CHIP_COLORS[entry.appliance_id] ?? "#6b7280",
                  opacity: appliance.shiftable ? 1 : 0.6,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {appliance.name}
              </motion.div>
            );
          })}
        </div>

        {/* Time ticks */}
        <div className="relative h-5 mt-1">
          {ticks.map(({ label, pct }) => (
            <span
              key={label}
              className="absolute text-[10px] text-text-muted -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {label}
            </span>
          ))}
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
