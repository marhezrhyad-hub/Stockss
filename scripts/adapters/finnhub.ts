import type { SourceLink, StockAsset } from '../../src/types/market';
import { scoreStock } from '../../src/utils/scoring';
import { detectStockRisk } from '../../src/utils/risk';
import { bounded, fetchJson, finite } from '../lib/http';

interface QuoteResponse { c?: number; d?: number; dp?: number; h?: number; l?: number; o?: number; pc?: number; t?: number; }
interface ProfileResponse { country?: string; currency?: string; exchange?: string; finnhubIndustry?: string; ipo?: string; logo?: string; marketCapitalization?: number; name?: string; shareOutstanding?: number; ticker?: string; weburl?: string; }
interface MetricResponse { metric?: Record<string, number | null>; }

const endpoint = (path: string, params: Record<string, string>, key: string) => {
  const query = new URLSearchParams({ ...params, token: key });
  return `https://finnhub.io/api/v1/${path}?${query.toString()}`;
};

function metric(metrics: Record<string, number | null>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = finite(metrics[key]);
    if (value !== null) return value;
  }
  return null;
}

function stockScenarios(name: string) {
  return [
    { label: 'Best case' as const, narrative: `${name} compounds operating progress while financing needs remain manageable.`, assumptions: ['Revenue growth persists', 'Catalyst is verified', 'No adverse financing surprise'] },
    { label: 'Base case' as const, narrative: `${name} produces mixed execution and trades with the evidence.`, assumptions: ['Growth normalizes', 'Liquidity stays adequate', 'Valuation does not expand materially'] },
    { label: 'Worst case' as const, narrative: `${name} misses milestones as balance-sheet or dilution risk rises.`, assumptions: ['Catalyst fails', 'Capital becomes expensive', 'Risk appetite weakens'] },
  ];
}

export async function fetchFinnhubStocks(symbols: string[], key: string, retrievedAt: string): Promise<StockAsset[]> {
  const results: StockAsset[] = [];
  // Sequential requests respect the provider's small free-tier rate limit.
  for (const symbol of symbols) {
    const [quote, profile, metricsResponse] = await Promise.all([
      fetchJson<QuoteResponse>(endpoint('quote', { symbol }, key)),
      fetchJson<ProfileResponse>(endpoint('stock/profile2', { symbol }, key)),
      fetchJson<MetricResponse>(endpoint('stock/metric', { symbol, metric: 'all' }, key)),
    ]);
    const price = finite(quote.c);
    if (!profile.name || price === null || price <= 0) continue;
    const metrics = metricsResponse.metric ?? {};
    const marketCap = finite(profile.marketCapitalization) === null ? null : Number(profile.marketCapitalization) * 1_000_000;
    const averageVolumeShares = metric(metrics, '10DayAverageTradingVolume', '3MonthAverageTradingVolume');
    const avgDailyDollarVolume = averageVolumeShares === null ? null : averageVolumeShares * 1_000_000 * price;
    const revenueGrowth = metric(metrics, 'revenueGrowthTTMYoy', 'revenueGrowthQuarterlyYoy');
    const earningsGrowth = metric(metrics, 'epsGrowthTTMYoy', 'epsGrowthQuarterlyYoy');
    const momentumRaw = metric(metrics, '13WeekPriceReturnDaily', '26WeekPriceReturnDaily');
    const momentum = momentumRaw === null ? null : bounded(50 + momentumRaw);
    const liquidityScore = avgDailyDollarVolume === null ? 35 : bounded(20 + Math.log10(Math.max(avgDailyDollarVolume, 1)) * 8);
    const growthScore = revenueGrowth === null ? 35 : bounded(50 + revenueGrowth);
    const financialQuality = bounded(50 + (metric(metrics, 'currentRatioAnnual') ?? 0) * 5 - Math.max(0, metric(metrics, 'totalDebt/totalEquityAnnual') ?? 0) * 0.08);
    const ps = metric(metrics, 'psTTM', 'priceToSalesTTM');
    const valuation = ps === null ? 35 : bounded(85 - ps * 6);
    const missingCount = [marketCap, revenueGrowth, earningsGrowth, avgDailyDollarVolume, ps].filter((v) => v === null).length;
    const dataScore = bounded(100 - missingCount * 14);
    const score = scoreStock({
      financialQuality, valuation, growth: growthScore, catalystStrength: 30,
      marketMomentum: momentum ?? 35, squeezeConditions: 20, liquidity: liquidityScore,
      dataQuality: dataScore, missingData: missingCount * 2,
      poorLiquidity: avgDailyDollarVolume !== null && avgDailyDollarVolume < 500_000 ? 20 : 0,
      extremeVolatility: Math.abs(finite(quote.dp) ?? 0) > 20 ? 8 : 0,
    });
    const timestamp = finite(quote.t) ? new Date(Number(quote.t) * 1_000).toISOString() : retrievedAt;
    const secLinks: SourceLink[] = [];
    const sourceLinks: SourceLink[] = [
      { name: 'Finnhub market data', url: 'https://finnhub.io/docs/api', retrievedAt },
      ...(profile.weburl ? [{ name: 'Company website', url: profile.weburl, retrievedAt }] : []),
    ];
    const asset: StockAsset = {
      id: `stock-${symbol.toLowerCase()}`, kind: 'stock', symbol, name: profile.name, category: profile.finnhubIndustry || 'Data unavailable', sector: profile.finnhubIndustry || 'Data unavailable', exchange: profile.exchange || 'Data unavailable',
      price, marketCap, change24h: finite(quote.dp), volume24h: averageVolumeShares === null ? null : averageVolumeShares * 1_000_000,
      avgDailyDollarVolume, momentum, dataQuality: dataScore >= 80 ? 'high' : dataScore >= 55 ? 'medium' : 'low', dataTimestamp: timestamp,
      isDemo: false, stale: Date.now() - new Date(timestamp).getTime() > 48 * 60 * 60 * 1_000, sourceLabel: 'Finnhub quote, profile, and basic financial metrics', sourceLinks, priceHistory: [], score,
      warnings: ['Short interest, borrow pressure, options activity, live filings, and dilution documents require additional licensed sources and are shown as unavailable.'],
      catalysts: [], risks: ['Small and emerging companies can be volatile', 'Catalyst and dilution coverage may be incomplete'],
      bullCase: 'Fundamental growth and verified execution would need to justify the current enterprise valuation.', bearCase: 'Growth can slow while financing or valuation compression creates disproportionate downside.',
      thesisNeeds: ['Verify a specific catalyst in primary filings', 'Confirm cash runway and dilution exposure', 'Sustain adequate dollar liquidity'],
      invalidationPoints: ['Material deterioration in growth', 'Financing terms damage per-share value', 'Liquidity falls below the screening minimum'],
      permanentLossCauses: ['Insolvency or restructuring', 'Repeated dilution without value creation', 'Business model impairment'], scenarios: stockScenarios(profile.name), timeHorizon: 'months',
      enterpriseValue: null, revenueGrowth, earningsGrowth, freeCashFlow: null, cash: null, debt: null, priceToSales: ps, priceToEarnings: metric(metrics, 'peTTM'), estimateRevisions: null,
      insiderNetBuying: null, institutionalOwnership: null, shortInterest: null, daysToCover: null, publicFloat: null, relativeVolume: null, upcomingEarnings: null, recentFilings: secLinks,
      shelfRegistration: null, convertibleDebt: null, reverseSplitCount: null, dilutionRisk: 'unknown', otc: (profile.exchange ?? '').toLowerCase().includes('otc'), bankrupt: null, halted: null,
      retailAttention: null, optionsActivity: null, searchMomentum: null, socialMomentum: null, borrowPressure: null,
    };
    const flags = detectStockRisk(asset);
    results.push({ ...asset, disqualified: flags.disqualified, warnings: [...asset.warnings, ...flags.flags] });
  }
  return results;
}
