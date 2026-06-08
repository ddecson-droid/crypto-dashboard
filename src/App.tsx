import { useState, useCallback } from "react";
import { useCoins } from "./hooks/useCoins";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import MarketPie from "./components/MarketPie";

// ====== 应用主控：组装所有组件 + 提升共享状态 ======
// 整个应用的数据流中心：
//   useCoins() 拿到数据 → 通过 props 分发给三个子组件
//   selectedCoinId 存在这里 → PriceTable 用它高亮，PriceChart 用它请求走势
// 这就是 React 官方文档说的 "Lifting State Up"（状态提升）

export default function App() {
  // —— 核心状态：当前选中的币种 ——
  // 放在 App 而不是 PriceTable 里，因为两个兄弟组件都需要它：
  // PriceTable → 高亮选中行    PriceChart → 决定展示哪个币的图表
  // 初始 null = 用户还没点击任何币种
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);

  // —— 获取数据 ——
  // useCoins() 只调一次，拿到的数据同时喂给 PriceTable 和 MarketPie
  const { coins, loading, error, refetch } = useCoins();

  // —— 刷新按钮逻辑 ——
  // 重新拉 TOP 20 数据 + 清空选中币种（图表回到"未选中"状态）
  // useCallback 让函数引用在 refetch 不变时保持稳定
  const handleRefresh = useCallback(() => {
    refetch();
    setSelectedCoinId(null);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ===== 顶栏 ===== */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        {/* 左侧：标题 */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">CryptoBoard</h1>
          <p className="text-sm text-gray-500">TOP 20 by Market Cap</p>
        </div>
        {/* 右侧：刷新按钮 */}
        {/* loading 时按钮灰色不可点，文字变成 "Refreshing..." */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* ===== 主内容区：两列网格 ===== */}
      {/* 手机端：单列（grid-cols-1）  桌面端：40% + 60% */}
      <main className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 p-4 max-w-7xl mx-auto">
        {/* ===== 左列：价格表格 ===== */}
        <section>
          <PriceTable
            coins={coins}
            loading={loading}
            error={error}
            selectedCoinId={selectedCoinId} // 用来高亮选中行
            onSelect={setSelectedCoinId} // 直接把 state setter 传下去当回调
          />
        </section>

        {/* ===== 右列：两个图表，纵向排列 ===== */}
        <section className="flex flex-col gap-4">
          {/* PriceChart：接收 selectedCoinId，变了就重新请求走势 */}
          <PriceChart coinId={selectedCoinId} />

          {/* MarketPie：不依赖选中态，永远显示 TOP 20 市值分布 */}
          <MarketPie coins={coins} loading={loading} error={error} />
        </section>
      </main>
    </div>
  );
}
