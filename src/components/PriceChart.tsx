import ReactECharts from "echarts-for-react";
import { usePriceHistory } from "../hooks/usePriceHistory";

interface Props {
  coinId: string | null;
}

export default function PriceChart({ coinId }: Props) {
  const { history, loading, error } = usePriceHistory(coinId);

  if (!coinId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
        Click a coin in the table to view its price chart
      </div>
    );
  }

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

  const option = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: { color: "#e5e7eb" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "time" as const,
      axisLine: { lineStyle: { color: "#374151" } },
      axisLabel: {
        color: "#9ca3af",
        formatter: (value: number) => {
          const d = new Date(value);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        },
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#9ca3af",
        formatter: (value: number) => `$${value.toLocaleString()}`,
      },
      splitLine: { lineStyle: { color: "#1f2937" } },
    },
    series: [
      {
        data: history.map((p) => [p.timestamp, p.price]),
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#3b82f6", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.25)" },
              { offset: 1, color: "rgba(59,130,246,0.01)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
}
