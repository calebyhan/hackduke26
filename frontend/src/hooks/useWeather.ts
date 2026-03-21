import { useState, useEffect } from "react";
import type { WeatherResponse } from "../types/forecast";
import { fetchWeather } from "../api/weather";

// CAISO_NORTH centroid — San Francisco Bay Area
const CAISO_LAT = 37.77;
const CAISO_LON = -122.42;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    fetchWeather(CAISO_LAT, CAISO_LON).then(setWeather);
  }, []);

  return { weather };
}
