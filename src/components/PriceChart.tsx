import ReactECharts from "echarts-for-react"; // ECharts 的 React 封装：把命令式 API 变成声明式组件
import { usePriceHistory } from "../hooks/usePriceHistory";

// ====== 7 天价格走势折线图 ======
// 接收 coinId → 调用 usePriceHistory → 渲染 ECharts 折线图
// 四种状态：还没选币种 / 加载中 / 出错了 / 正常渲染图表

interface Props {
  coinId: string | null; // null 表示用户还没点击任何币种
}

export default function PriceChart({ coinId }: Props) {
  // 调用自己的 Hook，传入 coinId，拿到三种状态
  const { history, loading, error } = usePriceHistory(coinId);

  // ——— 状态 1：还没选币种 ———
  // 因为 coinId 可能一开始就是 null（初始状态）
  if (!coinId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
        Click a coin in the table to view its price chart
      </div>
    );
  }

  // ——— 状态 2：数据加载中 ———
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">
        Loading chart...
      </div>
    );
  }

  // ——— 状态 3：请求出错 ———
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-red-400">
        Error: {error}
      </div>
    );
  }

  // ——— 状态 4：正常渲染图表 ———
  // option 是 ECharts 的配置对象，描述"我要什么样的图表"
  const option = {
    // 鼠标悬停时弹出的提示框
    tooltip: {
      trigger: "axis" as const, // 坐标轴触发：出现一条纵向指示线
      backgroundColor: "#1f2937", // 深色背景 = Tailwind gray-800
      borderColor: "#374151", // 边框 = gray-700
      textStyle: { color: "#e5e7eb" }, // 文字 = gray-200
    },
    // 图表内边距
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "5%",
      containLabel: true, // 坐标轴标签不会被裁切
    },
    // X 轴：时间
    xAxis: {
      type: "time" as const, // ECharts 自动解析时间戳，计算合适的刻度间隔
      axisLine: { lineStyle: { color: "#374151" } },
      axisLabel: {
        color: "#9ca3af", // gray-400
        formatter: (value: number) => {
          // 时间戳 → "月/日" 格式
          const d = new Date(value);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        },
      },
      splitLine: { show: false }, // 隐藏纵向网格线，视觉更干净
    },
    // Y 轴：美元价格
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#9ca3af",
        formatter: (value: number) => `$${value.toLocaleString()}`, // "$26,350"
      },
      splitLine: { lineStyle: { color: "#1f2937" } }, // 深色水平网格线
    },
    // 数据系列：折线
    series: [
      {
        // 把 PricePoint 转回 ECharts 需要的 [timestamp, price] 格式
        data: history.map((p) => [p.timestamp, p.price]),
        type: "line",
        smooth: true, // 平滑贝塞尔曲线（关闭是折线）
        symbol: "none", // 不显示数据点上的小圆点（几百个点太密）
        lineStyle: { color: "#3b82f6", width: 2 }, // 蓝线 = blue-500
        // 折线下方的渐变填充
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1, // 从上到下的渐变方向
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.25)" }, // 顶部：浅蓝
              { offset: 1, color: "rgba(59,130,246,0.01)" }, // 底部：几乎透明
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      {/* ReactECharts 内部：初始化 ECharts → 挂到 DOM → option 变化自动 setOption */}
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
}
