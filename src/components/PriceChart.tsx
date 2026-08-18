import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PricePoint } from '../types/market';
import { money } from '../utils/format';

export function PriceChart({ data }: { data: PricePoint[] }) {
  if (!data.length) return <div className="grid h-72 place-items-center rounded-xl border border-dashed border-line text-sm text-muted">Price history: Data unavailable</div>;
  return (
    <div className="h-72 w-full" aria-label="Historical price chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#41e68c" stopOpacity={0.28}/><stop offset="95%" stopColor="#41e68c" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid stroke="#253028" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" stroke="#98a39b" tickLine={false} axisLine={false} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} minTickGap={28} fontSize={11} />
          <YAxis stroke="#98a39b" tickLine={false} axisLine={false} tickFormatter={(value) => money(value, true)} width={66} fontSize={11} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ background: '#101411', border: '1px solid #253028', borderRadius: '12px' }} labelFormatter={(value) => new Date(String(value)).toLocaleString()} formatter={(value) => [money(Number(value)), 'Price']} />
          <Area type="monotone" dataKey="price" stroke="#41e68c" fill="url(#priceFill)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
