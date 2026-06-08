# 加密货币数据看板 — 从零开发全记录

> 这是一个"如果你是零基础、需要假装自己亲手做过这个项目"的开发过程记录。每一步都告诉你：你在用什么软件、在哪里操作、写了什么代码、为什么会看到某个结果、这个结果意味着什么。面试前通读两遍，面试官问到任何细节你都能对答如流。

---

## 目录

1. [准备阶段](#1-准备阶段安装软件)
2. [创建项目](#2-创建项目输入第一行命令)
3. [安装图表库和 CSS 框架](#3-安装图表库和-css-框架)
4. [配置 Tailwind 暗色主题](#4-配置-tailwind-暗色主题)
5. [定义 TypeScript 类型](#5-定义-typescript-类型)
6. [编写第一个 Hook：useCoins](#6-编写第一个-hookusecoins)
7. [编写第二个 Hook：usePriceHistory](#7-编写第二个-hookusepricehistory)
8. [编写 PriceTable 组件](#8-编写-pricetable-组件)
9. [编写 PriceChart 组件](#9-编写-pricechart-组件)
10. [编写 MarketPie 组件](#10-编写-marketpie-组件)
11. [组装 App.tsx](#11-组装-apptsx)
12. [本地验证](#12-本地验证)
13. [部署到互联网](#13-部署到互联网)
14. [面试预演](#14-面试预演)

---

## 1. 准备阶段：安装软件

### 你做了什么

去官网下载安装了三个软件：

| 软件 | 下载地址 | 它是什么 | 你怎么确认装好了 |
|------|----------|----------|------------------|
| Node.js | nodejs.org （下载 LTS 版本）| JavaScript 的运行环境，你的代码要通过它才能执行 | 打开命令行（Win+R 输入 cmd），输入 `node -v`，屏幕上显示 `v20.x.x` |
| VS Code | code.visualstudio.com | 代码编辑器，用来写代码 | 能从开始菜单打开 |
| Git | git-scm.com | 版本管理工具，记录每次修改 | 命令行输入 `git -v`，显示 `git version 2.x.x` |

### 为什么要装这些

- **Node.js**：没有它，你写的 `.tsx` 文件只是一堆文字。Node.js 把代码翻译成浏览器能懂的 HTML/CSS/JS。
- **VS Code**：理论上用记事本也能写，但 VS Code 有语法高亮（不同类型的东西不同颜色）、自动补全（写 `cons` 自动补成 `console`）、错误提示（写到一半就标红告诉你写错了）。
- **Git**：记录每次修改的快照。写错了可以一键回到上一个版本。最后部署到 Vercel 也需要通过 Git 推送。

### 你还需要注册什么

| 平台 | 地址 | 用途 |
|------|------|------|
| GitHub | github.com（免费注册） | 代码托管，你的代码存在这里 |
| Vercel | vercel.com（用 GitHub 账号直接登录） | 部署平台，把你的代码变成别人能打开的网址 |

---

## 2. 创建项目：输入第一行命令

### 你在哪里操作

打开命令行（Windows：Win+R → 输入 `cmd` → 回车），光标闪烁在一个黑色窗口里。

### 你输入了什么

```bash
cd Desktop
npm create vite@latest crypto-dashboard -- --template react-ts
```

第一行 `cd Desktop`：把命令行的工作目录切换到桌面。之后生成的项目文件夹会出现在桌面上。

第二行拆解：
- `npm create`：npm 是 Node.js 自带的包管理工具，`create` 用来从网上下载项目模板
- `vite@latest`：使用 Vite（读作 "veet"，法语"快"）的最新版。Vite 是项目的构建工具——它负责把开发时的代码打包成生产环境能用的文件
- `crypto-dashboard`：项目名称，也就是桌面上生成的文件夹名
- `-- --template react-ts`：双横线后面的参数传给 Vite，指定使用 React + TypeScript 模板

### 屏幕上出现了什么

命令执行后，Vite 打印了一行信息，大致是：

```
Scaffolding project in C:\Users\你的用户名\Desktop\crypto-dashboard...
Done. Now run:

  cd crypto-dashboard
  npm install
  npm run dev
```

这表示 Vite 已经生成了一个项目文件夹。接着按照屏幕上的提示继续：

```bash
cd crypto-dashboard
npm install
```

`cd crypto-dashboard` 进入项目文件夹。`npm install` 下载这个模板需要的所有依赖（React、TypeScript、Vite 等）。你会看到屏幕上滚动几百行进度条，最后显示 `added 150 packages`。这些 packages 就是别人写好的代码包，你的项目建立在它们之上。

### 生成了什么

打开 VS Code → File → Open Folder → 选择桌面上的 `crypto-dashboard` 文件夹。左侧文件树出现：

```
crypto-dashboard/
├── index.html          ← 浏览器访问的入口文件
├── package.json        ← 项目的"身份证"，记录项目名称、依赖列表、脚本命令
├── vite.config.ts      ← Vite 的配置文件
├── tsconfig.json       ← TypeScript 的配置文件
├── src/
│   ├── main.tsx        ← 应用的 JavaScript 入口
│   ├── App.tsx         ← 根组件
│   ├── App.css         ← 根组件样式（等会删掉）
│   ├── index.css       ← 全局样式
│   └── assets/         ← 放图片的文件夹
└── public/             ← 放不需要处理的静态文件
```

### 同时做了一件事：Git 初始化

```bash
git init
git add -A
git commit -m "项目初始化"
```

`git init` 在当前文件夹创建一个隐形的 `.git` 文件夹，从此这个文件夹被 Git 管理。`git add -A` 把所有文件加入暂存区（相当于告诉 Git "这些文件我要跟踪"）。`git commit -m "项目初始化"` 创建一个快照。

现在你的项目状态是：**一个空壳 React 应用**。如果此时运行 `npm run dev`，浏览器会显示 Vite 默认的欢迎页面（有一个旋转的 React 图标）。

---

## 3. 安装图表库和 CSS 框架

### 你输入了什么

```bash
npm install echarts echarts-for-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### 每条命令在做什么

**第一条** `npm install echarts echarts-for-react`：
- `echarts`：百度开源的数据可视化库。不是 React 组件，是原生 JS 库。
- `echarts-for-react`：一个 React 封装包。它把 ECharts 的命令式 API 包装成一个 React 组件 `<ReactECharts option={...} />`，让你可以用声明式的方式使用 ECharts。

这两个包放在 `package.json` 的 `dependencies` 里——代码运行时需要它们。

**第二条** `npm install -D tailwindcss@3 postcss autoprefixer`：
- `-D` 表示开发依赖——只在开发阶段用，最终打包后不包含
- `tailwindcss@3`：Tailwind CSS 第 3 版。`@3` 指定版本，因为 v4 有些 API 不同
- `postcss`：CSS 预处理器。Tailwind 需要它来把一堆 class 名编译成真正的 CSS
- `autoprefixer`：自动给 CSS 加浏览器前缀

**第三条** `npx tailwindcss init -p`：
- `npx` 执行 node_modules 里的命令
- `tailwindcss init` 生成 Tailwind 配置文件
- `-p` 同时生成 PostCSS 配置文件
- 这条命令执行后，项目根目录多了两个文件：`tailwind.config.js` 和 `postcss.config.js`

### 为什么要这一步

ECharts 是你画图表的家伙，Tailwind 是你写样式的家伙。没有它们，后面的 PriceChart 和所有颜色、布局都无从谈起。

---

## 4. 配置 Tailwind 暗色主题

### 你做了什么

在 VS Code 里打开 `tailwind.config.js`，把 `content` 数组从空的改成：

```javascript
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

`content` 数组是 Tailwind 的"搜索路径"——告诉它去哪里扫描你用到的 class 名。如果不配，Tailwind 不知道你的代码里用了 `bg-gray-900`，就不会生成对应的 CSS，所有样式都不会生效。

`./src/**/*.{js,ts,jsx,tsx}` 的意思是：src 文件夹里任意深度的子文件夹（`**`）中，后缀为 js/ts/jsx/tsx 的文件（`*` 是通配符）。

然后打开 `src/index.css`，**全部删掉**（原来大概有一百多行 Vite 模板样式），替换为：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-white;
}
```

`@tailwind base/components/utilities` 是 Tailwind 的三层指令：
- `base`：全局重置（比如去掉所有元素的默认边距）
- `components`：组件级别的样式
- `utilities`：工具类（比如 `text-center`、`flex`、`p-4`）

`@apply` 让你在 CSS 文件里使用 Tailwind 的工具类。`bg-gray-950` 是最深的灰色（接近纯黑），`text-white` 是白色文字。

### 如何验证

```bash
npm run dev
```

这个命令启动 Vite 的开发服务器。屏幕上显示：

```
  VITE v8.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

在浏览器打开 `http://localhost:5173/`，页面背景变成深黑色（`bg-gray-950` 起了作用）。确认后 Ctrl+C 关闭开发服务器。

### 提交

```bash
git add tailwind.config.js src/index.css
git commit -m "配置 Tailwind CSS 暗色主题"
```

---

## 5. 定义 TypeScript 类型

### 你在哪里操作

VS Code 中，在左侧文件树的 `src` 文件夹上右键 → New Folder → 输入 `types`。然后在 `types` 上右键 → New File → 输入 `coin.ts`。

### 你写了什么

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
  timestamp: number;
  price: number;
}
```

### 逐行解释

`export interface Coin { ... }`：定义一个名叫 `Coin` 的接口（interface），并用 `export` 导出，让其他文件可以 `import { Coin } from "../types/coin"` 来使用。

接口里的每一行定义一个字段：
- `id: string`：币种 ID，类型是字符串。例如 Bitcoin 的 id 是 `"bitcoin"`
- `name: string`：名称，例如 `"Bitcoin"`
- `symbol: string`：交易代码，例如 `"btc"`
- `image: string`：图标图片的 URL
- `current_price: number`：当前美元价格，类型是数字
- `price_change_percentage_24h: number`：24小时涨跌百分比
- `market_cap: number`：总市值（美元）

`export interface PricePoint { ... }`：定义价格的单个数据点。`timestamp` 是 Unix 毫秒时间戳（比如 `1686009600000`），`price` 是当时的价格。

### 这些字段从哪来

你去 https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=false 在浏览器里打开。你会看到一大串 JSON：

```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "image": "https://coin-images.coingecko.com/.../bitcoin.png",
    "current_price": 63174,
    "price_change_percentage_24h": -4.09,
    "market_cap": 1270000000000,
    ...
  }
]
```

你从 JSON 中挑了 7 个对看板有用的字段，定义了 `Coin` 接口。`PricePoint` 同理，来自 `/coins/{id}/market_chart` 端点。

### 为什么这一步要放在写 Hook 之前

因为 TypeScript 的核心价值是类型检查。如果先写 Hook 再补类型，Hook 里很多地方的类型会是隐式的 `any`——TypeScript 的"保护网"就没起作用。而先写好类型，再写 Hook 时，`useState<Coin[]>([])` 里的 `<Coin[]>` 就有了明确的类型来源——Coin 接口。

### 如何验证

在 VS Code 里按 Ctrl+` 打开内置终端，输入：

```bash
npx tsc --noEmit
```

如果屏幕上没有输出任何错误，说明类型定义没有问题。`tsc` 是 TypeScript 的编译器，`--noEmit` 表示只检查不生成文件。

### 提交

```bash
git add src/types/coin.ts
git commit -m "定义 Coin 和 PricePoint 类型"
```

---

## 6. 编写第一个 Hook：useCoins

### 你在哪里操作

VS Code 中，`src` 文件夹上右键 → New Folder → 命名 `hooks`。在 `hooks` 上右键 → New File → 命名 `useCoins.ts`。

### 你写了什么

```typescript
import { useState, useEffect } from "react";
import type { Coin } from "../types/coin";

const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd" +
  "&order=market_cap_desc" +
  "&per_page=20" +
  "&page=1" +
  "&sparkline=false";

export function useCoins(): {
  coins: Coin[];
  loading: boolean;
  error: string | null;
} {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "获取失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoins();

    return () => {
      cancelled = true;
    };
  }, []);

  return { coins, loading, error };
}
```

### 逐行解释

#### 导入部分

```typescript
import { useState, useEffect } from "react";
```
从 React 库中引入 `useState` 和 `useEffect`。这是 React 内置的两个 Hook 函数——`useState` 管理状态（数据），`useEffect` 管理副作用（网络请求）。

```typescript
import type { Coin } from "../types/coin";
```
从我们刚才定义的 coin.ts 中导入 Coin 类型。`import type` 表示只导入类型，不导入值——编译后这行代码会消失，不影响最终产物大小。

#### API 地址

```typescript
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?...";
```
拼接了 CoinGecko 免费 API 的完整 URL。参数含义：
- `vs_currency=usd`：以美元计价
- `order=market_cap_desc`：按市值从大到小排序
- `per_page=20`：每页 20 条
- `page=1`：第 1 页
- `sparkline=false`：不需要迷你走势图（减少数据传输量）

#### 函数签名

```typescript
export function useCoins(): {
  coins: Coin[];
  loading: boolean;
  error: string | null;
}
```

`export function` 表示这个函数可以被其他文件导入。冒号后面是返回值类型：一个包含三个属性的对象。
- `coins`：币种数组，类型是前面定义的 `Coin[]`
- `loading`：布尔值，true 表示正在加载
- `error`：可能是 string（错误信息），也可能是 null（没有错误）

这三个字段构成一个"状态机"——任何一个调用 useCoins 的组件，只需要检查这三个值就能知道当前处在什么状态：
- loading=true → 显示"加载中"
- error 不为 null → 显示"出错了"
- loading=false 且 error=null → 安心使用 coins 数据

#### 状态定义

```typescript
const [coins, setCoins] = useState<Coin[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

这三行创建了三个 React state。

`useState(初始值)` 返回一个数组：第一项是当前值，第二项是修改函数。比如 `[coins, setCoins]`——`coins` 是当前数据，`setCoins(新数据)` 更新数据。

`<Coin[]>` 是泛型参数，告诉 TypeScript "这个 state 存的是 Coin 数组"。`<string | null>` 表示"这个 state 要么是字符串，要么是 null"。

初始值的选择：
- `coins` 初始 `[]`——还没有数据
- `loading` 初始 `true`——因为组件挂载就会发请求，所以一开始就在加载中
- `error` 初始 `null`——还没出错误

#### useEffect：发起网络请求

```typescript
useEffect(() => {
  let cancelled = false;
  // ...
  return () => { cancelled = true; };
}, []);
```

`useEffect` 接收两个参数：一个函数和一个依赖数组。

函数体在组件渲染到屏幕 **之后** 执行。依赖数组 `[]` 为空，意思是"这个 effect 只在组件第一次挂载时执行一次"——不会在每次重渲染时重复执行。

`let cancelled = false` 是一个标志位。`return () => { cancelled = true; }` 是清理函数——React 在组件被销毁时调用它。如果用户在数据返回之前离开了页面，`cancelled` 变成 `true`，后续所有状态更新都被跳过，避免内存泄漏。

#### fetchCoins 内部逻辑

```typescript
async function fetchCoins() {
  setLoading(true);      // 开始加载
  setError(null);        // 清除之前的错误
  try {
    const res = await fetch(API_URL);           // 发送 HTTP 请求
    if (!res.ok) throw new Error(`HTTP ${res.status}`);  // 检查状态码
    const data: Coin[] = await res.json();     // 解析 JSON
    if (!cancelled) setCoins(data);            // 存数据（如果组件还在）
  } catch (e) {
    if (!cancelled) {
      setError(e instanceof Error ? e.message : "获取失败"); // 存错误信息
    }
  } finally {
    if (!cancelled) setLoading(false);         // 结束加载
  }
}
```

执行顺序：设置 loading → 清除错误 → 发请求 → 成功则存数据，失败则存错误 → 结束 loading。

`await fetch(API_URL)` 向 CoinGecko 发送 GET 请求，`await` 会等待响应返回才继续执行——但你不会感觉"卡住"，因为整个函数是 async 的，JS 引擎在这期间可以处理其他事情。

`res.ok` 检查 HTTP 状态码是否在 200-299 范围内。如果 CoinGecko 限流（免费 API 每分钟有限制），可能返回 200 + 错误 HTML。`res.json()` 解析 HTML 会抛出一个难以理解的错误。主动检查 `res.ok` 能提前截住，给出清晰的状态码。

每个 `if (!cancelled)` 都是在问："组件还在吗？"如果组件已经被卸载，跳过更新——React 不会有机会向一个不存在的组件 setState。

`e instanceof Error ? e.message : "获取失败"` 是一个三元表达式。如果 catch 到的东西是 Error 类型，取它的 message；如果不是（比如有人 throw 了一个字符串），用默认文案。

---

## 7. 编写第二个 Hook：usePriceHistory

### 你写了什么

```typescript
import { useState, useEffect } from "react";
import type { PricePoint } from "../types/coin";

const BASE_URL = "https://api.coingecko.com/api/v3/coins";

export function usePriceHistory(coinId: string | null): {
  history: PricePoint[];
  loading: boolean;
  error: string | null;
} {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);   // 注意：初始 false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) {
      setHistory([]);
      setLoading(false);
      setError(null);
      return;    // 没有币种选中，不发请求
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
          setError(e instanceof Error ? e.message : "获取历史数据失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [coinId]);   // 注意：依赖 coinId，不是空数组

  return { history, loading, error };
}
```

### 和 useCoins 的关键区别

| 对比点 | useCoins | usePriceHistory |
|--------|----------|-----------------|
| **是否需要参数** | 否 | 是，`coinId: string \| null` |
| **loading 初始值** | `true`（挂载就发请求） | `false`（可能还没选币种） |
| **依赖数组** | `[]`（只执行一次） | `[coinId]`（coinId 变化重新执行） |
| **空值处理** | 不需要 | `if (!coinId) return;` |
| **返回值** | `coins: Coin[]` | `history: PricePoint[]` |
| **数据转换** | 直接使用 API 返回的 JSON | 把 `[timestamp, price]` 元组转成 `{ timestamp, price }` 对象 |
| **API 端点** | `/coins/markets` | `/coins/{id}/market_chart` |

### 数据转换的细节

CoinGecko 返回的 JSON 长这样：

```json
{
  "prices": [
    [1717459200000, 26350.5],
    [1717545600000, 26580.2],
    [1717632000000, 26200.8]
  ]
}
```

`data.prices` 是一个数组，每一项是一个 `[时间戳, 价格]` 的元组。元组的问题是：`price[1]` 到底是什么意思？必须靠记忆。

`map` 方法遍历数组，把每一项变成对象：

```typescript
([timestamp, price]: [number, number]) => ({ timestamp, price })
```

`[number, number]` 是 TypeScript 的元组类型注解，告诉编译器这里有两个数字。解构后赋值给 `timestamp` 和 `price`，然后用简写语法 `({ timestamp, price })` 构造对象。

转换后用 `point.timestamp` `point.price` 代替 `point[0]` `point[1]`，代码可读性提升一档。

### 为什么不能复用 useCoins

面试官特别喜欢问这个。答案：两个 Hook 虽然内部结构相似，但触发时机完全不同。useCoins 是"挂载即执行"，usePriceHistory 是"有条件执行"。如果合并成一个 Hook：

```typescript
// ❌ 反模式
function useCoinData(options) {
  if (options.type === "list") { /* ... */ }
  else if (options.type === "history") { /* ... */ }
}
```

这个 Hook 既要处理"无参数"的情况又要处理"有参数"的情况，内部会有大量 if-else，违反单一职责原则。两个独立但模式一致的 Hook 是更好的设计——见名知义，易于测试。

---

## 8. 编写 PriceTable 组件

### 你在哪里操作

VS Code 中，`src` 下创建 `components` 文件夹，然后新建 `PriceTable.tsx`。

### 你写了什么（完整代码）

```typescript
import { useState } from "react";
import type { Coin } from "../types/coin";
```

引入 `useState`（搜索框需要 state）和 Coin 类型。

```typescript
interface Props {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  selectedCoinId: string | null;
  onSelect: (coinId: string) => void;
}
```

`Props` 定义了 PriceTable 从父组件（App）接收的五个参数。`onSelect` 的类型是 "接收一个 string 参数、不返回值的函数"——这就是回调函数的标准 TS 写法。

```typescript
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}
```

`1e12` 是科学计数法，等于 1,000,000,000,000（一万亿）。`toFixed(2)` 保留两位小数。`toLocaleString()` 给纯数字加千分位逗号（如 `1,234,567`）。

比特币的市值大概是 1,270,000,000,000 美元。如果不处理，表格里显示 13 位数字根本看不清。`formatMarketCap` 把它变成 `$1.27T`——一眼就知道是 1.27 万亿美元。

```typescript
export default function PriceTable({
  coins,
  loading,
  error,
  selectedCoinId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
```

`export default` 表示导入时不需要花括号：`import PriceTable from "..."`。参数从 props 中解构。`search` 是搜索框的文本 state。

```typescript
  if (loading) {
    return <p className="...">Loading coins...</p>;
  }
```

`return` 后面的 JSX 语法——看起来像 HTML，实际上是 React 在 JS 里描述 UI 的方式。`className` 对应 HTML 的 `class`（因为 `class` 是 JS 的保留字，所以 React 用 `className`）。

如果 `loading` 是 true，组件直接返回一段文字 "Loading coins..."，后面的代码不执行。这是一种"提前返回"模式——把特殊状态放在前面处理，正常状态的代码保持简洁。

```typescript
  if (error) {
    return <p className="...text-red-400...">Error: {error}</p>;
  }
```

如果 error 不为 null，显示红色错误信息。

```typescript
  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );
```

`filter` 遍历 coins 数组，保留名字包含搜索词的。`toLowerCase()` 使过滤不区分大小写——搜 "bit" 能匹配 "Bitcoin"。`includes` 检查字符串是否包含子串。

```typescript
  return (
    <div>
      <input
        type="text"
        placeholder="Search coins..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 ..."
      />
```

搜索框。`value={search}` 让 input 的值由 React state 控制（受控组件）。`onChange` 在用户每次按键时触发——`e.target.value` 是文本框当前内容，`setSearch` 更新 state → 组件重渲染 → `filtered` 重新计算 → 表格立即更新。

Tailwind class 拆解：
- `w-full`：宽度 100%
- `mb-4`：底部外边距 1rem
- `px-3`：左右内边距 0.75rem
- `py-2`：上下内边距 0.5rem
- `rounded-lg`：圆角
- `bg-gray-800`：深灰色背景
- `border border-gray-700`：边框 + 边框颜色
- `text-white`：白色文字
- `placeholder-gray-500`：placeholder 文字的颜色
- `focus:outline-none focus:border-blue-500`：获取焦点时去掉默认轮廓，边框变蓝
- `text-sm`：小号字体

```typescript
      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="...">
              <th>#</th>
              <th>Name</th>
              <th className="text-right">Price</th>
              <th className="text-right">24h %</th>
              <th className="text-right hidden md:table-cell">Market Cap</th>
            </tr>
          </thead>
```

表格区域。`overflow-y-auto` 表示内容超出时出现纵向滚动条。`max-h-[calc(100vh-180px)]` 是 Tailwind 的任意值语法——表格最大高度 = 屏幕高度 - 180px（留给顶栏和边距）。

`hidden md:table-cell`：移动端（屏幕宽度 < 768px）隐藏市值列，桌面端显示。避免小屏幕上挤不下。

```typescript
          <tbody>
            {filtered.map((coin, index) => {
              const isSelected = coin.id === selectedCoinId;
              const change = coin.price_change_percentage_24h;

              return (
                <tr
                  key={coin.id}
                  onClick={() => onSelect(coin.id)}
                  className={`... ${
                    isSelected ? "bg-blue-900/30 hover:bg-blue-900/40" : ""
                  }`}
                >
```

`filtered.map` 遍历筛选后的数组，每项生成一个 `<tr>`。

`key={coin.id}` 是 React 列表渲染的必须属性——React 用它来追踪哪一行变了，避免不必要的 DOM 操作。每个币种的 id 是唯一的，适合做 key。

`onClick={() => onSelect(coin.id)}`：箭头函数，点击时调用父组件传来的 `onSelect`。为什么不是 `onClick={onSelect(coin.id)}`？因为后者会在渲染时 **立即执行**，而不是等点击时才执行。箭头函数创建了一个"包装器"——点击时才调用。

`isSelected` 判断这一行是否被选中。如果是，加上蓝色半透明背景 `bg-blue-900/30`（`/30` 表示 30% 不透明度）。`hover:bg-blue-900/40` 是悬停时的稍深颜色。

```typescript
                  <td className="...font-mono">
                    $
                    {coin.current_price < 0.01
                      ? coin.current_price.toFixed(6)
                      : coin.current_price.toLocaleString()}
                  </td>
```

`font-mono` 是等宽字体，数字对齐。价格显示逻辑：如果价格小于 1 美分，显示 6 位小数（`0.000123`）；否则用 `toLocaleString()` 加千分位逗号（`63,174`）。

为什么要区分？比特币 $63,174 不需要小数点后 6 位。但某些山寨币价格可能是 $0.000023——如果显示两位小数就是 $0.00，看不出价格。

```typescript
                  <td className={`... ${
                    change >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {change >= 0 ? "+" : ""}
                    {change?.toFixed(2)}%
                  </td>
```

涨跌幅列。涨是绿色（`text-green-400`）加 `+` 号，跌是红色（`text-red-400`）。`change?.toFixed(2)` 中的 `?.` 是可选链——如果 change 是 null/undefined，返回 undefined 而不会报错。

```typescript
        {filtered.length === 0 && (
          <p className="...">No coins found.</p>
        )}
```

`&&` 短路求值：如果左边是 true，执行右边的 JSX 并渲染；如果左边是 false，什么都不渲染。这用于处理"搜索词没有匹配任何币种"的情况——比显示一个空表格友好。

---

## 9. 编写 PriceChart 组件

### 你写了什么

```typescript
import ReactECharts from "echarts-for-react";
import { usePriceHistory } from "../hooks/usePriceHistory";

interface Props {
  coinId: string | null;
}

export default function PriceChart({ coinId }: Props) {
  const { history, loading, error } = usePriceHistory(coinId);
```

PriceChart 调用 `usePriceHistory`——之前封装的 Hook。传入 `coinId`，得到三个状态。

```typescript
  if (!coinId) {
    return (
      <div className="flex items-center justify-center h-64 ...">
        Click a coin in the table to view its price chart
      </div>
    );
  }
```

四种状态中的第一种：还没选币种。`flex items-center justify-center` 让文字在 div 中水平垂直居中。`h-64` 是 16rem 高度。

```typescript
  if (loading) {
    return <div className="...">Loading chart...</div>;
  }

  if (error) {
    return <div className="...text-red-400...">Error: {error}</div>;
  }
```

第二、三种状态：加载中、出错了。和前两种一样用提前返回模式处理。

```typescript
  const option = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: { color: "#e5e7eb" },
    },
```

`option` 是 ECharts 的配置对象。`tooltip` 是鼠标悬停时弹出的提示框。`trigger: "axis"` 表示触发方式是坐标轴触发——鼠标移动到图表上时出现一条竖线，同时显示该时间点的价格。`as const` 是 TypeScript 的常量断言——因为 `type` 字段在 ECharts 类型定义中是字面量联合类型 `"axis" | "item" | "none"`，不加 `as const` 会被推断为 `string` 而报类型错误。

颜色值 `#1f2937`、`#374151`、`#e5e7eb` 分别对应 Tailwind 色板中的 gray-800、gray-700、gray-200——和整个页面的暗色主题一致。

```typescript
    grid: {
      left: "3%", right: "4%", bottom: "3%", top: "5%",
      containLabel: true,
    },
```

`grid` 控制图表的内边距。`containLabel: true` 表示这个边距包含了坐标轴标签——不会出现标签被裁切的情况。

```typescript
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
```

X 轴配置。`type: "time"` 告诉 ECharts 把传入的值当作时间戳处理——ECharts 会自动计算合适的时间刻度（每几小时或每天一个标签），不需要手动指定。

`formatter` 是格式化函数：时间戳 → Date 对象 → `月/日` 格式。`getMonth()` 返回 0-11，所以要 +1。

```typescript
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#9ca3af",
        formatter: (value: number) => `$${value.toLocaleString()}`,
      },
      splitLine: { lineStyle: { color: "#1f2937" } },
    },
```

Y 轴配置——价格轴。`type: "value"` 是数值轴。`formatter` 把数字格式化为 `$63,174`。`splitLine` 是背景水平网格线——`#1f2937` 是深色，不抢眼。

```typescript
    series: [
      {
        data: history.map((p) => [p.timestamp, p.price]),
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#3b82f6", width: 2 },
```

`series` 数组里每一项是一种图表类型。这里只有一个——折线。`data` 把 `PricePoint[]` 转回 ECharts 需要的 `[timestamp, price]` 格式。`smooth: true` 是平滑曲线（贝塞尔曲线），比折线更美观。`symbol: "none"` 不显示数据点上的圆点。线条颜色 `#3b82f6` 是 Tailwind 的 blue-500。

```typescript
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.25)" },
              { offset: 1, color: "rgba(59,130,246,0.01)" },
            ],
          },
        },
      },
    ],
  };
```

`areaStyle` 给线条下方填色。`type: "linear"` 表示线性渐变。`x:0, y:0, x2:0, y2:1` 表示从上到下的渐变方向。两个 `colorStops`：顶部是 25% 不透明度的蓝色，底部是 1%——越往下越淡，最终和背景融合。

```typescript
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
}
```

`<ReactECharts>` 是 echarts-for-react 提供的组件，接收 option 配置和样式。`style={{ height: "280px" }}` 是 React 的内联样式语法——外层花括号是 JSX 表达式，内层花括号是 JS 对象。这等价于 CSS 的 `height: 280px`。

当 `option` 对象变化（比如选中了新币种、history 数据变了），`ReactECharts` 自动调用 ECharts 的 `setOption` 更新图表——你不需要手动操作。

---

## 10. 编写 MarketPie 组件

### 你写了什么

```typescript
const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  "#84cc16", "#e11d48", "#0ea5e9", "#d946ef", "#10b981",
  "#eab308", "#64748b", "#f43f5e", "#2dd4bf", "#a855f7",
];
```

20 种固定颜色。硬编码而不是随机生成——保证 Bitcoin 每次都是蓝色，Ethereum 每次都是红色。

```typescript
  const top10 = coins.slice(0, 10);
  const otherMarketCap = coins
    .slice(10)
    .reduce((sum, coin) => sum + coin.market_cap, 0);
```

`slice(0, 10)` 取前 10 个。`slice(10)` 取第 11 到第 20 个。`reduce` 把后 10 个的市值全部加起来——`sum` 是累加器，从 `0` 开始，每次加一个 `coin.market_cap`。

```typescript
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
```

`map` 把前 10 个币种转成 ECharts 饼图需要的数据格式：`{ value: 数值, name: 名称, itemStyle: { color: 颜色 } }`。如果后 10 个的总市值大于 0（新币种可能没有市值数据），则追加一个灰色 "Others" 切片。

```typescript
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
```

在环形图的空心位置显示 "Market Cap" 文字。`graphic` 是 ECharts 的"原生图形元素"——可以在图表任意位置放置文字、图片、形状。

```typescript
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        center: ["40%", "50%"],
        ...
        data: pieData,
      },
    ],
```

`radius: ["45%", "75%"]` 是最关键的一行——数组的两个值分别代表内半径和外半径。这创造了环形（甜甜圈）效果。如果只有一个值 `"75%"`，就是实心饼图。

`center: ["40%", "50%"]` 把饼图中心从默认的 (50%, 50%) 向左偏移到 (40%, 50%)——给右侧的图例留出空间。

---

## 11. 组装 App.tsx

### 你在哪里操作

打开 `src/App.tsx`，Vite 模板自动生成的代码大概 30 多行，全部删掉。另外打开 `src/main.tsx`，确认它导入了 `index.css` 和 `App`（Vite 模板默认就这样，一般不用改）。

### 你写了什么

```typescript
import { useState } from "react";
import { useCoins } from "./hooks/useCoins";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import MarketPie from "./components/MarketPie";
```

导入依赖：React 的 `useState`，自己写的 useCoins Hook，三个组件。

```typescript
export default function App() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const { coins, loading, error } = useCoins();
```

两行代码建立了整个应用的数据层：
- `selectedCoinId`：当前选中的币种 ID。初始值 `null` 表示还没选。
- `coins / loading / error`：来自 useCoins，只调用一次，数据被三个子组件共享。

**为什么 selectedCoinId 放在这里而不是 PriceTable 里？** 因为 PriceChart 也需要知道它。如果放在 PriceTable，PriceChart 是兄弟组件，访问不到。所以必须上提到公共父组件 App——这就是 React 的 "Lifting State Up"。

```typescript
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Crypto Dashboard</h1>
        <p className="text-sm text-gray-500">TOP 20 by Market Cap</p>
      </header>
```

最外层 div：`min-h-screen` 最小高度为整个屏幕，`bg-gray-950` 深黑背景，`text-white` 白色文字。header 有底部边框分隔线。

```typescript
      <main className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 p-4 max-w-7xl mx-auto">
```

主内容区。`grid` 启用 CSS Grid 布局。`grid-cols-1` 在手机上一列。`lg:grid-cols-[40%_60%]` 在大屏幕上两列——左列 40%，右列 60%。`max-w-7xl mx-auto` 内容最大宽度 80rem，水平居中。

```typescript
        <section>
          <PriceTable
            coins={coins}
            loading={loading}
            error={error}
            selectedCoinId={selectedCoinId}
            onSelect={setSelectedCoinId}
          />
        </section>
```

左列：PriceTable。`coins / loading / error` 传递 useCoins 的数据。`selectedCoinId` 让表格知道哪一行高亮。`onSelect={setSelectedCoinId}` 传递 state setter 作为回调——点击行 → 调 setSelectedCoinId → selectedCoinId 更新 → App 重渲染。

**为什么可以直接传 `setSelectedCoinId` 而不用包一层？** `useState` 返回的 setter 函数引用是稳定的——不会在每次渲染时变。直接传递不会导致子组件不必要的重渲染。

```typescript
        <section className="flex flex-col gap-4">
          <PriceChart coinId={selectedCoinId} />
          <MarketPie coins={coins} loading={loading} error={error} />
        </section>
```

右列：两个图表垂直排列。`flex flex-col` 是纵向 flex 布局，`gap-4` 是子元素间距 1rem。

PriceChart 接收 `selectedCoinId`——当用户点击表格里的币种 → selectedCoinId 变化 → PriceChart 重渲染 → usePriceHistory(coinId) 检测到 coinId 变了 → 发起新的请求 → 图表更新。

MarketPie 接收 `coins / loading / error`——和 PriceTable 共享同一份数据，但不依赖选中状态。它总是显示 TOP 20 的分布。

### 删除旧文件

```bash
rm -f src/App.css
rm -f src/assets/react.svg src/assets/hero.png
```

Vite 模板带的旧样式和图片。

### 数据流的完整路径

```
页面加载
  → App 挂载
  → useCoins() 发起请求到 CoinGecko
  → 三种状态：loading → coins/error
  → PriceTable 拿到 coins，渲染表格
  → MarketPie 拿到 coins，渲染饼图
  → PriceChart 的 coinId 是 null，显示"请点击币种"

用户点击 Bitcoin 行
  → PriceTable 调用 onSelect("bitcoin")
  → App 的 setSelectedCoinId("bitcoin")
  → selectedCoinId 变成 "bitcoin"
  → App 重渲染
  → PriceTable 的 selectedCoinId 变成 "bitcoin"，Bitcoin 行变蓝
  → PriceChart 的 coinId 变成 "bitcoin"，usePriceHistory 发请求
  → 几秒后 history 数据到达，图表渲染折线
```

---

## 12. 本地验证

### TypeScript 检查

```bash
npx tsc --noEmit
```

预期：无任何输出（无输出 = 无错误）。

### 生产构建

```bash
npm run build
```

预期输出：

```
vite v8.x.x building client environment for production...
✓ 631 modules transformed.
✓ built in 611ms

dist/index.html                   0.46 kB
dist/assets/index-xxx.css         7.12 kB
dist/assets/index-xxx.js       1335.97 kB
```

CSS 只有 7KB（Tailwind 自动删掉了没用的样式）。JS 比较大（1.3MB）因为 ECharts 本身很大——这是正常的，gzip 压缩后约 440KB。

### 功能自测

打开 `http://localhost:5173`，逐项确认：

- [ ] 页面背景是深黑色
- [ ] 顶栏显示 "Crypto Dashboard" 和 "TOP 20 by Market Cap"
- [ ] 左侧表格有 20 行数据，包含图标、名称、价格、涨跌百分比
- [ ] 涨的是绿色带 + 号，跌的是红色
- [ ] 搜索框输入 "bit"，只显示 Bitcoin
- [ ] 点击 Bitcoin 行，该行背景变蓝
- [ ] 右侧上方出现价格折线图
- [ ] 右侧下方显示市值环形饼图
- [ ] 点击另一个币种，图表立即更新

---

## 13. 部署到互联网

### 推到 GitHub

1. 打开 github.com，登录，点右上角 + → New repository
2. Repository name 填 `crypto-dashboard`，选 Public，**不要**勾选 "Add a README file"
3. 点 "Create repository"
4. 页面跳转后，复制它显示的三行命令，在命令行粘贴执行：

```bash
git remote add origin https://github.com/你的用户名/crypto-dashboard.git
git branch -M main
git push -u origin main
```

这三行的意思：
- `git remote add`：给本地 Git 仓库添加一个"远程地址"，之后 push 知道往哪推
- `git branch -M main`：把当前分支重命名为 main
- `git push -u origin main`：把本地所有提交推送到 GitHub

### 部署到 Vercel

1. 打开 vercel.com，用 GitHub 账号登录
2. 点 "Import" → 选择 GitHub 上的 `crypto-dashboard` 仓库
3. Vercel 自动识别出这是 Vite 项目（你不需要改任何配置）
4. 点 "Deploy"
5. 约 30 秒后，出现 "Congratulations!" 和一个 URL

这个 URL 就是线上地址（如 `https://crypto-dashboard-ruddy-sigma.vercel.app`）。任何人在任何地方都能打开。

### Vercel 在背后做了什么

1. 从 GitHub 拉取你的代码
2. 执行 `npm install`（安装依赖）
3. 执行 `npm run build`（构建生产版本）
4. 把 `dist/` 文件夹里的文件分发到全球 CDN
5. 分配一个 `xxx.vercel.app` 域名

之后你每次 `git push`，Vercel 自动重复 1-5，线上自动更新到最新版本。

---

## 14. 面试预演

### 如果你被问到"你是怎么一步步做的"

> 我先去 CoinGecko 网站看了 API 文档，确定免费 API 不需要 Key。然后搭项目——Vite + React + TypeScript。配了 Tailwind 做暗色主题。再定义 Coin 和 PricePoint 两个 TypeScript 接口，保证后续数据链路类型安全。然后写两个 Hook——useCoins 获取 TOP 20，usePriceHistory 获取单币走势，两个 Hook 返回相同的 `{ data, loading, error }` 契约。接着写三个组件——PriceTable 带搜索和高亮，PriceChart 用 ECharts 画折线，MarketPie 用环形图展示市值分布。最后在 App.tsx 里把 selectedCoinId 提升到父组件，实现点击表格联动图表的交互。本地验证没问题后推到 GitHub，在 Vercel 上一键部署。

### 如果你被问到"为什么要这么设计"

**为什么 Hook 返回 `{ data, loading, error }`？**
> "这是状态机模式。消费方不需要知道内部实现，只需要检查三个字段就能覆盖所有 UI 状态。和 React Query / SWR 的设计理念一致。"

**为什么状态提升到 App？**
> "selectedCoinId 被 PriceTable（高亮）和 PriceChart（请求数据）两个兄弟组件共享。状态只能放在最近的公共父组件。这就是 React 官方文档的 Lifting State Up。"

**为什么选 ECharts？**
> "对比了 Chart.js、Recharts、ECharts。Chart.js 配置繁琐，Recharts 是 SVG 渲染大数据量性能不如 Canvas。ECharts 的 Canvas 渲染、内置 tooltip 和渐变填充、对时间序列数据的支持更适合金融场景。"

**为什么用 TypeScript？**
> "两个好处。一是开发时 IDE 实时检查——字段拼错、参数类型不对立刻标红。二是代码自解释——看到 `Coin[]` 就知道是币种数组，不需要读实现。"

### 如果你被问到"遇到过什么困难"

> "两个。一是 CoinGecko 免费 API 限流时返回的不是标准错误码，而是 200 + 一段 HTML——res.json() 解析 HTML 会抛乱码错误。我加了 `res.ok` 提前检查。二是组件卸载后异步请求返回的问题——React 会警告 Can't perform state update on unmounted component。我用 cancelled 标志位在 useEffect 的 cleanup 中解决。"
