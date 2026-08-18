export function money(value: number | null, compact = false): string {
  if (value === null || !Number.isFinite(value)) return 'Data unavailable';
  if (Math.abs(value) < 0.01 && value !== 0) return `$${value.toLocaleString(undefined, { maximumSignificantDigits: 4 })}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : value < 10 ? 4 : 2,
  }).format(value);
}

export function number(value: number | null, compact = false): string {
  if (value === null || !Number.isFinite(value)) return 'Data unavailable';
  return new Intl.NumberFormat('en-US', { notation: compact ? 'compact' : 'standard', maximumFractionDigits: 2 }).format(value);
}

export function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Data unavailable';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function dateTime(value: string | null): string {
  if (!value) return 'Data unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data unavailable' : date.toLocaleString();
}

export function riskColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return 'text-gain';
  if (grade === 'C' || grade === 'D') return 'text-amber-300';
  return 'text-loss';
}
