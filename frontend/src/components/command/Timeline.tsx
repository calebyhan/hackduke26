import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ForecastResponse } from "../../types/forecast";
import type { ScheduleEntry } from "../../types/optimize";
import type { Appliance } from "../../types/appliance";
import { moerToColor } from "../../utils/colors";
import { formatHourShort, timeToFraction, durationToFraction } from "../../utils/time";

interface TimelineProps {
  forecast: ForecastResponse;
  schedule: ScheduleEntry[];
  appliances: Appliance[];
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

  const applianceMap = useMemo(
    () => Object.fromEntries(appliances.map((a) => [a.id, a])),
    [appliances]
  );

  return (
    <svg className="w-full h-32 overflow-visible" preserveAspectRatio="none">
      <path className="text-primary glow-emerald" d="M0,100 Q150,20 300,80 T600,40 T900,110 T1200,60 T1500,90" fill="none" stroke="currentColor" strokeWidth="2"></path>
      <path className="text-on-surface-variant/20" d="M0,105 Q150,25 300,85 T600,45 T900,115 T1200,65 T1500,95" fill="none" stroke="currentColor" strokeWidth="1"></path>
      {/* Time Markers */}
      <circle className="fill-primary" cx="0" cy="100" r="4"></circle>
      <circle className="fill-secondary glow-amber" cx="300" cy="80" r="4"></circle>
      <circle className="fill-tertiary glow-crimson" cx="900" cy="110" r="4"></circle>
    </svg>
  );
}
