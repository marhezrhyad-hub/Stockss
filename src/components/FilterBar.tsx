import { RotateCcw, Search } from 'lucide-react';
import type { FilterState, MarketAsset, RiskGrade } from '../types/market';

export const emptyFilters: FilterState = { search: '', maxPrice: null, maxMarketCap: null, minVolume: null, maxRisk: 'all', category: 'all', minShortInterest: null, minMomentum: null, timeHorizon: 'all', exchange: 'all', dataQuality: 'all' };

const riskOrder: RiskGrade[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export function filterAssets(assets: MarketAsset[], filters: FilterState): MarketAsset[] {
  return assets.filter((asset) => {
    const term = filters.search.toLowerCase().trim();
    if (term && !`${asset.symbol} ${asset.name} ${asset.category}`.toLowerCase().includes(term)) return false;
    if (filters.maxPrice !== null && (asset.price === null || asset.price > filters.maxPrice)) return false;
    if (filters.maxMarketCap !== null && (asset.marketCap === null || asset.marketCap > filters.maxMarketCap)) return false;
    if (filters.minVolume !== null && (asset.avgDailyDollarVolume === null || asset.avgDailyDollarVolume < filters.minVolume)) return false;
    if (filters.maxRisk !== 'all' && riskOrder.indexOf(asset.score.riskGrade) > riskOrder.indexOf(filters.maxRisk)) return false;
    if (filters.category !== 'all' && asset.category !== filters.category) return false;
    if (filters.minShortInterest !== null && (asset.kind !== 'stock' || asset.shortInterest === null || asset.shortInterest < filters.minShortInterest)) return false;
    if (filters.minMomentum !== null && (asset.momentum === null || asset.momentum < filters.minMomentum)) return false;
    if (filters.timeHorizon !== 'all' && asset.timeHorizon !== filters.timeHorizon) return false;
    if (filters.exchange !== 'all' && asset.exchange !== filters.exchange) return false;
    if (filters.dataQuality !== 'all' && asset.dataQuality !== filters.dataQuality) return false;
    return true;
  });
}

export function FilterBar({ assets, value, onChange, showShortInterest = false }: { assets: MarketAsset[]; value: FilterState; onChange: (next: FilterState) => void; showShortInterest?: boolean }) {
  const categories = [...new Set(assets.map((a) => a.category))].sort();
  const exchanges = [...new Set(assets.map((a) => a.exchange))].sort();
  const set = <K extends keyof FilterState>(key: K, next: FilterState[K]) => onChange({ ...value, [key]: next });
  const numberOrNull = (raw: string) => raw ? Number(raw) : null;
  return (
    <section className="mb-6 rounded-2xl border border-line bg-panel p-4" aria-label="Research filters">
      <div className="mb-3 flex items-center gap-2"><Search className="h-4 w-4 text-gain" /><h2 className="text-sm font-bold">Search & filters</h2><button className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-white" onClick={() => onChange(emptyFilters)}><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="lg:col-span-2"><span className="sr-only">Search assets</span><input className="input" placeholder="Symbol, name, category…" value={value.search} onChange={(e) => set('search', e.target.value)} /></label>
        <label><span className="label">Maximum price</span><select className="input" value={value.maxPrice ?? ''} onChange={(e) => set('maxPrice', numberOrNull(e.target.value))}><option value="">Any price</option><option value="5">Under $5</option><option value="10">Under $10</option><option value="20">Under $20</option></select></label>
        <label><span className="label">Maximum market cap</span><select className="input" value={value.maxMarketCap ?? ''} onChange={(e) => set('maxMarketCap', numberOrNull(e.target.value))}><option value="">Any size</option><option value="300000000">$300M</option><option value="2000000000">$2B</option><option value="10000000000">$10B</option></select></label>
        <label><span className="label">Minimum dollar volume</span><select className="input" value={value.minVolume ?? ''} onChange={(e) => set('minVolume', numberOrNull(e.target.value))}><option value="">Any volume</option><option value="500000">$500K</option><option value="5000000">$5M</option><option value="50000000">$50M</option></select></label>
        <label><span className="label">Maximum risk grade</span><select className="input" value={value.maxRisk} onChange={(e) => set('maxRisk', e.target.value as FilterState['maxRisk'])}><option value="all">All risks</option>{riskOrder.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label><span className="label">Category</span><select className="input" value={value.category} onChange={(e) => set('category', e.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span className="label">Momentum</span><select className="input" value={value.minMomentum ?? ''} onChange={(e) => set('minMomentum', numberOrNull(e.target.value))}><option value="">Any momentum</option><option value="50">50+</option><option value="70">70+</option><option value="85">85+</option></select></label>
        {showShortInterest && <label><span className="label">Short interest</span><select className="input" value={value.minShortInterest ?? ''} onChange={(e) => set('minShortInterest', numberOrNull(e.target.value))}><option value="">Any</option><option value="10">10%+</option><option value="20">20%+</option><option value="30">30%+</option></select></label>}
        <label><span className="label">Time horizon</span><select className="input" value={value.timeHorizon} onChange={(e) => set('timeHorizon', e.target.value as FilterState['timeHorizon'])}><option value="all">Any horizon</option><option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option><option value="years">Years</option></select></label>
        <label><span className="label">Exchange</span><select className="input" value={value.exchange} onChange={(e) => set('exchange', e.target.value)}><option value="all">All exchanges</option>{exchanges.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span className="label">Data quality</span><select className="input" value={value.dataQuality} onChange={(e) => set('dataQuality', e.target.value as FilterState['dataQuality'])}><option value="all">Any quality</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="insufficient">Insufficient</option></select></label>
      </div>
      <p className="mt-3 text-xs text-muted">Low share price does not automatically mean a company is undervalued. Market capitalization, enterprise value, balance sheet, dilution, and liquidity matter.</p>
    </section>
  );
}
