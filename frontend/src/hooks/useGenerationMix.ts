import { useState, useEffect, useRef } from "react";
import type { GenerationMixResponse } from "../types/brief";
import { fetchGenerationMix } from "../api/generationMix";
import { fixtureGenerationMix } from "../fixtures/generationMix";

export function useGenerationMix(pollIntervalMs = 60 * 60 * 1000) {
  const [data, setData] = useState<GenerationMixResponse>(fixtureGenerationMix);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await fetchGenerationMix();
      if (!cancelled) {
        setData(result);
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

  return { data, loading };
}
