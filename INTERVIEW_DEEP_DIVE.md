# 字节跳动面试——项目深挖完全指南

> 本文档假设你完全不懂前端。从零解释每个概念，然后给出面试时的完美回答。

---

## 目录

1. [虚拟 DOM 与 React 渲染](#1-虚拟-dom-与-react-渲染)
2. [State 与 Props 的本质](#2-state-与-props-的本质)
3. [useEffect 的完整原理](#3-useeffect-的完整原理)
4. [闭包陷阱与 Hooks](#4-闭包陷阱与-hooks)
5. [状态提升的底层逻辑](#5-状态提升的底层逻辑)
6. [自定义 Hook 的设计哲学](#6-自定义-hook-的设计哲学)
7. [useCallback 与性能优化](#7-usecallback-与性能优化)
8. [TypeScript 为什么重要](#8-typescript-为什么重要)
9. [Canvas vs SVG](#9-canvas-vs-svg)
10. [打包过程全解](#10-打包过程全解)
11. [面试完整回答模板](#11-面试完整回答模板)

---

## 1. 虚拟 DOM 与 React 渲染

### 先理解一个比喻

想象你在装修。你想知道"客厅刷白之后好不好看"。你有两种做法：

**做法 A（React 的方式）**：
先画一张草图（虚拟 DOM），看看效果。满意了，再照着草图实际刷墙（更新真实 DOM）。

**做法 B（直接操作 DOM）**：
直接把墙刷白。不满意？再刷回来。不满意？再换颜色。每次都要真的刷。

真实 DOM 操作很慢——浏览器要重新计算布局、重新绘制像素。虚拟 DOM 是"先在脑子里过一遍"，挑出最少要改的地方，一次性改完。

### 虚拟 DOM 长什么样

你的 `App.tsx` 返回的是 JSX：

```jsx
<div className="bg-gray-950">
  <header>CryptoBoard</header>
  <main>...</main>
</div>
```

React 把这套 JSX 转成一个树状的 JS 对象：

```javascript
{
  type: "div",
  props: { className: "bg-gray-950" },
  children: [
    { type: "header", props: {}, children: ["CryptoBoard"] },
    { type: "main", props: {}, children: [...] }
  ]
}
```

这个 JS 对象就是"虚拟 DOM"。它是内存里的一棵树——改它很快，不用触及浏览器的渲染引擎。

### 什么时候触发重渲染

React 的组件重渲染只有一个触发器：**state 变了**。

你的项目里，这些操作会导致重渲染：

| 操作 | 触发位置 | 什么变了 |
|------|---------|---------|
| `setCoins(data)` | useCoins Hook | coins state |
| `setLoading(true)` | useCoins Hook | loading state |
| `setError(msg)` | useCoins Hook | error state |
| `setSearch("bit")` | PriceTable 组件 | search state |
| `setSelectedCoinId("bitcoin")` | App 组件 | selectedCoinId state |
| `setTrigger(t+1)` | useCoins Hook | trigger state |

每一次 setState → React 标记这个组件"脏了" → 重新执行这个函数 → 得到一套新的虚拟 DOM → 和旧的对比 → 只更新不同的部分 → 浏览器只重绘变了的区域。

### 为什么直接改 state 无效

假设你这样写：

```javascript
coins = [newCoin, newCoin2];  // 直接赋值
```

`coins` 确实指向了新数组。但 React 不知道——React 不会监控普通变量的变化。`setCoins(newArray)` 除了更新值，还告诉 React "我变了，请安排一次重渲染"。

**面试时你要说的话**：

> React 用虚拟 DOM 来做增量更新。我的 `App.tsx` 返回的 JSX 会被编译成虚拟 DOM 树。当 `setSelectedCoinId` 被调用时，React 重新执行 App 函数，生成新的虚拟 DOM 树，和旧的对比，只更新变了的部分——比如 PriceTable 里选中行的 class 名、PriceChart 里的 option 对象。

---

## 2. State 与 Props 的本质

### 类比：餐厅点菜

你去餐厅点菜——你点的菜（state）是服务员手里的记录本。每张桌子上的菜单（props）是厨房印好的，不能改。

- **State**：你自己的笔记本。你可以改，但改了得通知服务员。
- **Props**：厨房给的菜单。你只能看，不能在上面写字。

### 你的项目里

**State 的例子**：

```typescript
const [search, setSearch] = useState("");
```

这是 PriceTable 自己的"笔记本"。用户输入 "bit"，`setSearch("bit")` 改了 search。PriceTable 重渲染，搜索框里显示 "bit"，同时 `filtered` 数组只剩 Bitcoin 那一行。

**Props 的例子**：

```typescript
function PriceTable({ coins, loading, error, selectedCoinId, onSelect })
```

这 5 个东西 PriceTable 不能自己改。`coins` 是 App 通过 `useCoins()` 拿到的，通过 props 传给 PriceTable。PriceTable 只是"被动接收者"。

### props 为什么会变

App 里 `coins` state 变了 → App 重渲染 → 重新执行 `{coins: coins}` 传给 PriceTable → PriceTable 发现 coins 的引用变了 → PriceTable 重渲染。

**面试时你要说的话**：

> state 是组件自己的数据，可以改但必须通过 setState。props 是父组件传下来的数据，子组件不能改。在我的项目里，PriceTable 的 `search` 是 state——组件自己管理搜索框内容。而 `coins`、`loading`、`error`、`selectedCoinId` 全是 props——从 App 传下来，PriceTable 只读不写。

---

## 3. useEffect 的完整原理

### 先理解"副作用"

纯函数：输入 A → 一定输出 B。不碰函数以外的任何东西。

```javascript
function add(x, y) { return x + y; }  // 纯的
```

副作用：函数除了返回值，还对函数外的世界有影响。

```javascript
function fetchData() {
  const data = await fetch("url");  // 副作用——网络请求
  document.title = "Hello";          // 副作用——改 DOM
}
```

React 组件本身应该是纯的——输入 props，输出 JSX。但网页总要发请求、改标题、订阅事件。这些东西 React 的渲染流程处理不了——得用 `useEffect`。

### useEffect 的执行时机

组件执行过程分三步：

```
1. React 执行你的组件函数 → 得到 JSX（虚拟 DOM）
2. React 把 JSX 画到屏幕上（真实 DOM）
3. React 执行 useEffect 里的代码    ← 这是副作用阶段
```

**为什么不在组件函数里直接写 fetch**：因为组件函数可能执行多次（重渲染），但你可能只想要一次网络请求。而且组件函数执行到一半可能被 React 中断——异步请求不管这些。

### 依赖数组的三种情况

以你的 useCoins 为例：

```typescript
useEffect(() => {
  // 这里发请求
}, []);  // ← 看这里
```

| 依赖数组 | 什么时候执行 effect | 会有什么问题 |
|---------|-------------------|------------|
| **不传** | 每次渲染后都执行 | 死循环——effect 里 setState → 触发渲染 → 又执行 effect → ... |
| **传 `[]`** | 只在首次渲染后执行一次 | 没问题，适用于"页面加载时拿一次数据" |
| **传 `[coinId]`** | 首次渲染后执行一次，然后 coinId 每次变都执行 | 没问题，适用于"参数变了重新拿数据" |

### Cleanup 函数（你项目里的 cancelled）

```typescript
useEffect(() => {
  let cancelled = false;  // 1. 开始：cancelled = false
  // ...发请求...
  return () => {
    cancelled = true;     // 3. 清理：cancelled = true
  };
}, [coinId]);  // 2. coinId 变了 → React 先执行上次的 cleanup，再执行新的 effect
```

场景模拟：

```
时刻 0：用户进页面，coinId = null → effect 看到 null，不发请求，直接 return
时刻 1：用户点 Bitcoin → coinId = "bitcoin" → effect 开始请求 (cancelled=false)
时刻 2：用户点 Ethereum → coinId 变了
  → React 先执行上次的 cleanup：cancelled = true
  → React 再执行新的 effect：新的 cancelled=false，发 Ethereum 的请求
时刻 3：Bitcoin 的响应返回了 → 检查 cancelled → 是 true → 不更新 state（避免了用错数据）
```

如果不用 cancelled：Ethereum 的响应先到，Bitcoin 的后到——Bitcoin 的数据会覆盖 Ethereum 的，图表显示错。

**面试时你要说的话**：

> useEffect 在组件渲染到屏幕之后执行。我的 usePriceHistory 依赖 `[coinId]`——每次用户点不同币种，React 先执行上一次的清理函数把 cancelled 设为 true，再执行新的 effect 发新请求。这解决了两个问题：组件卸载后不再更新 state（内存泄漏），快速切换币种时旧数据不会覆盖新数据（竞态条件）。

---

## 4. 闭包陷阱与 Hooks

### 什么是闭包（从 Python 角度）

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
counter()  # 1
counter()  # 2
```

`increment` 函数"记得"它出生时的 `count` 变量——即使 `make_counter` 已经执行完了。这就是闭包。

JavaScript 同理：

```javascript
function useCoins() {
  const [coins, setCoins] = useState([]);  // coins 是闭包里的变量
  // useEffect 里的箭头函数"记住"了 coins
}
```

### 什么是"过期闭包"

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log(count);  // 永远打印 0！
    }, 1000);
  }, []);  // 因为 []，这个 effect 只在 mount 时执行
}
```

这个 `console.log(count)` 在组件 mount 时被"拍照"——它永远看到的是初始值 0，即使 `count` 后面变成了 1、2、3。这叫"过期闭包"（stale closure）。

### useCallback 怎么解决

```javascript
const refetch = useCallback(() => {
  setTrigger(t => t + 1);  // 函数式更新：用最新的 t，不依赖闭包
}, []);  // 空依赖没问题，因为用的是 t => t + 1
```

`t => t + 1` 不读闭包里的 `t`，而是读 React 传入的最新值。

**面试时你要说的话**：

> React Hooks 利用闭包来"记住"状态。但闭包有一个陷阱——useEffect 或 useCallback 如果在依赖数组里漏了变量，就会读到过期的值。我在 useCoins 的 refetch 里用的是 `setTrigger(t => t + 1)` 的函数式更新——不读外部闭包，直接拿最新值。这保证了 refetch 的引用永远不变，但每次都能正确触发请求。

---

## 5. 状态提升的底层逻辑

### 为什么兄弟组件不能直接通信

React 的数据流是**单向的**：数据只能从父组件流向子组件（通过 props），不能横向流动。

```
App
 ├── PriceTable   ← 不能直接给 PriceChart 传东西
 └── PriceChart   ← 不能直接给 PriceTable 传东西
```

两个兄弟要通信，唯一的合法方式是：通过它们的公共父组件。

### 你的项目里的完整路径

```
1. 用户在 PriceTable 里点击 Bitcoin 行
   → PriceTable 调用 props.onSelect("bitcoin")
   → PriceTable 不关心 onSelect 做了什么，它只是调用

2. App 里的 onSelect 实际上是 setSelectedCoinId
   → setSelectedCoinId("bitcoin") 被调用
   → React 标记 App "脏了"

3. App 重渲染
   → 重新执行 App 函数
   → selectedCoinId 现在是 "bitcoin"
   → 传给 PriceTable 的 prop: selectedCoinId="bitcoin"
   → 传给 PriceChart 的 prop: coinId="bitcoin"

4. PriceTable 重渲染
   → Bitcoin 行检测到 coin.id === selectedCoinId
   → 加上 "bg-blue-900/30" class → 蓝色高亮

5. PriceChart 重渲染
   → coinId 从 null 变成 "bitcoin"
   → usePriceHistory("bitcoin") 触发 effect
   → 请求 Bitcoin 7 天走势
   → 几秒后 history 数据到达 → 渲染折线图
```

### 为什么不放在 PriceTable 里

如果把 `selectedCoinId` 放在 PriceTable：

```
PriceTable 知道"选了 Bitcoin"
但 PriceChart 不知道！
PriceChart 没有 selectedCoinId → coinId 永远是 null → 图表永远显示"请点击币种"
```

两个选择：
- 把状态放在 PriceTable → PriceChart 用不到 → 图表永远是空白
- 把状态提升到 App → 两个都能用到 → 图表正常联动

### 面试时你要说的话

> 这叫 Lifting State Up。React 数据流是单向的——子组件不能回传给兄弟，只能通过父组件中转。我在 App 里维护 selectedCoinId，通过 props 同时下发给 PriceTable（高亮）和 PriceChart（请求数据）。这种设计让两个组件完全解耦——每个组件只关心"自己要用这个值做什么"，不关心"这个值从哪来"。

---

## 6. 自定义 Hook 的设计哲学

### Hook 的本质

Hook 就是一个普通 JS 函数——但它在函数内部使用了 `useState`、`useEffect` 等 React Hook。因为这个特殊性，React 规定它的名字必须以 `use` 开头。

### 一个好的 Hook 长什么样

**好的设计（你的 useCoins）**：
```
输入：无
输出：{ data, loading, error, refetch }
职责：获取 TOP 20 列表
```

调用方不需要知道内部怎么做的——它用 fetch 还是 axios、数据有没有缓存、错误怎么处理——统统不关心。只关心"我拿到了什么状态"。

**差的设计**：
```
输入：page, limit, currency, order, search, useCache, apiKey...
输出：{ data, loading, error, setData, refetch, retryCount, rawResponse... }
```

暴露太多内部细节。调用方不知道该用哪个字段。改了内部实现，调用方可能崩。

### 为什么是 `{ data, loading, error }` 而不是分别返回

| 设计方案 | 调用方式 |
|---------|---------|
| 分别返回 | `const [coins, setCoins] = useCoins()` — 调用方不知道还有 loading 和 error |
| 对象返回 | `const { coins, loading, error } = useCoins()` — 调用方按需取用 |

对象返回能加新字段而不破坏旧代码：以后加 `refetch`，旧代码不取也不会报错。

### 和 React Query / SWR 的关系

React Query 和 SWR 是两个工业级的请求 Hook 库。它们的核心 API 都是：

```javascript
const { data, isLoading, error } = useQuery(...);
```

和你的 Hook 一模一样。这不是巧合——这是社区公认的最佳实践。

**面试时你要说的话**：

> 自定义 Hook 就是把多个 useState 和 useEffect 打包成一个有意义的抽象。我设计 useCoins 时参考了 React Query 的 API 契约——返回 `{ data, loading, error }` 对象。好处有三个：第一，调用方用不到的不取（flexible destructuring）；第二，Hook 内部实现可以换而不影响调用方（封装）；第三，如果有第二个需要 TOP 20 数据的页面，直接复用这个 Hook 就行（复用性）。

---

## 7. useCallback 与性能优化

### 问题：每次渲染都创建新函数

```typescript
function App() {
  const handleRefresh = () => { refetch(); setSelectedCoinId(null); };
  // ↑ 每次 App 渲染，handleRefresh 都是一个全新创建的函数
}
```

对于 button 的 `onClick`，这完全没问题。但如果 `handleRefresh` 被传给一个用了 `React.memo` 的子组件：

```typescript
const MemoChild = React.memo(function Child({ onClick }) {
  // 只在 props 变化时重渲染
  return <button onClick={onClick}>Click</button>;
});

// 每次 App 渲染 → handleRefresh 是新引用 → MemoChild 觉得 props 变了 → 重渲染
```

`React.memo` 用浅比较检测 props 是否变化。函数是新引用 → props 变化 → 重渲染——即使功能完全一样。

### useCallback 做了什么

```typescript
const handleRefresh = useCallback(() => {
  refetch();
  setSelectedCoinId(null);
}, [refetch]);  // 只有 refetch 变了才重建这个函数
```

`useCallback` 告诉 React："记住这个函数。下次渲染时如果依赖没变，返回同一个引用。"

`refetch` 也是用 `useCallback(() => {}, [])` 创建的——所以它的引用永远不变。因此 `handleRefresh` 的引用也永远不变。

### 不用 useCallback 会怎样（你的项目里）

**答案：不会有任何问题。**

你的 `handleRefresh` 只传给了普通 `<button>`，不是传给 `React.memo` 组件。所以每渲染创建新函数只是浪费了几微秒，用户完全感知不到。

**但为什么还是用了**：考虑将来。万一哪天 PriceTable 被包了 `React.memo`，而且 handleRefresh 被传给了它。那时候如果不加 useCallback，每渲染都会导致 PriceTable 重渲染——但你可能根本不记得改过。useCallback 是"提前防错"。

### useMemo 和 useCallback 的区别

```typescript
// useCallback: 缓存函数本身
const fn = useCallback(() => {}, [dep]);

// useMemo: 缓存计算结果
const value = useMemo(() => expensiveComputation(a, b), [a, b]);

// 等价关系
useCallback(fn, deps) === useMemo(() => fn, deps);
```

### 面试时你要说的话

> React.memo 用 `===` 对比 props。函数在每次渲染中都是新引用——`function(){} === function(){}` 永远是 false。useCallback 让函数引用在依赖不变时保持稳定。我的 `refetch` 用 `useCallback(fn, [])` 创建，所以它的引用从组件创建到销毁永远不变。虽然当前项目里不传子组件所以没有实际性能提升，但这是防御性的代码习惯。

---

## 8. TypeScript 为什么重要

### 它不是在运行时检查

TypeScript 的检查只在**编译时**发生——就是在 `npm run build` 的 `tsc -b` 阶段。打包后的 JS 里，所有类型注解全部消失。

### 它的价值在哪

**场景 1：字段拼错**

```typescript
// 没有 TS
coin.pice  // 拼错了！但 JS 不报错，返回 undefined，页面显示空白

// 有 TS  
coin.pice  // IDE 立刻标红："属性 'pice' 不存在于类型 'Coin'。是否要写 'price'？"
```

你在敲的时候就发现了，不用等浏览器报错。

**场景 2：传参类型不匹配**

```typescript
// 没有 TS
<PriceTable coins="hello" />  // 传了个字符串，但 PriceTable 期待的是数组

// 有 TS
<PriceTable coins="hello" />  // IDE 标红："类型 'string' 不能赋给类型 'Coin[]'"
```

**场景 3：重构**

你把 `Coin.id` 改名叫 `coinId`。TS 自动告诉你 47 处引用了这个字段——全部标红，一个不漏。没有 TS，你只能 `ctrl+F` 手动搜，总会漏一个。

### Interface 就是你项目里的"合同"

```typescript
interface Coin {
  id: string;
  name: string;
  // ...7 个字段
}
```

这份合同说："任何自称 Coin 的东西，必须包含这 7 个字段，且每个字段的类型必须匹配。"所有接受 Coin 的地方——Hook 返回值、组件 Props、map 回调——都自动检查。

### `string | null` 的意义

```typescript
const [error, setError] = useState<string | null>(null);
```

`string | null` 表示：这个变量要么是字符串，要么是 null。TypeScript 会强制你在用 error 之前检查它是不是 null：

```typescript
// TS 会报错
error.toUpperCase();  // error 可能是 null，不能在 null 上调 toUpperCase

// 这样才对
if (error) {
  error.toUpperCase();  // TS 知道进了 if，error 一定是 string
}
```

这防止了 "Cannot read property 'xxx' of null" 这类运行时崩溃。

### 面试时你要说的话

> TypeScript 的价值不在运行时——打包后类型全部擦除。它在开发阶段起作用：拼错字段 IDE 立刻标红、传错类型编译不通过、重构时自动找到所有引用。我的项目里，从 CoinGecko API 返回的 JSON → `interface Coin` 类型定义 → Hook 返回值类型注解 → 组件 Props 定义——整条数据链路都有类型守护，任何一个环节写错都会在 `npm run build` 时暴露。

---

## 9. Canvas vs SVG

### 两个渲染方式

**Canvas**：
像一个真实的画布。你画一个圆圈，它就变成了像素。如果你想删掉这个圆，只能把那块区域所有的像素擦掉重画——因为 Canvas 不记得"这里有个圆"。

```
画布.drawCircle(x=50, y=50, r=20, color=blue)
// 现在画布上 (50,50) 附近区域的像素是蓝色的
// 但画布不知道"这里有个蓝色的圆"
```

**SVG/DOM**：
像贴便利贴。你放一个 `<circle>` 元素，它是一个独立的 DOM 节点。你可以给它加事件、改颜色、删掉它——浏览器知道它是谁。

```html
<circle cx="50" cy="50" r="20" fill="blue">
```
这是一个真实的 DOM 元素，和 `<div><button>` 一样的公民。

### 为什么 ECharts 选 Canvas

100 个数据点：
- Canvas：在画布上画 100 次 → 产生像素 → 1 个元素
- SVG：创建 100 个 `<circle>` 元素 → 100 个 DOM 节点

2000 个数据点：
- Canvas：画 2000 次 → 还是 1 个元素 → 和 100 个点时速度差不多
- SVG：2000 个 DOM 节点 → 浏览器管理 2000 个元素的布局、事件、样式 → 卡顿

你的 7 天走势图有几百个价格点——Canvas 能流畅处理，SVG 可能会卡。

### 为什么 Recharts（SVG）也能用

数据量小的时候（几十个点），SVG 的优势就出来了——每个点、每条线都是一个独立元素，可以单独绑定事件，做丰富的交互。而且 SVG 适配响应式更自然（它本身就是矢量图）。

**面试时你要说的话**：

> ECharts 用 Canvas 渲染。Canvas 把图表画成像素——不保留每个元素的独立信息。优点是数据点多时性能好——不需要维护几百个 DOM 节点。Recharts 用 SVG——每个点、线、色块都是独立的 DOM 元素，交互性好但大数据量会卡。对于金融数据（几百个价格时间点），Canvas 更合适。

---

## 10. 打包过程全解

### `npm run build` 做了什么

你的 `package.json` 里：

```json
"build": "tsc -b && vite build"
```

这行命令分两步。

#### 第一步：`tsc -b`

TypeScript 编译器检查你所有的 `.ts` 和 `.tsx` 文件。如果发现类型错误（比如把 `number` 传给了期待 `string` 的地方），打印错误并停止。如果通过，不生成任何文件（`--noEmit` 是默认行为）。

#### 第二步：`vite build`

Vite 用 Rollup 做打包。Rollup 做了这些事：

1. **从入口文件开始**：读 `index.html` → 找到 `<script src="/src/main.tsx">` 
2. **追踪依赖链**：`main.tsx` 导入 `App.tsx` → `App.tsx` 导入 `useCoins`、`PriceTable`... → 一直追到 `echarts`、`react` 这些 `node_modules` 里的包
3. **合并成一个文件**：把所有模块的代码串到一起，去掉 `import/export` 语句（打包后没有模块了，是一个大文件）
4. **压缩**：删掉所有注释和空格，把 `selectedCoinId` 这样的长变量名缩成 `a`、`b`、`c`
5. **Tree-shaking**：检测哪些代码从未被用到，删掉。比如 Tailwind 只保留你用过的 class，没用过的全部丢弃
6. **输出到 `dist/` 文件夹**

产物：

```
dist/
├── index.html                    0.46 KB（入口 HTML）
├── assets/index-xxx.css          7.12 KB（Tailwind 编译后的 CSS，只包含你用过的 class）
└── assets/index-xxx.js        1335.97 KB（所有 JS，gzip 后 440 KB）
```

### 为什么 JS 这么大

ECharts 本身就很大——它包含了所有图表类型（折线、柱状、饼图、雷达、地理...）。Vite 没有做 tree-shaking ECharts，因为 `echarts-for-react` 把整个 ECharts 导入了。

优化的方式是按需引入：只 import 你用到的图表类型（LineChart、PieChart），而不是整个 ECharts。但这需要额外配置——对于面试 demo 没必要。

### Vercel 拿到 dist 后做了什么

1. 把 `dist/` 里的文件上传到 Vercel 的 CDN
2. 分配一个 `xxx.vercel.app` 的域名
3. 配置 DNS：用户访问这个域名 → CDN 返回 `index.html` → 浏览器解析 → 下载 JS 和 CSS → React 启动

### 面试时你要说的话

> `npm run build` 做了两件事。`tsc -b` 做类型检查——代码有类型错误这步就过不去。`vite build` 做打包——把所有 `.tsx` 文件连同 `node_modules` 里的依赖合并成一个压缩的 JS 文件。Tailwind 在这步做 tree-shaking——只保留源码里用过的 class，CSS 从几百 KB 变成 7KB。但 ECharts 没做按需引入，所以 JS 有 1.3MB——这在面试 demo 中可接受，生产环境可以优化。

---

## 11. 面试完整回答模板

### Q：讲一下你这个看板项目

> 这是一个加密货币行情看板，基于 React + TypeScript + ECharts 独立开发。数据源是 CoinGecko 的免费 API，不需要 Key。我封装了两个自定义 Hook——useCoins 拉 TOP 20 列表，usePriceHistory 拉单个币种的 7 天走势。前端三个组件——PriceTable 展示列表带搜索，PriceChart 用 ECharts 画折线图，MarketPie 画环形饼图。最大的设计点是状态提升——把 selectedCoinId 放在 App 层，点表格里的币种，右边的图表联动更新。部署在 Vercel，源码在 GitHub。

### Q：你项目里状态提升怎么做的

> selectedCoinId 放在 App 里，因为 PriceTable 和 PriceChart 两个兄弟组件都需要它。PriceTable 用它高亮选中行，PriceChart 用它决定展示哪个币的走势。React 数据流是单向的——子组件之间不能直接通信，必须通过公共父组件中转。这就是 Lifting State Up。

### Q：useEffect 的依赖数组你在项目里怎么用的

> useCoins 用 `[]`——TOP 20 列表挂载时请求一次就行，不需要反复拉。usePriceHistory 用 `[coinId]`——用户每次点新币种，依赖变化，React 先执行上一次的 cleanup（把 cancelled 设为 true），再执行新的 effect 发请求。这防止了快速切换币种时旧数据覆盖新数据。

### Q：如果让你重新做，你会改进什么

> 三个点。第一，useMemo 缓存 ECharts 的 option 对象——当前每次渲染都重建 option，虽然性能影响不大但不是好习惯。第二，ECharts 按需引入——只 import LineChart 和 PieChart，打包体积能砍三分之二。第三，加单元测试——用 Vitest 测试两个 Hook 的 loading/error/data 三种状态切换，确保 cancelled 逻辑覆盖。

### Q：你遇到什么技术难点

> 两个。一个是 CoinGecko 限流时不返回标准 429 而是返回 200 + HTML，`res.json()` 解析 HTML 报乱码错。我在 `res.ok` 检查后提前抛错解决。第二个是组件卸载后的内存泄漏——用户在数据返回前离开页面，fetch 请求还在进行，返回后调用 setState 会报警告。我用 cancelled 标志位在 useEffect 的 cleanup 里设置，所有 setState 前检查 cancelled。

---

## 速查：核心术语翻译表

| 术语 | 一句话解释 |
|------|-----------|
| 虚拟 DOM | 内存里的 UI 草稿，对比后只改真实 DOM 的不同部分 |
| JSX | 在 JavaScript 里写 HTML 的语法，`<div>` 最终变 `React.createElement('div')` |
| State | 组件自己的数据，改了触发重渲染 |
| Props | 父组件传给子组件的数据，只读 |
| useEffect | 组件渲染到屏幕后执行的副作用（网络请求、订阅、手动改 DOM） |
| 依赖数组 | 告诉 React"这些变了就重新执行 effect" |
| Cleanup | effect 重新执行前/组件卸载时的清理函数 |
| 状态提升 | 把 state 从子组件上提到公共父组件，让兄弟都能用 |
| useCallback | 缓存函数引用，依赖不变返回同一个引用 |
| useMemo | 缓存计算结果，依赖不变返回同一个值 |
| 受控组件 | 值由 React state 控制的表单元素 |
| 闭包 | 函数记住它出生时的变量 |
| 过期闭包 | effect 里读到的是旧的变量值，因为依赖数组漏了 |
| Canvas | 像素级渲染，适合大数据量图表 |
| SVG | 独立元素级渲染，每个图元是 DOM 节点 |
| Tree-shaking | 打包时自动删除未用到的代码 |
