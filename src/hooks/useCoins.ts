import { useState, useEffect, useCallback } from "react";
import type { Coin } from "../types/coin";

const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

export function useCoins(): {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCoins() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Coin[] = await res.json();
        if (!cancelled) setCoins(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch coins");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoins();

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  return { coins, loading, error, refetch };
}
