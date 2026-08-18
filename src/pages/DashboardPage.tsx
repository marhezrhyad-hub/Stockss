import { AlertTriangle, ArrowRight, Database, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRadar } from '../context/RadarContext';
import type { AssetKind, MarketAsset } from '../types/market';
import { dateTime } from '../utils/format';
import { AssetCard } from '../components/AssetCard';

function RankedSection({ title, kind, description, href }: { title: string; kind: AssetKind; description: string; href: string }) {
  const { assets } = useRadar();
  const ranked = assets.filter((asset) => asset.kind === kind && !asset.disqualified).sort((a, b) => b.score.opportunity - a.score.opportunity).slice(0, 5);
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted">{description}</p></div><Link className="hidden items-center gap-1 text-sm font-semibold text-gain sm:flex" to={href}>Open screener <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="grid gap-4 xl:grid-cols-5">{ranked.map((asset) => <AssetCard key={asset.id} asset={asset} compact />)}</div>
    </section>
  );
}

export function DashboardPage() {
  const { dataset, assets } = useRadar();
  const eligible = assets.filter((asset) => !asset.disqualified);
  const overall = eligible.length ? eligible.reduce((sum, asset) => sum + asset.score.opportunity, 0) / eligible.length : 0;
  const averageRisk = eligible.length ? eligible.reduce((sum, asset) => sum + asset.score.risk, 0) / eligible.length : 0;
  const regimeClass = dataset.marketRegime === 'risk-on' ? 'text-gain' : dataset.marketRegime === 'risk-off' ? 'text-loss' : 'text-amber-300';
  return (
    <>
      <section className="mb-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-panel via-panel to-gain/10 p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gain/20 bg-gain/10 px-3 py-1 text-xs font-semibold text-gain"><TrendingUp className="h-3.5 w-3.5" /> Research signal, not a trade signal</div><h1 className="max-w-3xl text-3xl font-black tracking-[-.04em] sm:text-5xl">Find asymmetric setups.<br/><span className="text-muted">Interrogate the downside.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted">Transparent scoring for speculative stocks, established crypto, and meme coins—built to surface evidence, uncertainty, and thesis-breaking risks.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <Stat icon={TrendingUp} label="Average opportunity" value={`${overall.toFixed(0)}/100`} />
            <Stat icon={ShieldCheck} label="Average risk" value={`${averageRisk.toFixed(0)}/100`} />
            <Stat icon={Database} label="Assets evaluated" value={String(assets.length)} />
            <Stat icon={AlertTriangle} label="Market regime" value={dataset.marketRegime.toUpperCase()} valueClass={regimeClass} />
          </div>
        </div>
      </section>
      {dataset.mode !== 'live' && <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100"><strong>{dataset.mode.toUpperCase()} DATA MODE.</strong> Every sample value is labeled demo data. Add build-time API keys for current provider data. {dataset.errors[0]}</div>}
      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4 text-xs text-muted"><span>Updated: <strong className="text-white">{dateTime(dataset.generatedAt)}</strong></span><span>Regime: <strong className={regimeClass}>{dataset.marketRegime.toUpperCase()}</strong></span><span>{dataset.regimeExplanation}</span></div>
      <RankedSection title="Stock candidates" kind="stock" href="/stocks" description="Fundamentals, catalysts, momentum, liquidity, and separate penalty analysis." />
      <RankedSection title="Established crypto" kind="crypto" href="/crypto" description="Adoption and security carry more weight than short-term momentum." />
      <RankedSection title="Meme-coin scanner" kind="meme" href="/memes" description="Highly speculative. Severe safety flags can disqualify an asset regardless of score." />
    </>
  );
}

function Stat({ icon: Icon, label, value, valueClass = 'text-white' }: { icon: typeof TrendingUp; label: string; value: string; valueClass?: string }) {
  return <div className="min-w-36 rounded-2xl border border-white/5 bg-black/20 p-4"><Icon className="mb-3 h-4 w-4 text-gain" /><p className="text-[10px] uppercase tracking-wider text-muted">{label}</p><p className={`mt-1 text-xl font-black ${valueClass}`}>{value}</p></div>;
}
