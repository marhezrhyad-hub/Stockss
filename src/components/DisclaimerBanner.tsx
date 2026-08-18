import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-200" role="note">
      <AlertTriangle className="mr-2 inline h-3.5 w-3.5" aria-hidden="true" />
      Speculative Investment Research — Not Financial Advice
    </div>
  );
}
