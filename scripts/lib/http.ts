export class HttpError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchJson<T>(url: string, options: RequestInit = {}, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get('retry-after') ?? 0) * 1_000;
        if (attempt < attempts - 1) { await wait(Math.max(retryAfter, 700 * 2 ** attempt)); continue; }
      }
      if (!response.ok) throw new HttpError(`HTTP ${response.status} from ${new URL(url).hostname}`, response.status);
      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await wait(700 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Market-data request failed');
}

export function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function bounded(value: number | null, fallback = 0): number {
  return Math.max(0, Math.min(100, value ?? fallback));
}
