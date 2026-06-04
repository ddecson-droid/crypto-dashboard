import { useState } from "react";
import { useCoins } from "./hooks/useCoins";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import MarketPie from "./components/MarketPie";

export default function App() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const { coins, loading, error } = useCoins();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Crypto Dashboard</h1>
        <p className="text-sm text-gray-500">TOP 20 by Market Cap</p>
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
