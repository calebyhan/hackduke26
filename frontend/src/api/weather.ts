import { apiClient } from "./client";
import type { WeatherResponse } from "../types/forecast";

export async function fetchWeather(
  lat: number = 37.77,
  lon: number = -122.42
): Promise<WeatherResponse | null> {
  try {
    const { data } = await apiClient.get<WeatherResponse>("/api/weather", {
      params: { latitude: lat, longitude: lon },
    });
    return data;
  } catch {
    return null;
  }
}
