import { apiClient } from "./client";
import type { BriefResponse } from "../types/brief";
import type { OptimizeResponse } from "../types/optimize";
import { fixtureBrief } from "../fixtures/brief";

export async function fetchBrief(
  optimizeResult: OptimizeResponse
): Promise<BriefResponse> {
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
      top_device_changes: optimizeResult.schedule
        .map(
          (s) =>
            `${s.appliance_id} scheduled ${s.start.slice(11, 16)}-${s.end.slice(11, 16)}`
        ),
      grid_trend: "Afternoon peak correlated with heat-driven demand",
    });
    return data;
  } catch {
    return fixtureBrief;
  }
}
