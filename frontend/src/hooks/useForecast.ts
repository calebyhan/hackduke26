import { useState, useEffect, useRef, useCallback } from "react";
import type { ForecastResponse } from "../types/forecast";
import { apiClient } from "../api/client";
import { fixtureForecast } from "../fixtures/forecast";

async function loadForecast(): Promise<{ data: ForecastResponse; error: boolean }> {
  try {
    const { data } = await apiClient.get<ForecastResponse>("/api/forecast");
    return { data, error: false };
  } catch {
    return { data: fixtureForecast, error: true };
  }
}

export function useForecast(pollIntervalMs = 5 * 60 * 1000) {
  const [forecast, setForecast] = useState<ForecastResponse>(fixtureForecast);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await loadForecast();
    setForecast(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: err } = await loadForecast();
      if (!cancelled) {
        setForecast(data);
        setError(err);
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

  return { forecast, loading, error, refresh };
}
