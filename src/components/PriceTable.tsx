import { useState } from "react";
import type { Coin } from "../types/coin";

interface Props {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  selectedCoinId: string | null;
  onSelect: (coinId: string) => void;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export default function PriceTable({
  coins,
  loading,
  error,
  selectedCoinId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  if (loading) {
    return <p className="text-center text-gray-400 py-8">Loading coins...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 py-8">Error: {error}</p>;
  }

  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search coins..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
      />

      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-2 pr-2 w-8">#</th>
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="py-2 pr-2 text-right">24h %</th>
              <th className="py-2 text-right hidden md:table-cell">Market Cap</th>
            </tr>
          </thead>
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
                  <td className="py-3 pr-2 text-gray-500">{index + 1}</td>
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
                  <td className="py-3 pr-2 text-right font-mono">
                    $
                    {coin.current_price < 0.01
                      ? coin.current_price.toFixed(6)
                      : coin.current_price.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 pr-2 text-right font-mono ${
                      change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change?.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right text-gray-400 hidden md:table-cell font-mono">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No coins found.</p>
        )}
      </div>
    </div>
  );
}
