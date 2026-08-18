import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Bitcoin, ShieldAlert } from 'lucide-react';
import { useRadar } from '../context/RadarContext';
import type { AssetKind, FilterState } from '../types/market';
import { AssetCard } from '../components/AssetCard';
import { EmptyState } from '../components/States';
import { emptyFilters, FilterBar, filterAssets } from '../components/FilterBar';

const meta: Record<AssetKind, { title: string; description: string; icon: typeof BarChart3; note: string }> = {
  stock: { title: 'Emerging-stock screener', icon: BarChart3, description: 'Lower price and smaller capitalization can amplify upside and downside. Rankings reward evidence and penalize fragility.', note: 'OTC, bankrupt, halted, extremely illiquid, and severe-quality setups are excluded or visibly penalized.' },
  crypto: { title: 'Established crypto research', icon: Bitcoin, description: 'Network usage, liquidity, tokenomics, development, and security—not slogans or social attention.', note: 'Protocol, custody, regulatory, and market-structure risks can create rapid and permanent losses.' },
  meme: { title: 'Meme-coin risk scanner', icon: ShieldAlert, description: 'Momentum is evaluated only after liquidity, contract safety, holder distribution, and data quality.', note: 'No meme coin is safe. Missing contract evidence should be treated as risk, not reassurance.' },
};

export function ScreenerPage({ kind }: { kind: AssetKind }) {
  const { assets } = useRadar();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const universe = useMemo(() => assets.filter((asset) => asset.kind === kind), [assets, kind]);
  const results = useMemo(() => filterAssets(universe, filters).sort((a, b) => Number(a.disqualified) - Number(b.disqualified) || b.score.opportunity - a.score.opportunity), [universe, filters]);
  const { title, description, icon: Icon, note } = meta[kind];
  return (
    <>
      <header className="mb-6"><div className="mb-2 flex items-center gap-3"><Icon className="h-6 w-6 text-gain" /><h1 className="text-3xl font-black tracking-tight">{title}</h1></div><p className="max-w-3xl text-sm leading-6 text-muted">{description}</p></header>
      <div className="mb-6 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" /><p>{note}</p></div>
      <FilterBar assets={universe} value={filters} onChange={setFilters} showShortInterest={kind === 'stock'} />
      <div className="mb-4 flex items-center justify-between text-xs text-muted"><span>{results.length} of {universe.length} assets</span><span>Ranked by opportunity; risk shown separately</span></div>
      {results.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((asset) => <AssetCard key={asset.id} asset={asset} />)}</div> : <EmptyState />}
    </>
  );
}
