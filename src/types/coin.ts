// ====== 数据类型定义 ======
// 这两个 interface 定义了项目中所有数据的"形状"
// interface 只在写代码时起作用，打包后的 JS 里不存在
// 它的价值：拼错字段名 IDE 立刻标红，不用等浏览器报错

/** 单个加密货币的信息，字段直接映射 CoinGecko API 返回的 JSON */
export interface Coin {
  id: string; // CoinGecko 内部 ID，如 "bitcoin"
  name: string; // 人类可读名称，如 "Bitcoin"
  symbol: string; // 交易代码，如 "btc"
  image: string; // 币种图标的 URL
  current_price: number; // 当前美元价格
  price_change_percentage_24h: number; // 24 小时涨跌百分比
  market_cap: number; // 总市值（美元）
}

/** 价格走势图上的一个数据点 */
export interface PricePoint {
  timestamp: number; // Unix 毫秒时间戳（如 1686009600000 = 2023-06-06）
  price: number; // 该时刻的美元价格
}
