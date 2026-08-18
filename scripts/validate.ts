import type { MarketAsset } from '../src/types/market';

export function validateAndDedupe(assets: MarketAsset[]): { assets: MarketAsset[]; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const valid: MarketAsset[] = [];
  for (const asset of assets) {
    if (!asset.id || !asset.symbol || !asset.name || !['stock', 'crypto', 'meme'].includes(asset.kind)) {
      errors.push('A malformed asset was rejected.');
      continue;
    }
    const key = `${asset.kind}:${asset.id.toLowerCase()}`;
    if (seen.has(key)) { errors.push(`Duplicate asset rejected: ${key}`); continue; }
    seen.add(key);
    if (asset.price !== null && (!Number.isFinite(asset.price) || asset.price < 0)) {
      errors.push(`Malformed price rejected for ${asset.symbol}`);
      asset.price = null;
    }
    if (asset.marketCap !== null && (!Number.isFinite(asset.marketCap) || asset.marketCap < 0)) {
      errors.push(`Malformed market cap rejected for ${asset.symbol}`);
      asset.marketCap = null;
    }
    const age = Date.now() - new Date(asset.dataTimestamp).getTime();
    asset.stale = Number.isNaN(age) || age > 48 * 60 * 60 * 1_000;
    valid.push(asset);
  }
  return { assets: valid, errors };
}
