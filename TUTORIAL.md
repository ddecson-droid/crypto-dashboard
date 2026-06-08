# 加密货币数据看板 — 从零搭建全教程

> 目标：用 React + TypeScript + ECharts 搭建一个加密货币数据看板，部署到 Vercel。适合写在简历上，面试时演示。

---

## 目录

1. [准备工作](#1-准备工作)
2. [创建项目](#2-创建项目)
3. [安装依赖](#3-安装依赖)
4. [配置 Tailwind CSS](#4-配置-tailwind-css)
5. [定义 TypeScript 类型](#5-定义-typescript-类型)
6. [编写 useCoins Hook](#6-编写-usecoins-hook)
7. [编写 usePriceHistory Hook](#7-编写-usepricehistory-hook)
8. [编写 PriceTable 组件](#8-编写-pricetable-组件)
9. [编写 PriceChart 组件](#9-编写-pricechart-组件)
10. [编写 MarketPie 组件](#10-编写-marketpie-组件)
11. [组装 App.tsx](#11-组装-apptsx)
12. [本地验证](#12-本地验证)
13. [部署到 Vercel](#13-部署到-vercel)
14. [面试话术](#14-面试话术)

---

## 1. 准备工作

### 你需要安装的软件

| 软件 | 作用 | 下载地址 |
|------|------|----------|
| Node.js | JavaScript 运行环境 | https://nodejs.org (下载 LTS 版本) |
| VS Code | 代码编辑器 | https://code.visualstudio.com |
| Git | 版本管理 | https://git-scm.com |
| GitHub 账号 | 代码托管 | https://github.com (免费注册) |
| Vercel 账号 | 部署上线 | https://vercel.com (用 GitHub 账号登录) |

安装完成后，打开终端验证：

```bash
node -v    # 应该显示 v18 或更高
npm -v     # 应该显示 9 或更高
git -v     # 应该显示 2.30 或更高
```

---

## 2. 创建项目

打开终端，进入你想放项目的目录（比如桌面），执行：

```bash
cd ~/Desktop
npm create vite@latest crypto-dashboard -- --template react-ts
```

这条命令做了什么：
- `npm create vite@latest`：使用 Vite 脚手架工具
- `crypto-dashboard`：项目名称
- `-- --template react-ts`：使用 React + TypeScript 模板

出现提示时选 `y` 确认。创建完成后进入项目：

```bash
cd crypto-dashboard
npm install
```

现在你有了一个基础的 React + TypeScript 项目。看一下文件结构：

```
crypto-dashboard/
├── index.html            # HTML 入口
├── package.json          # 项目配置 + 依赖列表
├── vite.config.ts        # Vite 构建配置
├── tsconfig.json         # TypeScript 配置
├── src/
│   ├── main.tsx          # 应用入口
│   ├── App.tsx           # 根组件
│   ├── App.css           # 根组件样式（等会删）
│   ├── index.css         # 全局样式
│   └── assets/           # 静态资源
└── public/               # 公共资源
```

### 初始化 Git

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

---

## 3. 安装依赖

项目需要三个额外的库：

| 库 | 作用 |
|----|------|
| `echarts` | 图表库核心 |
| `echarts-for-react` | ECharts 的 React 封装，让 ECharts 以组件方式使用 |
| `tailwindcss` | CSS 工具类框架，写样式不用写 CSS 文件 |
| `postcss` + `autoprefixer` | Tailwind 的编译工具 |

```bash
npm install echarts echarts-for-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

最后一条命令生成了两个配置文件：
- `tailwind.config.js`：Tailwind 的配置
- `postcss.config.js`：PostCSS 的配置（Tailwind 需要 PostCSS 来编译）

提交：

```bash
git add -A
git commit -m "chore: install echarts and tailwindcss"
```

---

## 4. 配置 Tailwind CSS

### 4.1 修改 tailwind.config.js

打开 `tailwind.config.js`，把内容替换为：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**解释：** `content` 数组告诉 Tailwind "去这些文件里找 class 名"，它只把用到的 class 编译进最终 CSS。如果不配置，Tailwind 不会生成任何样式。

### 4.2 修改 src/index.css

打开 `src/index.css`，**全部删除**，替换为：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-white;
}
```

**解释：**
- `@tailwind base/components/utilities`：Tailwind 的三层指令，base 是全局重置，components 是组件样式，utilities 是工具类
- `@apply`：在 CSS 里使用 Tailwind 的工具类，这里设置页面背景为深色（`bg-gray-950`）、文字为白色

提交：

```bash
git add tailwind.config.js src/index.css
git commit -m "chore: configure Tailwind CSS"
```

---

## 5. 定义 TypeScript 类型

在 `src/` 下创建 `types/` 文件夹，新建 `coin.ts`：

```bash
mkdir -p src/types
```

### src/types/coin.ts

```typescript
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export interface PricePoint {
  timestamp: number; // Unix 毫秒时间戳
  price: number;
}
```

**解释：**
- `Coin`：描述 CoinGecko API 返回的一个币种数据。字段包括 id、名称、代码、图标 URL、当前价格、24h 涨跌幅、市值
- `PricePoint`：描述价格走势图上的一个数据点。CoinGecko 返回的是 `[时间戳, 价格]` 的元组数组，我们把它转成带名字的对象，代码可读性更好
- 所有类型都 export，其他文件 import 就能用

**为什么先写类型？** 类型是数据的基础。后面的 Hook 和组件都依赖这些类型，先定义好能保证整条数据链路类型安全，不会出现字段名拼错、类型用错的问题。

提交：

```bash
git add src/types/coin.ts
git commit -m "feat: add Coin and PricePoint type definitions"
```

---

## 6. 编写 useCoins Hook

在 `src/` 下创建 `hooks/` 文件夹，新建 `useCoins.ts`：

```bash
mkdir -p src/hooks
```

### src/hooks/useCoins.ts

```typescript
import { useState, useEffect } from "react";
import type { Coin } from "../types/coin";

// CoinGecko 免费 API：获取市值排名前 20 的币种
const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

export function useCoins(): {
  coins: Coin[];
  loading: boolean;
  error: string | null;
} {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;  // 关键：防止组件卸载后更新状态

    async function fetchCoins() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        // CoinGecko 限流时返回 200 但内容是错误 HTML，所以要检查 ok
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Coin[] = await res.json();
        if (!cancelled) setCoins(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch coins");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoins();

    // 清理函数：组件卸载时设置 cancelled = true，防止内存泄漏
    return () => {
      cancelled = true;
    };
  }, []); // 空依赖数组 = 只在组件挂载时执行一次

  return { coins, loading, error };
}
```

### 逐行解释

**1. API_URL**

```
https://api.coingecko.com/api/v3/coins/markets
  ?vs_currency=usd      ← 以美元计价
  &order=market_cap_desc ← 按市值从大到小
  &per_page=20          ← 取 20 条
  &page=1               ← 第 1 页
  &sparkline=false      ← 不需要迷你走势图数据
```

这是 CoinGecko 的公开接口，不需要 API Key，直接在浏览器里打开这个 URL 就能看到 JSON 数据。

**2. 返回值类型 `{ coins, loading, error }`**

这是一种"状态机"模式。任何一个消费这个 Hook 的组件，都能明确知道数据处于三种状态之一：
- `loading: true` → 正在请求中，显示加载提示
- `error: 不为 null` → 请求失败，显示错误信息
- `loading: false && error: null` → 请求成功，使用 coins 数据

**3. `cancelled` 标志位**

```typescript
let cancelled = false;
// ...异步操作后...
if (!cancelled) setCoins(data);
// 清理函数
return () => { cancelled = true; };
```

这是一个非常重要的 React 模式。场景：用户在页面加载时点击了"返回"，组件被卸载了，但 fetch 请求还在进行中。等请求返回时，组件已经不存在了，如果不检查 `cancelled`，`setCoins` 会尝试更新一个已卸载组件的状态——React 会在控制台报警告。`cancelled` 标志位就是为了在组件卸载后忽略请求结果。

**4. `if (!res.ok)` 检查**

CoinGecko 在限流时（免费 API 每分钟 30 次请求），不返回 429 状态码，而是返回 200 + 一段错误 HTML。如果不用 `res.ok` 检查，`res.json()` 在解析 HTML 时会抛出一个难以理解的错误。主动检查状态码能给出清晰的错误信息。

**5. 空依赖数组 `[]`**

useEffect 只在组件首次挂载时运行。TOP 20 列表不需要实时更新，一次获取就够。如果面试官问"怎么实现自动刷新"，你可以回答：把 `[]` 改成 `[refreshKey]`，再暴露一个 `refetch` 函数。

提交：

```bash
git add src/hooks/useCoins.ts
git commit -m "feat: add useCoins hook for TOP 20 market data"
```

---

## 7. 编写 usePriceHistory Hook

### src/hooks/usePriceHistory.ts

```typescript
import { useState, useEffect } from "react";
import type { PricePoint } from "../types/coin";

const BASE_URL = "https://api.coingecko.com/api/v3/coins";

export function usePriceHistory(
  coinId: string | null  // null 表示用户还没选择任何币种
): {
  history: PricePoint[];
  loading: boolean;
  error: string | null;
} {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果 coinId 是 null，重置状态，不发请求
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
          // 关键转换：把 [timestamp_ms, price] 元组转成 { timestamp, price } 对象
          const points: PricePoint[] = data.prices.map(
            ([timestamp, price]: [number, number]) => ({
              timestamp,
              price,
            })
          );
          setHistory(points);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch history");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [coinId]); // 依赖 coinId：coinId 变化时重新请求

  return { history, loading, error };
}
```

### 和 useCoins 的关键区别

| | useCoins | usePriceHistory |
|---|---|---|
| **参数** | 无 | `coinId: string \| null` |
| **依赖数组** | `[]`（只执行一次） | `[coinId]`（coinId 变化就重新请求） |
| **loading 初始值** | `true`（挂载就发请求） | `false`（可能还没选币种） |
| **空值处理** | 不需要 | 如果 coinId 是 null，直接返回不请求 |

### 元组转对象

CoinGecko 返回的数据格式是：

```json
{
  "prices": [
    [1686009600000, 26350.5],
    [1686096000000, 26580.2],
    ...
  ]
}
```

每个价格点是一个 `[时间戳, 价格]` 的数组。我们的代码把它转成：

```typescript
{ timestamp: 1686009600000, price: 26350.5 }
```

这样做的好处：
- 代码中访问 `point.price` 比 `point[1]` 可读性高
- 类型安全：TypeScript 知道 `price` 是 number
- 传递给 ECharts 时不用记住"第一项是时间，第二项是价格"

### 为什么 loading 初始值是 false？

因为组件挂载时可能还没有选中任何币种（coinId 为 null），此时不应该显示"加载中"。只有用户点击某个币种后，才设置 loading 为 true。

提交：

```bash
git add src/hooks/usePriceHistory.ts
git commit -m "feat: add usePriceHistory hook for 7-day chart data"
```

---

## 8. 编写 PriceTable 组件

### src/components/PriceTable.tsx

创建 `src/components/` 文件夹，新建 `PriceTable.tsx`：

```typescript
import { useState } from "react";
import type { Coin } from "../types/coin";

// Props：组件接收的数据和回调
interface Props {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  selectedCoinId: string | null;   // 当前选中的币种 id（用于高亮）
  onSelect: (coinId: string) => void; // 点击行时的回调
}

// 市值格式化工具：1234567890 → "$1.23B"
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;  // 万亿
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;    // 十亿
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;    // 百万
  return `$${value.toLocaleString()}`;
}

export default function PriceTable({
  coins,
  loading,
  error,
  selectedCoinId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState(""); // 搜索框内容

  // ----- 状态 1：加载中 -----
  if (loading) {
    return <p className="text-center text-gray-400 py-8">Loading coins...</p>;
  }

  // ----- 状态 2：出错 -----
  if (error) {
    return <p className="text-center text-red-400 py-8">Error: {error}</p>;
  }

  // ----- 状态 3：正常显示 -----
  // 客户端筛选：按名称搜索，大小写不敏感
  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* 搜索框 */}
      <input
        type="text"
        placeholder="Search coins..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
      />

      {/* 表格容器，可滚动 */}
      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        <table className="w-full text-sm">
          {/* 表头 */}
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-2 pr-2 w-8">#</th>
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="py-2 pr-2 text-right">24h %</th>
              <th className="py-2 text-right hidden md:table-cell">Market Cap</th>
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {filtered.map((coin, index) => {
              const isSelected = coin.id === selectedCoinId;
              const change = coin.price_change_percentage_24h;

              return (
                <tr
                  key={coin.id}
                  onClick={() => onSelect(coin.id)}
                  className={`border-b border-gray-800 cursor-pointer transition-colors hover:bg-gray-800 ${
                    isSelected ? "bg-blue-900/30 hover:bg-blue-900/40" : ""
                  }`}
                >
                  {/* 排名 */}
                  <td className="py-3 pr-2 text-gray-500">{index + 1}</td>

                  {/* 名称 + 图标 + 代码 */}
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{coin.name}</span>
                      <span className="text-gray-500 uppercase">
                        {coin.symbol}
                      </span>
                    </div>
                  </td>

                  {/* 价格：小于 $0.01 的显示 6 位小数 */}
                  <td className="py-3 pr-2 text-right font-mono">
                    $
                    {coin.current_price < 0.01
                      ? coin.current_price.toFixed(6)
                      : coin.current_price.toLocaleString()}
                  </td>

                  {/* 24h 涨跌幅：涨 = 绿色，跌 = 红色 */}
                  <td
                    className={`py-3 pr-2 text-right font-mono ${
                      change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change?.toFixed(2)}%
                  </td>

                  {/* 市值：移动端隐藏 */}
                  <td className="py-3 text-right text-gray-400 hidden md:table-cell font-mono">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 空结果提示 */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No coins found.</p>
        )}
      </div>
    </div>
  );
}
```

### 关键设计点

**1. 三种状态的处理顺序**

```typescript
if (loading) return <加载提示>;
if (error) return <错误提示>;
// 正常渲染...
```

先判断 loading，再判断 error，最后渲染数据。这个顺序很重要——如果反过来，loading 为 true 同时 error 也有值，用户会看到错误信息一闪而过。

**2. 受控组件**

搜索框的 `value={search}` 和 `onChange={(e) => setSearch(e.target.value)}` 是 React 的"受控组件"模式。输入框的值完全由 React state 控制，而不是 DOM 自己维护。好处是：每次按键都能触发 state 更新 → 组件重渲染 → filter 重新执行 → 表格即时过滤。

**3. 选中行高亮**

```typescript
const isSelected = coin.id === selectedCoinId;
className={`... ${isSelected ? "bg-blue-900/30" : ""}`}
```

`selectedCoinId` 是 App 传下来的 prop。点击时调用 `onSelect(coin.id)`，App 更新 selectedCoinId，PriceTable 重渲染，对应行获得蓝色背景。这就是"受控组件"模式在列表选择中的体现。

**4. formatMarketCap**

市值可能是几万亿（1.27T）、几千亿（212B）、几百万。`toLocaleString()` 在数字小的时候好用，但 1,270,000,000,000 读起来太费劲。`formatMarketCap` 根据数量级显示缩写。

**5. 响应式列**

`hidden md:table-cell` 表示：屏幕宽度小于 `md`（768px）时隐藏市值列。移动端屏幕窄，5 列装不下。

提交：

```bash
git add src/components/PriceTable.tsx
git commit -m "feat: add PriceTable with search filter and row selection"
```

---

## 9. 编写 PriceChart 组件

### src/components/PriceChart.tsx

```typescript
import ReactECharts from "echarts-for-react";
import { usePriceHistory } from "../hooks/usePriceHistory";

interface Props {
  coinId: string | null;
}

export default function PriceChart({ coinId }: Props) {
  // 使用我们之前写的 Hook 获取 7 天价格数据
  const { history, loading, error } = usePriceHistory(coinId);

  // ----- 状态 1：未选中币种 -----
  if (!coinId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
        Click a coin in the table to view its price chart
      </div>
    );
  }

  // ----- 状态 2：加载中 -----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">
        Loading chart...
      </div>
    );
  }

  // ----- 状态 3：出错 -----
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800 text-red-400">
        Error: {error}
      </div>
    );
  }

  // ----- 状态 4：渲染图表 -----
  const option = {
    // 提示框
    tooltip: {
      trigger: "axis" as const,         // 坐标轴触发（跟随鼠标竖线）
      backgroundColor: "#1f2937",       // 深色背景 = Tailwind gray-800
      borderColor: "#374151",           // 边框 = gray-700
      textStyle: { color: "#e5e7eb" },  // 文字 = gray-200
    },
    // 图表边距
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "5%",
      containLabel: true,  // 包含坐标轴标签，避免被裁切
    },
    // X 轴：时间
    xAxis: {
      type: "time" as const,  // ECharts 自动解析时间戳并生成合适的时间刻度
      axisLine: { lineStyle: { color: "#374151" } },
      axisLabel: {
        color: "#9ca3af",  // gray-400
        formatter: (value: number) => {
          const d = new Date(value);
          return `${d.getMonth() + 1}/${d.getDate()}`; // 显示为 "6/5"
        },
      },
      splitLine: { show: false }, // 不显示纵向网格线
    },
    // Y 轴：价格
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#9ca3af",
        formatter: (value: number) => `$${value.toLocaleString()}`, // "$26,350"
      },
      splitLine: { lineStyle: { color: "#1f2937" } }, // 深色网格线
    },
    // 数据系列
    series: [
      {
        data: history.map((p) => [p.timestamp, p.price]), // ECharts 需要 [x, y] 格式
        type: "line",
        smooth: true,     // 平滑曲线
        symbol: "none",   // 不显示数据点，线条更干净
        lineStyle: { color: "#3b82f6", width: 2 }, // 蓝色线条 = blue-500
        // 渐变面积填充
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,  // 从上到下的渐变
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.25)" },  // 顶部：浅蓝
              { offset: 1, color: "rgba(59,130,246,0.01)" },  // 底部：几乎透明
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
```

### 关键设计点

**1. 四种状态**

PriceChart 比 PriceTable 多了一种状态：`!coinId`（没选币种）。因为 PriceTable 总会显示数据，但 PriceChart 在用户点击之前没有要展示的内容。

处理顺序：没选 → 加载中 → 报错 → 渲染。这个顺序是对用户最友好的。

**2. ECharts 配置项 `option`**

ECharts 通过一个配置对象来描述图表的全部外观和行为。你不需要用 JS 操作 DOM，只需要描述"我要什么样"，ECharts 负责渲染。

关键配置：
- `xAxis.type = "time"`：告诉 ECharts X 轴是时间类型，它会自动计算合适的刻度间隔（比如每 1 天一个刻度）
- `smooth: true`：曲线平滑，比折线更美观
- `areaStyle`：渐变填充，从上到下由浅蓝变透明，比纯线条更有质感
- `"as const"`：TypeScript 的常量断言，不加的话 ECharts 的类型会报错（因为 `type` 字段的类型是联合类型 `"time" | "value" | ...`，不是泛泛的 `string`）

**3. 暗色主题配色**

所有颜色值都对应 Tailwind 的色板：
- `#1f2937` = gray-800
- `#374151` = gray-700
- `#9ca3af` = gray-400
- `#3b82f6` = blue-500

这样图表配色和页面整体暗色主题一致，不会显得突兀。

**4. echarts-for-react**

```typescript
<ReactECharts option={option} style={{ height: "280px" }} />
```

`echarts-for-react` 把 ECharts 的初始化、更新、销毁逻辑封装成一个 React 组件。当 `option` 对象变化时（比如选了新币种，history 数据变了），它自动调用 ECharts 的 `setOption` 更新图表。不需要手动操作 chart 实例。

提交：

```bash
git add src/components/PriceChart.tsx
git commit -m "feat: add PriceChart with ECharts line chart"
```

---

## 10. 编写 MarketPie 组件

### src/components/MarketPie.tsx

```typescript
import ReactECharts from "echarts-for-react";
import type { Coin } from "../types/coin";

interface Props {
  coins: Coin[];
  loading: boolean;
  error: string | null;
}

// 20 种固定颜色，确保每次渲染同一种币颜色一样
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

  // 取前 10 名，其余合并为 "Others"
  const top10 = coins.slice(0, 10);
  const otherMarketCap = coins
    .slice(10)
    .reduce((sum, coin) => sum + coin.market_cap, 0);

  // 构建饼图数据
  const pieData = top10.map((coin, i) => ({
    value: coin.market_cap,
    name: coin.name,
    itemStyle: { color: COLORS[i] }, // 固定颜色
  }));

  // 只有当其余 10 个币有市值时才添加 "Others" 分类
  if (otherMarketCap > 0) {
    pieData.push({
      value: otherMarketCap,
      name: "Others",
      itemStyle: { color: "#374151" }, // 灰色，视觉上退后
    });
  }

  const option = {
    // 提示框
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: { color: "#e5e7eb" },
      formatter: (params: { name: string; percent: number }) =>
        `${params.name}: ${params.percent.toFixed(1)}%`, // "Bitcoin: 48.3%"
    },
    // 图例
    legend: {
      orient: "vertical" as const,
      right: "0%",
      top: "center",
      textStyle: { color: "#9ca3af", fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
    },
    // 饼图系列
    series: [
      {
        type: "pie",
        // radius 的第一个值是内半径，第二个是外半径
        // "45%" 到 "75%" 就是环形（甜甜圈）效果
        radius: ["45%", "75%"],
        // center 偏左，给右侧图例留空间
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: "#111827",  // 切片间的分隔线 = gray-950
          borderWidth: 2,
        },
        label: { show: false },  // 不显示切片上的文字标签
        emphasis: {
          scaleSize: 8,  // 鼠标悬停时切片放大量
        },
        data: pieData,
      },
    ],
    // 饼图中心的文字
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
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
}
```

### 关键设计点

**1. Top 10 + Others**

20 个币种全放进饼图会有很多细碎的小切片，看不清也难看。所以只显示前 10 名，其余 10 个合并成一个 "Others" 切片。这是一个常见的数据可视化最佳实践。

**2. 环形（甜甜圈）图**

```typescript
radius: ["45%", "75%"]  // 内圆半径 45%，外圆半径 75%
```

如果 `radius` 是 `"75%"`（一个值），就是实心饼图。给两个值就是环形。环形图比实心饼图更现代，且中心可以放文字。

**3. 固定颜色**

`COLORS` 是一个硬编码的数组。好处是：不管数据怎么变，每种币的颜色始终一致（比如比特币永远是蓝色）。如果用自动生成的颜色，今天蓝明天红，用户会困惑。

**4. 中心文字 `graphic`**

ECharts 的 `graphic` 属性可以在图表任意位置放置文字、图片等。这里在环形的空心位置放 "Market Cap"，让用户一眼知道这个图在展示什么。

提交：

```bash
git add src/components/MarketPie.tsx
git commit -m "feat: add MarketPie with ECharts ring pie chart"
```

---

## 11. 组装 App.tsx

这是最关键的一步——把所有组件拼起来，并实现"状态提升"。

### src/App.tsx

打开 `src/App.tsx`，**全部删除**，替换为：

```typescript
import { useState } from "react";
import { useCoins } from "./hooks/useCoins";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import MarketPie from "./components/MarketPie";

export default function App() {
  // selectedCoinId 在这里，而不是在 PriceTable 里
  // 因为 PriceChart 也需要知道选了什么币种
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);

  // useCoins 只调用一次，数据分发给三个子组件
  const { coins, loading, error } = useCoins();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 顶部标题栏 */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Crypto Dashboard</h1>
        <p className="text-sm text-gray-500">TOP 20 by Market Cap</p>
      </header>

      {/* 主内容区：两列布局 */}
      <main className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 p-4 max-w-7xl mx-auto">
        {/* 左列：价格表格 */}
        <section>
          <PriceTable
            coins={coins}
            loading={loading}
            error={error}
            selectedCoinId={selectedCoinId}
            onSelect={setSelectedCoinId}
          />
        </section>

        {/* 右列：图表（垂直排列） */}
        <section className="flex flex-col gap-4">
          <PriceChart coinId={selectedCoinId} />
          <MarketPie coins={coins} loading={loading} error={error} />
        </section>
      </main>
    </div>
  );
}
```

### 状态提升（Lifting State Up）—— 面试核心考点

这是整个项目最重要的设计决策。

**问题：** `selectedCoinId` 应该放在哪个组件里？

- ❌ **放在 PriceTable 里？** PriceTable 里的点击事件可以更新自己的 state，但 PriceChart 是兄弟组件，访问不到 PriceTable 的 state
- ❌ **放在 PriceChart 里？** PriceTable 也访问不到
- ✅ **放在 App 里**：App 是 PriceTable 和 PriceChart 的公共父组件。App 持有 state，通过 props 向下传

**数据流向：**

```
PriceTable 点击行
  → 调用 onSelect(coinId)
  → App 的 setSelectedCoinId(coinId) 触发
  → App 重渲染
  → selectedCoinId 传给 PriceTable（用于行高亮）
  → selectedCoinId 传给 PriceChart（触发 usePriceHistory 请求）
  → PriceChart 获取新数据并绘制图表
```

这就是 React 官方文档说的 "Lifting State Up"（状态提升）。

**为什么 `onSelect={setSelectedCoinId}` 可以直接传？**

`useState` 返回的 setter 函数引用是稳定的（不会在重渲染时改变）。所以直接传 `setSelectedCoinId` 给子组件是安全的，不会导致子组件不必要的重渲染。

### 清理脚手架文件

```bash
rm -f src/App.css src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

验证编译：

```bash
npx tsc --noEmit    # 应该没有错误
npm run dev          # 启动开发服务器
```

在浏览器打开 http://localhost:5173 ，确认一切正常。

提交：

```bash
git add -A
git commit -m "feat: wire App.tsx with layout, state lifting, and component integration"
```

---

## 12. 本地验证

### 12.1 TypeScript 编译

```bash
npx tsc --noEmit
```

应该输出：无任何错误。

### 12.2 生产构建

```bash
npm run build
```

应该输出类似：

```
✓ built in 600ms
dist/index.html                   0.46 kB
dist/assets/index-xxx.css         7.12 kB
dist/assets/index-xxx.js       1335.97 kB  ← ECharts 比较大，正常
```

### 12.3 功能检查清单

在开发服务器上逐项检查：

- [ ] 页面加载，背景是深色
- [ ] 左侧显示 20 个币种的表格，有图标、名称、价格、涨跌幅、市值
- [ ] 在搜索框输入 "Bit"，表格仅显示 Bitcoin
- [ ] 表格中 24h 涨跌幅：涨的显示绿色带 + 号，跌的显示红色带 - 号
- [ ] 点击 Bitcoin 行，该行蓝色高亮
- [ ] 右侧上方出现 Bitcoin 的价格走势折线图
- [ ] 右侧下方显示市值分布的环形饼图
- [ ] 点击另一个币种，图表随之更新
- [ ] 断开网络 → 刷新页面 → 表格和图表显示错误提示（"Error: ..."）

---

## 13. 部署到 Vercel

### 13.1 创建 GitHub 仓库

1. 打开 https://github.com/new
2. Repository name: `crypto-dashboard`
3. 选 **Public**
4. **不要**勾选任何初始化选项（README、.gitignore、license）
5. 点 "Create repository"

### 13.2 推送代码

```bash
git remote add origin https://github.com/你的用户名/crypto-dashboard.git
git branch -M main
git push -u origin main
```

### 13.3 Vercel 部署

1. 打开 https://vercel.com/new
2. 用 GitHub 账号登录（首次使用需要授权）
3. 点击 **Import** → 选择 `crypto-dashboard` 仓库
4. Vercel 自动识别为 Vite 项目
5. **什么都不要改**，直接点 **Deploy**
6. 等待约 30 秒，部署完成
7. 获得线上 URL（类似 `https://crypto-dashboard-xxx.vercel.app`）

### 13.4 验证线上版本

打开 Vercel 给的 URL，做一遍和本地相同的功能检查。确认：

- 数据正常加载（CoinGecko API 可访问）
- 图表正常渲染
- 点击币种联动正常

---

## 14. 面试话术

### 面试官可能问的问题 & 你的回答

**Q1: "介绍一下这个项目。"**

> 这是一个加密货币数据看板，用 React + TypeScript 搭建。数据来自 CoinGecko 的免费 API。我封装了两个自定义 Hook——useCoins 拉取 TOP 20 币种列表，usePriceHistory 拉取单个币种的 7 天走势图。三个组件：PriceTable 展示带搜索功能的表格，PriceChart 用 ECharts 画价格的折线图，MarketPie 用环形图展示市值分布。最大的设计亮点是"状态提升"——选中币种的 id 放在 App 层，点击表格里的某一行，右边的图表会联动更新。最后部署在 Vercel 上。

**Q2: "为什么用自定义 Hook？"**

> 两个原因。第一，数据获取逻辑和 UI 逻辑分离。Hook 只负责"什么时候发请求、怎么处理 loading/error/data 三种状态"，组件只负责"怎么把数据渲染成 UI"。第二，契约统一——两个 Hook 都返回 `{ data, loading, error }` 这个结构，任何消费方不用看源码就知道怎么处理。这也跟 React Query 和 SWR 的设计理念一致。

**Q3: "selectedCoinId 为什么放在 App 而不是 PriceTable？"**

> 因为不止 PriceTable 需要用——PriceTable 需要用 selectedCoinId 做行高亮，PriceChart 需要用 selectedCoinId 去请求价格走势数据。如果放在 PriceTable，兄弟组件 PriceChart 就访问不到了。所以必须提升到最近的公共父组件 App。这就是 React 官方文档说的 Lifting State Up。

**Q4: "为什么选 ECharts 而不是 Chart.js 或 Recharts？"**

> 我调研过三个库。ECharts 有三个优势：一是 Canvas 渲染，数据点多的时候性能比 SVG 好；二是金融数据图表生态好，tooltip、时间轴、渐变填充这些都内置支持；三是社区活跃，背靠 Apache 基金会。Chart.js 也不错但配置更繁琐；Recharts 是 React 原生但图表类型没有 ECharts 丰富。

**Q5: "遇到什么困难？"**

> CoinGecko 的免费 API 在限流时不返回标准的 429 状态码，而是返回 200 + 一段 HTML，导致 `res.json()` 报错。我通过在 fetch 后用 `res.ok` 提前检查状态码解决了。另外就是组件卸载后的异步状态更新问题——用了 `cancelled` 标志位来防止内存泄漏。这两个问题也让我意识到了在 Hook 里做好错误处理和资源清理有多重要。

**Q6: "如果让你改进，会加什么功能？"**

> 第一个是自动刷新——把 useCoins 的依赖数组从 `[]` 改成 `[refreshInterval]`，暴露 refetch 函数。第二个是更多的图表类型——比如 ECharts 的 candlestick 图可以展示开盘价收盘价最高价最低价。第三个是性能优化——把 ECharts 的 option 对象用 useMemo 缓存，避免不必要的图表重渲染。

---

## 附录：完整文件树

```
crypto-dashboard/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .gitignore
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── coin.ts
    ├── hooks/
    │   ├── useCoins.ts
    │   └── usePriceHistory.ts
    └── components/
        ├── PriceTable.tsx
        ├── PriceChart.tsx
        └── MarketPie.tsx
```

---

## 附录：Git 提交历史参考

```
137fffb chore: scaffold Vite + React + TS project
bd41194 chore: configure Tailwind CSS
bdc9da7 feat: add Coin and PricePoint type definitions
56e83d6 feat: add useCoins hook for TOP 20 market data
528b04c feat: add usePriceHistory hook for 7-day chart data
e885fe4 feat: add PriceTable with search filter and row selection
ae1efd1 feat: add PriceChart with ECharts line chart
2580cef fix: add Market Cap center label to doughnut chart
9754d0c feat: wire App.tsx with layout, state lifting, and component integration
b7758e6 fix: add tslib dependency for echarts-for-react
```

---

> **线上地址：** https://crypto-dashboard-ruddy-sigma.vercel.app/
>
> **源码：** https://github.com/ddecson-droid/crypto-dashboard
