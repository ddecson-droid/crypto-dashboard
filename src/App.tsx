import { useState, useCallback } from "react";
import { useCoins } from "./hooks/useCoins";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import MarketPie from "./components/MarketPie";

export default function App() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const { coins, loading, error, refetch } = useCoins();

  const handleRefresh = useCallback(() => {
    refetch();
    setSelectedCoinId(null);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">CryptoBoard</h1>
          <p className="text-sm text-gray-500">TOP 20 by Market Cap</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 p-4 max-w-7xl mx-auto">
        {/* Left: Price Table */}
        <section>
          <PriceTable
            coins={coins}
            loading={loading}
            error={error}
            selectedCoinId={selectedCoinId}
            onSelect={setSelectedCoinId}
          />
        </section>

        {/* Right: Charts */}
        <section className="flex flex-col gap-4">
          <PriceChart coinId={selectedCoinId} />
          <MarketPie coins={coins} loading={loading} error={error} />
        </section>
      </main>
    </div>
  );
}
