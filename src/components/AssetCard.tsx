import { Bookmark, BookmarkCheck, ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MarketAsset } from '../types/market';
import { useRadar } from '../context/RadarContext';
import { money, percent } from '../utils/format';
import { DataBadge } from './DataBadge';
import { Metric } from './Metric';
import { RiskGradeBadge, ScoreGauge } from './ScoreGauge';
import { memeRiskLabel } from '../utils/risk';

export function AssetCard({ asset, compact = false }: { asset: MarketAsset; compact?: boolean }) {
  const { isWatched, toggleWatchlist } = useRadar();
  const watched = isWatched(asset.id);
  return (
    <article className="group rounded-2xl border border-line bg-panel p-4 shadow-glow transition hover:border-white/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Link to={`/asset/${asset.id}`} className="min-w-0 focus:outline-none focus:ring-2 focus:ring-gain">
          <div className="mb-1 flex items-center gap-2"><span className="font-black tracking-wide">{asset.symbol}</span><DataBadge asset={asset} /></div>
          <p className="truncate text-sm text-muted">{asset.name}</p>
        </Link>
        <button onClick={() => toggleWatchlist(asset.id)} className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-gain" aria-label={watched ? `Remove ${asset.symbol} from watchlist` : `Add ${asset.symbol} to watchlist`}>
          {watched ? <BookmarkCheck className="h-5 w-5 text-gain" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="text-2xl font-black tracking-tight">{money(asset.price)}</p><p className={`text-sm font-semibold ${(asset.change24h ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>{percent(asset.change24h)} {asset.kind === 'stock' ? 'daily' : '24h'}</p></div>
        <RiskGradeBadge grade={asset.score.riskGrade} risk={asset.score.risk} />
      </div>
      {!compact && <div className="mb-4 grid grid-cols-2 gap-4 border-y border-line py-4 sm:grid-cols-3">
        <Metric label="Market cap" value={money(asset.marketCap, true)} help="Total value of shares or circulating tokens; low price alone does not imply undervaluation." />
        <Metric label="Volume" value={money(asset.volume24h, true)} help="Reported daily or 24-hour trading activity." />
        <Metric label="Momentum" value={asset.momentum === null ? 'Data unavailable' : `${asset.momentum.toFixed(0)}/100`} help="A calculated trend indicator, not a forecast." />
      </div>}
      <div className="flex items-center justify-between gap-4"><ScoreGauge value={asset.score.opportunity} />
        <Link to={`/asset/${asset.id}`} className="flex items-center gap-1 text-sm font-semibold text-gain hover:underline">Research <ChevronRight className="h-4 w-4" /></Link>
      </div>
      {(asset.kind === 'meme' || asset.disqualified) && <div className="mt-4 flex gap-2 rounded-xl border border-loss/20 bg-loss/10 p-3 text-xs text-loss"><TriangleAlert className="h-4 w-4 shrink-0" /><span>{asset.kind === 'meme' ? memeRiskLabel(asset.score.risk, asset.dataQuality) : 'Excluded by one or more quality screens'}{asset.disqualified ? ' — severe warning present.' : '.'}</span></div>}
    </article>
  );
}
