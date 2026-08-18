import { BarChart3, Bitcoin, FlaskConical, Gauge, Menu, Radar, Search, ShieldAlert, Wrench, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { DisclaimerBanner } from './DisclaimerBanner';
import { useRadar } from '../context/RadarContext';
import { dateTime } from '../utils/format';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/stocks', label: 'Stocks', icon: BarChart3 },
  { to: '/dumb-money', label: 'Retail setups', icon: Search },
  { to: '/crypto', label: 'Established crypto', icon: Bitcoin },
  { to: '/memes', label: 'Meme scanner', icon: ShieldAlert },
  { to: '/watchlist', label: 'Watchlist', icon: Radar },
  { to: '/tools', label: 'Paper & risk tools', icon: Wrench },
];

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { dataset } = useRadar();
  return (
    <div className="min-h-screen bg-ink text-white">
      <DisclaimerBanner />
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 font-bold"><FlaskConical className="h-5 w-5 text-gain" /> Breakout Radar</div>
        <button className="rounded-lg border border-line p-2" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed bottom-0 left-0 top-0 z-50 w-72 border-r border-line bg-ink p-5 transition-transform lg:translate-x-0`}>
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl border border-gain/30 bg-gain/10 p-2"><FlaskConical className="h-6 w-6 text-gain" /></div>
          <div><p className="font-bold tracking-tight">Breakout Radar</p><p className="text-xs text-muted">Research before momentum</p></div>
        </div>
        <nav aria-label="Main navigation" className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-white text-black' : 'text-muted hover:bg-panel hover:text-white'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-line bg-panel p-3 text-xs text-muted">
          <div className="mb-2 flex items-center justify-between"><span>Data mode</span><span className={dataset.mode === 'demo' ? 'text-amber-300' : 'text-gain'}>{dataset.mode.toUpperCase()}</span></div>
          <p>Updated {dateTime(dataset.generatedAt)}</p>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
      <main className="lg:ml-72">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
