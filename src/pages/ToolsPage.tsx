import { useMemo, useState } from 'react';
import { Calculator, Plus, Trash2, TriangleAlert, WalletCards } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useRadar } from '../context/RadarContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { money } from '../utils/format';

interface PaperPosition { id: string; assetId: string; quantity: number; entryPrice: number; }

export function ToolsPage() {
  const { assets } = useRadar();
  const [positions, setPositions] = useLocalStorage<PaperPosition[]>('breakout-radar-paper-portfolio', []);
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [entryPrice, setEntryPrice] = useState(assets[0]?.price ?? 0);
  const current = assets.find((asset) => asset.id === assetId);
  const rows = positions.map((position) => ({ ...position, asset: assets.find((asset) => asset.id === position.assetId) })).filter((row) => row.asset);
  const totalValue = rows.reduce((sum, row) => sum + (row.asset?.price ?? 0) * row.quantity, 0);
  const allocation = useMemo(() => ['stock', 'crypto', 'meme'].map((kind) => ({ name: kind, value: rows.filter((row) => row.asset?.kind === kind).reduce((sum, row) => sum + (row.asset?.price ?? 0) * row.quantity, 0) })).filter((item) => item.value > 0), [rows]);
  const maxAllocation = totalValue ? Math.max(0, ...rows.map((row) => ((row.asset?.price ?? 0) * row.quantity) / totalValue * 100)) : 0;
  const add = () => {
    if (!assetId || quantity <= 0 || entryPrice < 0) return;
    setPositions((items) => [...items, { id: crypto.randomUUID(), assetId, quantity, entryPrice }]);
  };
  return (
    <>
      <header className="mb-7"><div className="mb-2 flex items-center gap-3"><WalletCards className="h-7 w-7 text-gain"/><h1 className="text-3xl font-black">Paper portfolio & risk tools</h1></div><p className="max-w-3xl text-sm leading-6 text-muted">Educational calculators only. This portfolio is local to your browser and cannot connect to a brokerage or execute trades.</p></header>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card"><h2 className="section-title">Paper-trading portfolio</h2><div className="grid gap-3 sm:grid-cols-4"><label className="sm:col-span-2"><span className="label">Asset</span><select className="input" value={assetId} onChange={(e) => { setAssetId(e.target.value); setEntryPrice(assets.find((a) => a.id === e.target.value)?.price ?? 0); }}>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.symbol} — {asset.name}</option>)}</select></label><NumberInput label="Quantity" value={quantity} onChange={setQuantity}/><NumberInput label="Paper entry" value={entryPrice} onChange={setEntryPrice}/><button className="button-primary sm:col-span-4" onClick={add}><Plus className="h-4 w-4"/>Add paper position</button></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="py-3">Asset</th><th>Quantity</th><th>Entry</th><th>Current</th><th>Paper P/L</th><th></th></tr></thead><tbody>{rows.map((row) => { const price = row.asset?.price ?? 0; const pnl = (price - row.entryPrice) * row.quantity; return <tr key={row.id} className="border-b border-line/60"><td className="py-4 font-bold">{row.asset?.symbol} <span className="font-normal text-muted">{row.asset?.isDemo ? '(demo)' : ''}</span></td><td>{row.quantity}</td><td>{money(row.entryPrice)}</td><td>{money(price)}</td><td className={pnl >= 0 ? 'text-gain' : 'text-loss'}>{money(pnl)}</td><td><button className="p-2 text-muted hover:text-loss" onClick={() => setPositions((items) => items.filter((item) => item.id !== row.id))} aria-label="Remove paper position"><Trash2 className="h-4 w-4"/></button></td></tr>})}</tbody></table>{!rows.length && <p className="py-8 text-center text-sm text-muted">No paper positions yet.</p>}</div></section>
        <section className="card"><h2 className="section-title">Diversification</h2><div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>{allocation.map((_, index) => <Cell key={index} fill={['#41e68c', '#65a7ff', '#ff6474'][index % 3]}/>)}</Pie><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: '#101411', border: '1px solid #253028', borderRadius: 12 }}/></PieChart></ResponsiveContainer></div><div className="flex justify-between text-sm"><span className="text-muted">Paper value</span><strong>{money(totalValue)}</strong></div>{maxAllocation > 35 && <Warning>Concentration warning: the largest position is {maxAllocation.toFixed(0)}% of this paper portfolio.</Warning>}{rows.some((row) => row.asset?.kind === 'meme') && <Warning>Volatility warning: meme-token exposure can experience near-total losses and failing liquidity.</Warning>}</section>
      </div>
      <Calculators defaultPrice={current?.price ?? 10}/>
    </>
  );
}

function Calculators({ defaultPrice }: { defaultPrice: number }) {
  const [account, setAccount] = useState(25_000); const [riskPct, setRiskPct] = useState(1); const [entry, setEntry] = useState(defaultPrice); const [stop, setStop] = useState(defaultPrice * 0.85); const [target, setTarget] = useState(defaultPrice * 1.3); const [probability, setProbability] = useState(40);
  const maxLoss = account * riskPct / 100; const riskPerUnit = Math.max(0, entry - stop); const units = riskPerUnit > 0 ? Math.floor(maxLoss / riskPerUnit) : 0; const reward = Math.max(0, target - entry); const ratio = riskPerUnit > 0 ? reward / riskPerUnit : 0; const expected = (probability / 100 * reward) - ((100 - probability) / 100 * riskPerUnit);
  return <section className="card mt-6"><h2 className="section-title flex items-center gap-2"><Calculator className="h-5 w-5 text-gain"/>Position size, maximum loss & scenarios</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"><NumberInput label="Paper account ($)" value={account} onChange={setAccount}/><NumberInput label="Maximum loss (%)" value={riskPct} onChange={setRiskPct}/><NumberInput label="Entry price" value={entry} onChange={setEntry}/><NumberInput label="Invalidation / stop" value={stop} onChange={setStop}/><NumberInput label="Best-case price" value={target} onChange={setTarget}/><NumberInput label="Best-case probability (%)" value={probability} onChange={setProbability}/></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Result label="Maximum planned loss" value={money(maxLoss)}/><Result label="Calculated units" value={String(units)}/><Result label="Reward / risk" value={`${ratio.toFixed(2)}×`}/><Result label="Expected value per unit" value={money(expected)}/></div><p className="mt-4 text-xs leading-5 text-muted">Calculation: max loss = paper account × risk %. Units = max loss ÷ (entry − invalidation). Expected value = probability × upside − loss probability × downside. These inputs are assumptions, not price targets or execution instructions. Stops may fail in gaps or illiquid markets.</p></section>;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label><span className="label">{label}</span><input className="input" type="number" min="0" step="any" value={value} onChange={(e) => onChange(Number(e.target.value))}/></label>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-line bg-black/20 p-4"><p className="label">{label}</p><p className="text-xl font-black">{value}</p></div>; }
function Warning({ children }: { children: React.ReactNode }) { return <div className="mt-4 flex gap-2 rounded-xl bg-loss/10 p-3 text-xs text-loss"><TriangleAlert className="h-4 w-4 shrink-0"/>{children}</div>; }
