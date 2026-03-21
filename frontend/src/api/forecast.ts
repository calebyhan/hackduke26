import { apiClient } from "./client";
import type { ForecastResponse } from "../types/forecast";
import { fixtureForecast } from "../fixtures/forecast";

export async function fetchForecast(): Promise<ForecastResponse> {
  try {
    const { data } = await apiClient.get<ForecastResponse>("/api/forecast");
    return data;
  } catch {
    return fixtureForecast;
  }
}
