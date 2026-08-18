import type { MarketDataset } from '../types/market';
import { demoDataset } from './demoAssets';

function isDataset(value: unknown): value is MarketDataset {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MarketDataset>;
  return typeof candidate.generatedAt === 'string' && Array.isArray(candidate.assets) && candidate.assets.every((asset) =>
    Boolean(asset) && typeof asset === 'object' && typeof asset.id === 'string' && ['stock', 'crypto', 'meme'].includes(asset.kind),
  );
}

export async function loadMarketData(): Promise<MarketDataset> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/market-data.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Data request failed (${response.status})`);
    const payload: unknown = await response.json();
    if (!isDataset(payload)) throw new Error('Generated data failed schema validation');
    return payload;
  } catch (error) {
    return {
      ...demoDataset,
      errors: [...demoDataset.errors, `Browser fallback: ${error instanceof Error ? error.message : 'unknown error'}`],
    };
  }
}
