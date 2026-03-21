import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

interface SignalIndexState {
  percentile: number | null; // 0–1, where 1 = dirtiest
  moer: number | null;       // approximate lbs CO2/MWh
  loading: boolean;
  error: boolean;
}

// Map WattTime percentile (0–1) to approximate CAISO lbs CO2/MWh
function percentileToMoer(p: number): number {
  return Math.round(300 + p * 650);
}

export function useSignalIndex(pollIntervalMs = 5 * 60 * 1000): SignalIndexState {
  const [state, setState] = useState<SignalIndexState>({
    percentile: null,
    moer: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await apiClient.get("/api/signal-index");
        // WattTime v3 format: { data: [{ value: 0.0–1.0 }] }
        const points: { value: number }[] = data?.data ?? [];
        const percentile = points[0]?.value ?? null;
        if (!cancelled) {
          setState({
            percentile,
            moer: percentile != null ? percentileToMoer(percentile) : null,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: true }));
        }
      }
    }

    load();
    const id = setInterval(load, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollIntervalMs]);

  return state;
}
