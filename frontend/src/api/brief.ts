import { apiClient } from "./client";
import type { BriefResponse } from "../types/brief";
import type { OptimizeResponse, ScheduleEntry } from "../types/optimize";
import type { Appliance } from "../types/appliance";
import type { WeatherResponse } from "../types/forecast";
import { fixtureBrief } from "../fixtures/brief";

// Format a UTC ISO string as PDT (UTC-7) 12-hour time, e.g. "2:00 AM"
function formatPdt(iso: string): string {
  const d = new Date(iso);
  let h = d.getUTCHours() - 7;
  if (h < 0) h += 24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const min = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h12}:${min} ${ampm}`;
}

function getPeakTemp(weather: WeatherResponse | null | undefined): { peak_temp_f: number; peak_temp_hour: string } | null {
  if (!weather?.hourly?.length) return null;
  const peak = weather.hourly.reduce((best, h) => h.temperature_c > best.temperature_c ? h : best);
  const peak_temp_f = Math.round(peak.temperature_c * 9 / 5 + 32);
  // Format as "3 PM" style from UTC ISO string
  const d = new Date(peak.time);
  let h = d.getUTCHours() - 7; // PDT
  if (h < 0) h += 24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return { peak_temp_f, peak_temp_hour: `${h12} ${ampm}` };
}

export async function fetchBrief(
  optimizeResult: OptimizeResponse,
  appliances: Appliance[],
  baselineSchedule: ScheduleEntry[],
  weather?: WeatherResponse | null
): Promise<BriefResponse> {
  const applianceMap = new Map(appliances.map((a) => [a.id, a]));
  const baselineMap = new Map(baselineSchedule.map((s) => [s.appliance_id, s]));

  const schedule_changes = optimizeResult.schedule
    .filter((s) => applianceMap.has(s.appliance_id))
    .map((s) => {
      const appliance = applianceMap.get(s.appliance_id)!;
      const baseline = baselineMap.get(s.appliance_id);
      const energy_mwh = (appliance.power_kw * appliance.duration_minutes) / 60 / 1000;
      const baseline_moer = baseline?.avg_moer_lbs_per_mwh ?? s.avg_moer_lbs_per_mwh;
      const co2_saved_lbs = energy_mwh * (baseline_moer - s.avg_moer_lbs_per_mwh);
      const from_time = baseline ? formatPdt(baseline.start) : "baseline";
      const to_time = formatPdt(s.start);
      return {
        appliance_name: appliance.name,
        from_time,
        to_time,
        co2_saved_lbs: Math.max(0, co2_saved_lbs),
      };
    });

  const peakTemp = getPeakTemp(weather);
  const grid_trend = peakTemp
    ? `Afternoon grid stress driven by heat — peak outdoor temp ${peakTemp.peak_temp_f}°F at ${peakTemp.peak_temp_hour}`
    : "Afternoon peak correlated with heat-driven demand";

  try {
    const { data } = await apiClient.post<BriefResponse>("/api/brief", {
      region: optimizeResult.region,
      baseline_total_co2_lbs: optimizeResult.baseline.total_co2_lbs,
      optimized_total_co2_lbs: optimizeResult.optimized.total_co2_lbs,
      co2_percent_reduction: Math.abs(optimizeResult.delta.co2_percent),
      miles_equivalent: Math.round(
        Math.abs(optimizeResult.delta.co2_lbs) / 0.89
      ),
      dr_readiness: optimizeResult.dr_readiness,
      schedule_changes,
      grid_trend,
      ...(peakTemp ?? {}),
    });
    return data;
  } catch {
    return fixtureBrief;
  }
}
