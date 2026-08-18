import type { MarketAsset } from '../types/market';

export function DataBadge({ asset }: { asset: MarketAsset }) {
  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${asset.isDemo ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : asset.stale ? 'border-loss/30 bg-loss/10 text-loss' : 'border-gain/30 bg-gain/10 text-gain'}`}>
      {asset.isDemo ? 'Demo data' : asset.stale ? 'Stale data' : `${asset.dataQuality} quality`}
    </span>
  );
}
