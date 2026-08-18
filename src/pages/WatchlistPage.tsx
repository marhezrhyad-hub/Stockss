import { Bookmark } from 'lucide-react';
import { AssetCard } from '../components/AssetCard';
import { EmptyState } from '../components/States';
import { useRadar } from '../context/RadarContext';

export function WatchlistPage() {
  const { assets, watchlist } = useRadar();
  const watched = assets.filter((asset) => watchlist.includes(asset.id));
  return <><header className="mb-6"><div className="mb-2 flex items-center gap-3"><Bookmark className="h-6 w-6 text-gain"/><h1 className="text-3xl font-black">Personal watchlist</h1></div><p className="text-sm text-muted">Saved only in this browser. A watchlist is a research queue, not a recommendation list.</p></header>{watched.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{watched.map((asset) => <AssetCard key={asset.id} asset={asset}/>)}</div> : <EmptyState title="Your watchlist is empty" message="Use the bookmark button on any asset card to save it here." />}</>;
}
