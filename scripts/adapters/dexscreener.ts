import { fetchJson, finite } from '../lib/http';

interface DexPair { chainId?: string; baseToken?: { symbol?: string; name?: string }; priceUsd?: string; liquidity?: { usd?: number }; volume?: { h24?: number }; fdv?: number; pairAddress?: string; url?: string; }
interface DexResponse { pairs?: DexPair[] | null; }

export interface DexLiquiditySnapshot { chain: string; liquidity: number | null; volume24h: number | null; fdv: number | null; sourceUrl: string | null; }

// Optional enrichment adapter. Exact symbol + name matching prevents an unrelated token
// with a copied ticker from silently entering the dataset.
export async function fetchDexLiquidity(symbol: string, name: string): Promise<DexLiquiditySnapshot | null> {
  const data = await fetchJson<DexResponse>(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(`${symbol} ${name}`)}`);
  const candidates = (data.pairs ?? []).filter((pair) => pair.baseToken?.symbol?.toLowerCase() === symbol.toLowerCase() && pair.baseToken?.name?.toLowerCase() === name.toLowerCase());
  const best = candidates.sort((a, b) => (finite(b.liquidity?.usd) ?? 0) - (finite(a.liquidity?.usd) ?? 0))[0];
  return best ? { chain: best.chainId ?? 'Data unavailable', liquidity: finite(best.liquidity?.usd), volume24h: finite(best.volume?.h24), fdv: finite(best.fdv), sourceUrl: best.url ?? null } : null;
}
