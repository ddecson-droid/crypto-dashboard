import { useState, useEffect } from "react";
import type { PricePoint } from "../types/coin";

const BASE_URL = "https://api.coingecko.com/api/v3/coins";

export function usePriceHistory(
  coinId: string | null
): {
  history: PricePoint[];
  loading: boolean;
  error: string | null;
} {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) {
      setHistory([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/${coinId}/market_chart?vs_currency=usd&days=7`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          // Transform [timestamp_ms, price] tuples into PricePoint[]
          const points: PricePoint[] = data.prices.map(
            ([timestamp, price]: [number, number]) => ({
              timestamp,
              price,
            })
          );
          setHistory(points);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [coinId]);

  return { history, loading, error };
}
