import { AlertCircle, LoaderCircle } from 'lucide-react';

export function LoadingState() {
  return <div className="grid min-h-screen place-items-center bg-ink text-muted"><div className="text-center"><LoaderCircle className="mx-auto mb-3 h-8 w-8 animate-spin text-gain" /><p>Validating market research data…</p></div></div>;
}

export function EmptyState({ title = 'No assets match', message = 'Try widening the filters or clearing the search.' }: { title?: string; message?: string }) {
  return <div className="rounded-2xl border border-dashed border-line p-12 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted" /><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{message}</p></div>;
}
