import { riskColor } from '../utils/format';

export function ScoreGauge({ value, label = 'Opportunity' }: { value: number; label?: string }) {
  const color = value >= 70 ? '#41e68c' : value >= 50 ? '#fcd34d' : '#ff6474';
  return (
    <div className="flex items-center gap-3" aria-label={`${label} score ${value} out of 100`}>
      <div className="relative grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${value * 3.6}deg, #253028 0deg)` }}>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-panel text-sm font-bold">{Math.round(value)}</div>
      </div>
      <div><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="text-sm text-white">out of 100</p></div>
    </div>
  );
}

export function RiskGradeBadge({ grade, risk }: { grade: string; risk: number }) {
  return <div className="text-right"><p className="text-xs uppercase tracking-wider text-muted">Risk grade</p><p className={`text-2xl font-black ${riskColor(grade)}`}>{grade} <span className="text-xs font-normal text-muted">({Math.round(risk)}/100)</span></p></div>;
}
