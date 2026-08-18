import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { MarketAsset, MarketDataset } from '../types/market';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RadarContextValue {
  dataset: MarketDataset;
  assets: MarketAsset[];
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
}

const RadarContext = createContext<RadarContextValue | null>(null);

export function RadarProvider({ dataset, children }: { dataset: MarketDataset; children: ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('breakout-radar-watchlist', []);
  const value = useMemo<RadarContextValue>(() => ({
    dataset,
    assets: dataset.assets,
    watchlist,
    toggleWatchlist: (id) => setWatchlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    isWatched: (id) => watchlist.includes(id),
  }), [dataset, setWatchlist, watchlist]);
  return <RadarContext.Provider value={value}>{children}</RadarContext.Provider>;
}

export function useRadar() {
  const context = useContext(RadarContext);
  if (!context) throw new Error('useRadar must be used inside RadarProvider');
  return context;
}
