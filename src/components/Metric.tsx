import type { ReactNode } from 'react';

export function Metric({ label, value, help }: { label: string; value: ReactNode; help?: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 truncate text-[11px] uppercase tracking-wider text-muted" title={help}>{label}{help && <span className="ml-1 cursor-help text-gain" aria-label={help}>?</span>}</p>
      <div className="truncate text-sm font-semibold text-white" title={typeof value === 'string' ? value : undefined}>{value}</div>
    </div>
  );
}
