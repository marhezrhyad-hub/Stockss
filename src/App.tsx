import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingState } from './components/States';
import { RadarProvider } from './context/RadarContext';
import { loadMarketData } from './data/loadMarketData';
import type { MarketDataset } from './types/market';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { DumbMoneyPage } from './pages/DumbMoneyPage';
import { ScreenerPage } from './pages/ScreenerPage';
import { ToolsPage } from './pages/ToolsPage';
import { WatchlistPage } from './pages/WatchlistPage';

export default function App() {
  const [dataset, setDataset] = useState<MarketDataset | null>(null);
  useEffect(() => { void loadMarketData().then(setDataset); }, []);
  if (!dataset) return <LoadingState />;
  return (
    <RadarProvider dataset={dataset}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/stocks" element={<ScreenerPage kind="stock" />} />
            <Route path="/dumb-money" element={<DumbMoneyPage />} />
            <Route path="/crypto" element={<ScreenerPage kind="crypto" />} />
            <Route path="/memes" element={<ScreenerPage kind="meme" />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/asset/:id" element={<AssetDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </RadarProvider>
  );
}
