import { useState, useEffect } from "react";
import type { PricePoint } from "../types/coin";

// ====== 获取单个币种的近 7 天价格走势 ======
// 和 useCoins 的区别：
// 1. 需要传入 coinId 参数（null 表示还没选币种）
// 2. loading 初始值是 false（因为一开始不一定发请求）
// 3. 依赖数组是 [coinId]（用户换币种时重新请求）

const BASE_URL = "https://api.coingecko.com/api/v3/coins";

export function usePriceHistory(coinId: string | null): {
  history: PricePoint[];
  loading: boolean;
  error: string | null;
} {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false); // 注意：初始 false。因为 coinId 可能是 null，不一定会发请求
  const [error, setError] = useState<string | null>(null);

  // 依赖数组 [coinId]：coinId 变一次，执行一次
  useEffect(() => {
    // —— 门卫：如果 coinId 是 null（用户还没点任何币种），清空状态并直接返回 ——
    if (!coinId) {
      setHistory([]);
      setLoading(false);
      setError(null);
      return; // 不往下执行，不发请求
    }

    let cancelled = false; // 防内存泄漏标志位

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        // 拼接完整 URL，如 /coins/bitcoin/market_chart?vs_currency=usd&days=7
        const res = await fetch(
          `${BASE_URL}/${coinId}/market_chart?vs_currency=usd&days=7`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          // CoinGecko 返回的 prices 是 [timestamp, price] 元组数组
          // 如 [[1686009600000, 26350.5], [1686096000000, 26580.2], ...]
          // 把它 map 成 { timestamp, price } 对象数组，可读性更好
          const points: PricePoint[] = data.prices.map(
            ([timestamp, price]: [number, number]) => ({
              timestamp,
              price,
            })
          );
          setHistory(points);
        }
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Failed to fetch history"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    // cleanup：下次 effect 执行前或组件卸载时，把 cancelled 设为 true
    // 防止"用户快速切换币种，旧请求结果覆盖新请求结果"
    return () => {
      cancelled = true;
    };
  }, [coinId]);

  return { history, loading, error };
}
