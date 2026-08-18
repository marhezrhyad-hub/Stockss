import { AlertTriangle, BrainCircuit } from 'lucide-react';
import { useRadar } from '../context/RadarContext';
import type { StockAsset } from '../types/market';
import { money, number, percent } from '../utils/format';
import { AssetCard } from '../components/AssetCard';
import { Metric } from '../components/Metric';

function retailSetupScore(asset: StockAsset): number {
  const inputs = [asset.shortInterest, asset.daysToCover === null ? null : asset.daysToCover * 10, asset.relativeVolume === null ? null : asset.relativeVolume * 25, asset.retailAttention, asset.optionsActivity, asset.searchMomentum, asset.socialMomentum];
  const present = inputs.filter((value): value is number => value !== null);
  return present.length ? Math.min(100, present.reduce((sum, value) => sum + value, 0) / present.length) : 0;
}

export function DumbMoneyPage() {
  const { assets } = useRadar();
  const setups = (assets.filter((asset): asset is StockAsset => asset.kind === 'stock' && !asset.disqualified)).sort((a, b) => retailSetupScore(b) - retailSetupScore(a));
  return (
    <>
      <header className="mb-6"><div className="mb-2 flex items-center gap-3"><BrainCircuit className="h-7 w-7 text-gain" /><h1 className="text-3xl font-black tracking-tight">Retail-driven setup detector</h1></div><p className="max-w-4xl text-sm leading-6 text-muted">Looks for unusual combinations of short interest, limited float, relative volume, retail attention, and catalysts. It does not predict a squeeze and never asks users to coordinate purchases.</p></header>
      <div className="mb-8 flex gap-3 rounded-2xl border border-loss/20 bg-loss/10 p-4 text-sm text-red-100"><AlertTriangle className="h-5 w-5 shrink-0 text-loss" /><p><strong>High-risk asymmetric setups.</strong> “Potential squeeze conditions” are not confirmation. Dilution, weak balance sheets, missing borrow data, or a failed catalyst can invalidate the thesis.</p></div>
      <div className="space-y-5">{setups.map((asset) => (
        <section key={asset.id} className="grid gap-4 rounded-2xl border border-line bg-panel p-4 xl:grid-cols-[330px_1fr]">
          <AssetCard asset={asset} compact />
          <div><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-muted">Retail setup indicator</p><p className="text-2xl font-black">{retailSetupScore(asset).toFixed(0)}/100</p></div><div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">Potential squeeze conditions — not a prediction</div></div>
            <div className="grid grid-cols-2 gap-4 border-y border-line py-4 sm:grid-cols-4 lg:grid-cols-7">
              <Metric label="Short interest" value={percent(asset.shortInterest)} help="Shares sold short as a percentage of public float." />
              <Metric label="Days to cover" value={number(asset.daysToCover)} help="Short interest divided by typical daily share volume." />
              <Metric label="Public float" value={number(asset.publicFloat, true)} />
              <Metric label="Relative volume" value={asset.relativeVolume === null ? 'Data unavailable' : `${asset.relativeVolume.toFixed(1)}×`} />
              <Metric label="Retail attention" value={number(asset.retailAttention)} />
              <Metric label="Dollar liquidity" value={money(asset.avgDailyDollarVolume, true)} />
              <Metric label="Dilution risk" value={asset.dilutionRisk.toUpperCase()} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><Callout title="Evidence" text={asset.relativeVolume && asset.relativeVolume > 2 ? 'Unusual volume and elevated retail attention.' : 'Retail interest present; volume confirmation is limited.'} /><Callout title="Catalyst status" text={asset.catalysts.length ? asset.catalysts[0] : 'No confirmed catalyst.'} /><Callout title="Invalidation" text={asset.dilutionRisk === 'high' ? 'Dilution may invalidate the thesis.' : asset.invalidationPoints[0]} /></div>
          </div>
        </section>
      ))}</div>
    </>
  );
}

function Callout({ title, text }: { title: string; text: string }) { return <div className="rounded-xl bg-black/20 p-3"><p className="mb-1 text-[10px] uppercase tracking-wider text-muted">{title}</p><p>{text}</p></div>; }
