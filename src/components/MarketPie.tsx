import ReactECharts from "echarts-for-react";
import type { Coin } from "../types/coin";

// ====== 市值分布环形饼图 ======
// 接收全部 TOP 20 数据 → 前 10 名各有颜色切片 → 后 10 名合并成一个灰色 "Others"
// 不依赖选中态——永远显示完整分布

interface Props {
  coins: Coin[]; // 来自 useCoins 的 20 个币种
  loading: boolean;
  error: string | null;
}

// 固定 20 色色板：保证同一种币每次渲染颜色不变
const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  "#84cc16", "#e11d48", "#0ea5e9", "#d946ef", "#10b981",
  "#eab308", "#64748b", "#f43f5e", "#2dd4bf", "#a855f7",
];

export default function MarketPie({ coins, loading, error }: Props) {
  // ——— 状态 1：加载中 ———
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">
        Loading chart...
      </div>
    );
  }

  // ——— 状态 2：出错了 ———
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-red-400">
        Error: {error}
      </div>
    );
  }

  // ——— 状态 3：构建饼图数据 ———
  // 只显示前 10 名，避免饼图碎成渣
  const top10 = coins.slice(0, 10);
  // 后 10 名的市值全部累加起来
  const otherMarketCap = coins
    .slice(10)
    .reduce((sum, coin) => sum + coin.market_cap, 0);

  // 前 10 名各一个切片，分配固定颜色
  const pieData = top10.map((coin, i) => ({
    value: coin.market_cap,
    name: coin.name,
    itemStyle: { color: COLORS[i] },
  }));

  // 如果后 10 名有市值，追加一个灰色 "Others" 切片
  if (otherMarketCap > 0) {
    pieData.push({
      value: otherMarketCap,
      name: "Others",
      itemStyle: { color: "#374151" }, // gray-700，视觉上后退
    });
  }

  // ECharts 饼图配置
  const option = {
    // 悬浮提示：显示名称 + 百分比
    tooltip: {
      trigger: "item" as const, // 项触发：悬浮在切片上才弹出
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: { color: "#e5e7eb" },
      formatter: (params: { name: string; percent: number }) =>
        `${params.name}: ${params.percent.toFixed(1)}%`, // 如 "Bitcoin: 48.3%"
    },
    // 图例：放在右侧，纵向排列
    legend: {
      orient: "vertical" as const,
      right: "0%",
      top: "center",
      textStyle: { color: "#9ca3af", fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
    },
    // 环形中心的文字
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: "Market Cap",
        fill: "#9ca3af",
        fontSize: 14,
        fontWeight: "bold",
      },
    },
    // 饼图系列
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"], // 两个值 = 环形（第一个是内半径，第二个是外半径）
        center: ["40%", "50%"], // 中心偏左，给右侧图例留空间
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: "#111827", // 切片间分隔线 = gray-950
          borderWidth: 2,
        },
        label: { show: false }, // 不在切片上直接显示标签
        emphasis: { scaleSize: 8 }, // 鼠标悬停时切片放大量
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
