import { useState, useEffect, useRef } from "react";
import type { ForecastResponse } from "../types/forecast";
import { fetchForecast } from "../api/forecast";
import { fixtureForecast } from "../fixtures/forecast";

export function useForecast(pollIntervalMs = 5 * 60 * 1000) {
  const [forecast, setForecast] = useState<ForecastResponse>(fixtureForecast);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await fetchForecast();
      if (!cancelled) {
        setForecast(data);
        setLoading(false);
      }
    }

    load();
    intervalRef.current = setInterval(load, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [pollIntervalMs]);

  return { forecast, loading };
}
