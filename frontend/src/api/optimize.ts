import { apiClient } from "./client";
import type { ForecastPoint } from "../types/forecast";
import type { Appliance } from "../types/appliance";
import type { OptimizeResponse } from "../types/optimize";

export async function fetchOptimize(
  region: string,
  points: ForecastPoint[],
  appliances: Appliance[]
): Promise<OptimizeResponse> {
  const { data } = await apiClient.post<OptimizeResponse>("/api/optimize", {
    region,
    points,
    appliances,
  });
  return data;
}
