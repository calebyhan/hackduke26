import { useState, useEffect } from "react";
import { fetchMoerHistory } from "../api/moerHistory";
import type { MoerHistoryResponse } from "../api/moerHistory";

export function useMoerHistory(region = "CAISO_NORTH") {
  const [history, setHistory] = useState<MoerHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoerHistory(region).then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, [region]);

  return { history, loading };
}
