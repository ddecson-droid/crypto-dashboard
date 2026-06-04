import ReactECharts from "echarts-for-react";
import type { Coin } from "../types/coin";

interface Props {
  coins: Coin[];
  loading: boolean;
  error: string | null;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  "#84cc16", "#e11d48", "#0ea5e9", "#d946ef", "#10b981",
  "#eab308", "#64748b", "#f43f5e", "#2dd4bf", "#a855f7",
];

export default function MarketPie({ coins, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">
        Loading chart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-red-400">
        Error: {error}
      </div>
    );
  }

  const top10 = coins.slice(0, 10);
  const otherMarketCap = coins
    .slice(10)
    .reduce((sum, coin) => sum + coin.market_cap, 0);

  const pieData = top10.map((coin, i) => ({
    value: coin.market_cap,
    name: coin.name,
    itemStyle: { color: COLORS[i] },
  }));

  if (otherMarketCap > 0) {
    pieData.push({
      value: otherMarketCap,
      name: "Others",
      itemStyle: { color: "#374151" },
    });
  }

  const option = {
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: { color: "#e5e7eb" },
      formatter: (params: { name: string; percent: number }) =>
        `${params.name}: ${params.percent.toFixed(1)}%`,
    },
    legend: {
      orient: "vertical" as const,
      right: "0%",
      top: "center",
      textStyle: { color: "#9ca3af", fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: "#111827",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          scaleSize: 8,
        },
        data: pieData,
      },
    ],
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
}
