import { useState, useEffect, useCallback } from "react";
import type { Coin } from "../types/coin";

// ====== 获取 TOP 20 加密货币列表 ======
// 这个 Hook 封装了"从 CoinGecko 拿数据"的全部逻辑
// 调用方只需解构出 { coins, loading, error, refetch } 就能用

// CoinGecko 免费 API，无需 Key。参数拆解：
// vs_currency=usd         → 美元计价
// order=market_cap_desc   → 按市值从大到小排
// per_page=20             → 每页 20 条
// sparkline=false         → 不要迷你走势图（省流量）
const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

export function useCoins(): {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  refetch: () => void; // 手动刷新函数：调用后重新请求一次 API
} {
  // ——— 创建四个状态 ———
  const [coins, setCoins] = useState<Coin[]>([]); // 币种列表，初始空数组
  const [loading, setLoading] = useState(true); // 是否正在加载。初始 true：一挂载就发请求
  const [error, setError] = useState<string | null>(null); // 错误信息，初始 null 表示没出错
  const [trigger, setTrigger] = useState(0); // 刷新计数器：每次 +1 触发重新请求

  // ——— 手动刷新函数 ———
  // useCallback(fn, []) 让这个函数的引用永远不变
  // setTrigger(t => t + 1) 用函数式更新：不读外部闭包的 trigger，直接拿 React 给的最新值
  const refetch = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  // ——— useEffect：组件渲染到屏幕之后执行 ———
  // 依赖数组 [trigger]：trigger 变化 → 重新执行（等于重新发请求）
  useEffect(() => {
    // cancelled 标志位：防止组件卸载后还更新 state
    let cancelled = false;

    async function fetchCoins() {
      setLoading(true); // 开始加载
      setError(null); // 清除上一次的错误
      try {
        // 向 CoinGecko 发 GET 请求
        const res = await fetch(API_URL);
        // CoinGecko 限流时可能返回 200 + 一段 HTML
        // 不检查 res.ok 的话，res.json() 解析 HTML 会抛乱码错误
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Coin[] = await res.json();
        // 只有组件还挂在页面上，才更新 state
        if (!cancelled) setCoins(data);
      } catch (e) {
        // e 可能是 Error 对象，也可能是别的（比如 throw "字符串"）
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to fetch coins");
      } finally {
        // 不管成功还是失败，都结束加载状态
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoins();

    // cleanup 函数：React 在"下次 effect 执行前"或"组件卸载时"调用
    return () => {
      cancelled = true;
    };
  }, [trigger]);

  // 返回四个东西：数据、加载态、错误态、手动刷新
  return { coins, loading, error, refetch };
}
