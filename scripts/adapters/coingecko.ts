import type { CryptoAsset, MemeAsset, PricePoint } from '../../src/types/market';
import { scoreCrypto, scoreMeme } from '../../src/utils/scoring';
import { detectMemeRisk } from '../../src/utils/risk';
import { bounded, fetchJson, finite } from '../lib/http';

interface CoinMarket {
  id?: string; symbol?: string; name?: string; current_price?: number; market_cap?: number; market_cap_rank?: number;
  fully_diluted_valuation?: number; total_volume?: number; price_change_percentage_24h?: number; market_cap_change_percentage_24h?: number;
  circulating_supply?: number; total_supply?: number; max_supply?: number; ath_change_percentage?: number; last_updated?: string;
  sparkline_in_7d?: { price?: number[] };
}

const ESTABLISHED = ['bitcoin', 'ethereum', 'solana', 'chainlink', 'avalanche'];
const MEMES = ['dogecoin', 'shiba-inu', 'pepe', 'bonk', 'floki'];

function cgUrl(ids: string[]) {
  const params = new URLSearchParams({ vs_currency: 'usd', ids: ids.join(','), order: 'market_cap_desc', sparkline: 'true', price_change_percentage: '24h,7d' });
  return `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;
}

function headers(key?: string): HeadersInit { return key ? { 'x-cg-demo-api-key': key } : {}; }

function chart(item: CoinMarket, retrievedAt: string): PricePoint[] {
  const prices = item.sparkline_in_7d?.price?.filter((price) => Number.isFinite(price)) ?? [];
  const end = new Date(retrievedAt).getTime();
  return prices.map((price, index) => ({ time: new Date(end - (prices.length - 1 - index) * 60 * 60 * 1_000).toISOString(), price }));
}

const commonCases = (name: string, kind: 'crypto' | 'meme') => ({
  catalysts: kind === 'crypto' ? ['Network adoption milestone (must be independently verified)', 'Protocol upgrade (verify official source)'] : ['Exchange access or organic attention (verify independently)'],
  risks: kind === 'crypto' ? ['Protocol and custody risk', 'Regulatory uncertainty', 'Large market drawdowns'] : ['Extreme volatility', 'Liquidity failure', 'Contract or concentration risk'],
  bullCase: kind === 'crypto' ? `${name} usage and economic activity grow faster than supply pressure.` : `${name} retains organic demand while liquidity and distribution remain verifiable.`,
  bearCase: kind === 'crypto' ? 'Network activity or value capture fails to justify the circulating market value.' : 'Attention reverses, large holders sell, or liquidity and contract assumptions prove unreliable.',
  thesisNeeds: kind === 'crypto' ? ['Usage grows across a full cycle', 'Security remains resilient', 'Supply pressure stays absorbable'] : ['Contract safety is independently verified', 'Liquidity remains durable', 'Volume is organic'],
  invalidationPoints: kind === 'crypto' ? ['Persistent network-usage decline', 'Thesis-changing security failure', 'Adoption thesis fails'] : ['Liquidity removal', 'Contract safety warning', 'Evidence of fake volume'],
  permanentLossCauses: kind === 'crypto' ? ['Irrecoverable protocol failure', 'Loss of network relevance', 'Critical custody or security failure'] : ['Honeypot or exploit', 'Rug pull', 'Market becomes untradeable'],
  scenarios: [
    { label: 'Best case' as const, narrative: `${name} adoption and liquidity improve under a constructive market regime.`, assumptions: ['Adoption improves', 'No security failure', 'Supply is absorbed'] },
    { label: 'Base case' as const, narrative: `${name} remains volatile while evidence develops unevenly.`, assumptions: ['Mixed usage', 'Normal crypto volatility', 'No structural break'] },
    { label: 'Worst case' as const, narrative: `${name} loses demand while liquidity or security risk compounds losses.`, assumptions: ['Demand falls', 'Liquidity weakens', 'A core risk materializes'] },
  ],
});

export async function fetchCoinGeckoEstablished(key: string | undefined, retrievedAt: string): Promise<CryptoAsset[]> {
  const data = await fetchJson<CoinMarket[]>(cgUrl(ESTABLISHED), { headers: headers(key) });
  if (!Array.isArray(data)) throw new Error('CoinGecko established-asset response was malformed');
  return data.filter((item) => item.id && item.symbol && item.name && finite(item.current_price) !== null).map((item): CryptoAsset => {
    const cap = finite(item.market_cap); const volume = finite(item.total_volume); const supply = finite(item.total_supply); const circulating = finite(item.circulating_supply);
    const liquidityScore = cap && volume ? bounded(40 + Math.log10(volume) * 5 + Math.min(20, volume / cap * 100)) : 35;
    const tokenomics = supply && circulating ? bounded(45 + circulating / supply * 50) : 40;
    const momentum = bounded(50 + (finite(item.price_change_percentage_24h) ?? 0) * 2);
    const rank = finite(item.market_cap_rank); const adoption = bounded(92 - (rank ?? 50) * 1.2);
    const score = scoreCrypto({ adoption, liquidity: liquidityScore, tokenomics, developerActivity: 50, security: 55, catalysts: 40, marketMomentum: momentum, dataQuality: 65, risk: bounded(40 + (rank ?? 30) * 0.8) });
    const timestamp = item.last_updated || retrievedAt;
    return {
      id: item.id!, kind: 'crypto', symbol: item.symbol!.toUpperCase(), name: item.name!, category: 'Established crypto', exchange: 'Multiple exchanges',
      price: finite(item.current_price), marketCap: cap, change24h: finite(item.price_change_percentage_24h), volume24h: volume, avgDailyDollarVolume: volume, momentum,
      dataQuality: 'medium', dataTimestamp: timestamp, isDemo: false, stale: Date.now() - new Date(timestamp).getTime() > 36 * 60 * 60 * 1_000,
      sourceLabel: 'CoinGecko coins/markets', sourceLinks: [{ name: 'CoinGecko asset page', url: `https://www.coingecko.com/en/coins/${item.id}`, retrievedAt }], priceHistory: chart(item, retrievedAt), score,
      warnings: ['Network usage, developer activity, revenue, holder concentration, unlocks, and security history require additional sources and are shown as unavailable.'], ...commonCases(item.name!, 'crypto'), timeHorizon: 'years',
      marketCapRank: rank, liquidityScore, activeAddresses: null, transactionActivity: null, developerActivity: null, protocolRevenue: null, totalValueLocked: null,
      totalSupply: supply, circulatingSupply: circulating, inflationRate: null, nextUnlock: null, holderConcentration: null, exchangeConcentration: null,
      securityIncidents: null, regulatoryRisk: 'unknown', athDrawdown: finite(item.ath_change_percentage),
    };
  });
}

export async function fetchCoinGeckoMemes(key: string | undefined, retrievedAt: string): Promise<MemeAsset[]> {
  const data = await fetchJson<CoinMarket[]>(cgUrl(MEMES), { headers: headers(key) });
  if (!Array.isArray(data)) throw new Error('CoinGecko meme-asset response was malformed');
  return data.filter((item) => item.id && item.symbol && item.name && finite(item.current_price) !== null).map((item): MemeAsset => {
    const cap = finite(item.market_cap); const volume = finite(item.total_volume); const momentum = bounded(50 + (finite(item.price_change_percentage_24h) ?? 0));
    const liquidityProxy = cap && volume ? bounded(30 + Math.log10(volume) * 5 + Math.min(15, volume / cap * 100)) : 25;
    const score = scoreMeme({ liquidityQuality: liquidityProxy, contractSafety: 20, holderDistribution: 20, volumeQuality: volume && cap ? bounded(60 - Math.abs(volume / cap - 0.2) * 80) : 20, tokenomics: 35, marketMomentum: momentum, communityMomentum: 45, exchangeAvailability: 55, dataQuality: 40, risk: 88 });
    const timestamp = item.last_updated || retrievedAt;
    const asset: MemeAsset = {
      id: `meme-${item.id}`, kind: 'meme', symbol: item.symbol!.toUpperCase(), name: item.name!, category: 'Meme coin', exchange: 'Multiple exchanges', chain: 'Data unavailable',
      price: finite(item.current_price), marketCap: cap, change24h: finite(item.price_change_percentage_24h), volume24h: volume, avgDailyDollarVolume: volume, momentum,
      dataQuality: 'low', dataTimestamp: timestamp, isDemo: false, stale: Date.now() - new Date(timestamp).getTime() > 36 * 60 * 60 * 1_000,
      sourceLabel: 'CoinGecko coins/markets; contract-safety data unavailable', sourceLinks: [{ name: 'CoinGecko asset page', url: `https://www.coingecko.com/en/coins/${item.id}`, retrievedAt }], priceHistory: chart(item, retrievedAt), score,
      warnings: ['SEVERE WARNING: contract permissions, honeypot status, holder concentration, and locked liquidity are unavailable. This score cannot establish safety.', 'Meme coins are never classified as safe.'], ...commonCases(item.name!, 'meme'), timeHorizon: 'days',
      tokenAgeDays: null, fullyDilutedValuation: finite(item.fully_diluted_valuation), liquidity: null, volumeToLiquidity: null, holders: null, top10Concentration: null,
      developerWalletConcentration: null, contractVerified: null, ownershipRenounced: null, mintAuthority: null, freezeAuthority: null, buyTax: null, sellTax: null,
      liquidityLocked: null, liquidityLockExpiration: null, audited: null, honeypot: null, rugPullRisk: null, largeWalletActivity: null, socialMomentum: null, exchangeListings: null,
    };
    const flags = detectMemeRisk(asset);
    return { ...asset, disqualified: flags.disqualified, warnings: [...asset.warnings, ...flags.flags] };
  });
}
