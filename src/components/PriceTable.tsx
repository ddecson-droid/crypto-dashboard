import { useState } from "react";
import type { Coin } from "../types/coin";

// ====== 加密货币价格表格 ======
// 功能：显示 TOP 20 列表、实时搜索筛选、点击某行通知父组件、高亮选中行
// 设计原则：这是一个"展示型组件"——它不自己发请求，数据全部从父组件通过 props 传入

// ——— Props 定义：这个组件接收哪些参数 ———
interface Props {
  coins: Coin[]; // 币种数据（来自 useCoins Hook）
  loading: boolean; // 是否在加载中
  error: string | null; // 错误信息（null 表示没出错）
  selectedCoinId: string | null; // 当前选中的币种 ID，用来高亮对应行
  onSelect: (coinId: string) => void; // 点击某行时调用的回调，把 coinId 传回给父组件
}

// ——— 市值格式化工具 ———
// 把 1270000000000 → "$1.27T"，让数字一眼看懂
// 1e12 = 1 万亿（Trillion）  1e9 = 10 亿（Billion）  1e6 = 100 万（Million）
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`; // 不到百万，加千分位逗号
}

export default function PriceTable({
  coins,
  loading,
  error,
  selectedCoinId,
  onSelect,
}: Props) {
  // 搜索框内容 state（受控组件——值由 React 管理，不是 DOM 自己管理）
  const [search, setSearch] = useState("");

  // ——— 状态 1：正在加载 ———
  // 提前返回：loading 为 true 时，后面的代码都不执行
  if (loading) {
    return <p className="text-center text-gray-400 py-8">Loading coins...</p>;
  }

  // ——— 状态 2：出错了 ———
  if (error) {
    return <p className="text-center text-red-400 py-8">Error: {error}</p>;
  }

  // ——— 状态 3：正常显示数据 ———
  // 客户端实时筛选——每次重渲染都执行一次 filter
  // toLowerCase() 保证搜索不区分大小写
  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* 搜索框——受控组件：value 绑定 React state，onChange 更新 React state */}
      <input
        type="text"
        placeholder="Search coins..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
      />

      {/* 表格容器：max-h 限制高度，超出出现垂直滚动条 */}
      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        <table className="w-full text-sm">
          {/* 表头 */}
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-2 pr-2 w-8">#</th>
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="py-2 pr-2 text-right">24h %</th>
              {/* 市值列在小屏幕上隐藏（md:table-cell） */}
              <th className="py-2 text-right hidden md:table-cell">Market Cap</th>
            </tr>
          </thead>

          {/* 表体——遍历 filtered 数组，每项生成一行 <tr> */}
          <tbody>
            {filtered.map((coin, index) => {
              // 这一行是否被选中（等于父组件传下来的 selectedCoinId）
              const isSelected = coin.id === selectedCoinId;
              // 24h 涨跌幅
              const change = coin.price_change_percentage_24h;

              return (
                <tr
                  key={coin.id} // React 列表必须的唯一 key：追踪哪行是新加的/被删的
                  onClick={() => onSelect(coin.id)} // 箭头函数：点击时才调，不是渲染时调
                  className={`border-b border-gray-800 cursor-pointer transition-colors hover:bg-gray-800 ${
                    // 选中行加蓝色半透明背景
                    isSelected ? "bg-blue-900/30 hover:bg-blue-900/40" : ""
                  }`}
                >
                  {/* 排名 */}
                  <td className="py-3 pr-2 text-gray-500">{index + 1}</td>

                  {/* 图标 + 名称 + 代码 */}
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{coin.name}</span>
                      <span className="text-gray-500 uppercase">{coin.symbol}</span>
                    </div>
                  </td>

                  {/* 美元价格：< 0.01 显示 6 位小数，否则加千分位逗号 */}
                  <td className="py-3 pr-2 text-right font-mono">
                    $
                    {coin.current_price < 0.01
                      ? coin.current_price.toFixed(6)
                      : coin.current_price.toLocaleString()}
                  </td>

                  {/* 24h 涨跌幅：涨是绿色，跌是红色 */}
                  <td
                    className={`py-3 pr-2 text-right font-mono ${
                      change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change?.toFixed(2)}%
                  </td>

                  {/* 市值：手机端隐藏，桌面端显示 */}
                  <td className="py-3 text-right text-gray-400 hidden md:table-cell font-mono">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 搜索无结果时的兜底提示 */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No coins found.</p>
        )}
      </div>
    </div>
  );
}
