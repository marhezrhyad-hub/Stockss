import type { CryptoAsset, MarketDataset, MemeAsset, PricePoint, Scenario, StockAsset } from '../types/market';
import { scoreCrypto, scoreMeme, scoreStock } from '../utils/scoring';
import { detectMemeRisk, detectStockRisk } from '../utils/risk';

const DEMO_TIME = '2026-01-15T16:00:00.000Z';

function history(base: number, seed: number): PricePoint[] {
  // Deterministic demonstration points, never presented as live prices.
  return Array.from({ length: 30 }, (_, index) => {
    const drift = 1 + (index - 15) * 0.006 + Math.sin(index * 0.83 + seed) * 0.035;
    const date = new Date(Date.UTC(2025, 11, 17 + index));
    return { time: date.toISOString(), price: Math.max(0.000001, base * drift), volume: base * 900_000 * (1 + (index % 5) * 0.18) };
  });
}

const scenarios = (subject: string): Scenario[] => [
  { label: 'Best case', narrative: `${subject} executes on its identified catalyst while liquidity and market conditions improve.`, assumptions: ['Catalyst occurs on schedule', 'No adverse financing surprise', 'Risk appetite remains constructive'] },
  { label: 'Base case', narrative: `${subject} makes uneven progress and valuation follows the underlying evidence rather than attention alone.`, assumptions: ['Mixed execution', 'Normal volatility', 'No thesis-changing event'] },
  { label: 'Worst case', narrative: `${subject} misses milestones and loss of confidence compounds the fundamental or liquidity risk.`, assumptions: ['Catalyst fails or is delayed', 'Liquidity deteriorates', 'Downside risks materialize'] },
];

type StockSeed = Pick<StockAsset, 'id' | 'symbol' | 'name' | 'sector' | 'price' | 'marketCap' | 'change24h' | 'volume24h' | 'enterpriseValue' | 'revenueGrowth' | 'freeCashFlow' | 'cash' | 'debt' | 'priceToSales' | 'shortInterest' | 'daysToCover' | 'publicFloat' | 'relativeVolume' | 'dilutionRisk' | 'retailAttention'> & {
  seed: number;
  scoreInputs: Parameters<typeof scoreStock>[0];
};

function makeStock(s: StockSeed): StockAsset {
  const asset: StockAsset = {
    id: s.id, kind: 'stock', symbol: s.symbol, name: s.name, category: s.sector, sector: s.sector,
    exchange: 'NASDAQ', price: s.price, marketCap: s.marketCap, change24h: s.change24h, volume24h: s.volume24h,
    avgDailyDollarVolume: s.price !== null && s.volume24h !== null ? s.price * s.volume24h * 0.82 : null,
    momentum: Math.max(0, Math.min(100, 50 + (s.change24h ?? 0) * 2.4)), dataQuality: 'medium', dataTimestamp: DEMO_TIME,
    isDemo: true, stale: true, sourceLabel: 'Breakout Radar fictional demo dataset', sourceLinks: [],
    priceHistory: history(s.price ?? 1, s.seed), score: scoreStock(s.scoreInputs), warnings: ['DEMO DATA — not a current quote or company record.'],
    catalysts: ['Illustrative product milestone', 'Illustrative quarterly update'],
    risks: ['Execution risk', 'Financing and dilution risk', 'Speculative valuation'],
    bullCase: 'The fictional company converts its pipeline into durable revenue while funding needs remain controlled.',
    bearCase: 'Execution delays and expensive financing outweigh attention and headline growth.',
    thesisNeeds: ['Revenue growth must remain durable', 'Cash runway must extend beyond the next milestone', 'Relative volume must be supported by new evidence'],
    invalidationPoints: ['Material milestone failure', 'Unexpected dilutive financing', 'Liquidity falls below the research threshold'],
    permanentLossCauses: ['Insolvency', 'Repeated dilution without value creation', 'Technology or product obsolescence'],
    scenarios: scenarios(s.name), timeHorizon: 'months',
    enterpriseValue: s.enterpriseValue, revenueGrowth: s.revenueGrowth, earningsGrowth: null, freeCashFlow: s.freeCashFlow,
    cash: s.cash, debt: s.debt, priceToSales: s.priceToSales, priceToEarnings: null, estimateRevisions: null,
    insiderNetBuying: null, institutionalOwnership: 34 + s.seed * 3, shortInterest: s.shortInterest, daysToCover: s.daysToCover,
    publicFloat: s.publicFloat, relativeVolume: s.relativeVolume, upcomingEarnings: null, recentFilings: [],
    shelfRegistration: s.dilutionRisk === 'high', convertibleDebt: s.seed % 3 === 0, reverseSplitCount: 0,
    dilutionRisk: s.dilutionRisk, otc: false, bankrupt: false, halted: false, retailAttention: s.retailAttention,
    optionsActivity: 45 + s.seed * 5, searchMomentum: 50 + s.seed * 4, socialMomentum: 43 + s.seed * 6,
    borrowPressure: null,
  };
  const flags = detectStockRisk(asset);
  return { ...asset, disqualified: flags.disqualified, warnings: [...asset.warnings, ...flags.flags] };
}

const stocks: StockAsset[] = [
  makeStock({ id: 'stock-nova', symbol: 'NVBT', name: 'Nova Battery Labs', sector: 'Clean technology', price: 7.42, marketCap: 680_000_000, change24h: 6.8, volume24h: 4_100_000, enterpriseValue: 612_000_000, revenueGrowth: 38, freeCashFlow: -42_000_000, cash: 118_000_000, debt: 50_000_000, priceToSales: 5.8, shortInterest: 18.4, daysToCover: 4.6, publicFloat: 64_000_000, relativeVolume: 2.3, dilutionRisk: 'medium', retailAttention: 72, seed: 1, scoreInputs: { financialQuality: 56, valuation: 48, growth: 82, catalystStrength: 76, marketMomentum: 74, squeezeConditions: 67, liquidity: 78, dataQuality: 70, dilution: 7, extremeVolatility: 4 } }),
  makeStock({ id: 'stock-orbit', symbol: 'ORBX', name: 'OrbitLink Systems', sector: 'Aerospace', price: 13.18, marketCap: 1_340_000_000, change24h: 3.2, volume24h: 2_600_000, enterpriseValue: 1_290_000_000, revenueGrowth: 61, freeCashFlow: -70_000_000, cash: 202_000_000, debt: 152_000_000, priceToSales: 8.1, shortInterest: 11.2, daysToCover: 3.4, publicFloat: 86_000_000, relativeVolume: 1.7, dilutionRisk: 'low', retailAttention: 67, seed: 2, scoreInputs: { financialQuality: 61, valuation: 42, growth: 88, catalystStrength: 84, marketMomentum: 68, squeezeConditions: 52, liquidity: 81, dataQuality: 72, extremeVolatility: 3 } }),
  makeStock({ id: 'stock-lumen', symbol: 'LUMNQ', name: 'Lumen Quantum Works', sector: 'Quantum computing', price: 4.86, marketCap: 420_000_000, change24h: 9.4, volume24h: 6_800_000, enterpriseValue: 375_000_000, revenueGrowth: 84, freeCashFlow: -88_000_000, cash: 146_000_000, debt: 101_000_000, priceToSales: 15.2, shortInterest: 24.8, daysToCover: 5.9, publicFloat: 53_000_000, relativeVolume: 3.1, dilutionRisk: 'high', retailAttention: 89, seed: 3, scoreInputs: { financialQuality: 38, valuation: 25, growth: 91, catalystStrength: 70, marketMomentum: 86, squeezeConditions: 85, liquidity: 69, dataQuality: 64, dilution: 15, excessiveDebt: 5, extremeVolatility: 8 } }),
  makeStock({ id: 'stock-pulse', symbol: 'PLSE', name: 'Pulse Robotics', sector: 'Industrial technology', price: 18.35, marketCap: 2_180_000_000, change24h: -1.7, volume24h: 1_900_000, enterpriseValue: 2_090_000_000, revenueGrowth: 29, freeCashFlow: 12_000_000, cash: 177_000_000, debt: 87_000_000, priceToSales: 4.6, shortInterest: 8.1, daysToCover: 2.7, publicFloat: 97_000_000, relativeVolume: 1.1, dilutionRisk: 'low', retailAttention: 48, seed: 4, scoreInputs: { financialQuality: 74, valuation: 62, growth: 69, catalystStrength: 58, marketMomentum: 49, squeezeConditions: 36, liquidity: 83, dataQuality: 78 } }),
  makeStock({ id: 'stock-helix', symbol: 'HLXB', name: 'Helix BioFoundry', sector: 'Biotechnology', price: 2.14, marketCap: 190_000_000, change24h: 12.6, volume24h: 8_400_000, enterpriseValue: 142_000_000, revenueGrowth: 14, freeCashFlow: -66_000_000, cash: 92_000_000, debt: 44_000_000, priceToSales: 12.7, shortInterest: 29.3, daysToCover: 6.8, publicFloat: 41_000_000, relativeVolume: 4.2, dilutionRisk: 'high', retailAttention: 93, seed: 5, scoreInputs: { financialQuality: 31, valuation: 29, growth: 55, catalystStrength: 79, marketMomentum: 90, squeezeConditions: 92, liquidity: 61, dataQuality: 60, dilution: 18, missingData: 5, extremeVolatility: 10 } }),
  makeStock({ id: 'stock-tidal', symbol: 'TDAL', name: 'Tidal Grid Storage', sector: 'Energy storage', price: 9.76, marketCap: 910_000_000, change24h: 2.1, volume24h: 1_250_000, enterpriseValue: 950_000_000, revenueGrowth: 47, freeCashFlow: -24_000_000, cash: 81_000_000, debt: 121_000_000, priceToSales: 3.9, shortInterest: 14.6, daysToCover: 4.1, publicFloat: 72_000_000, relativeVolume: 1.5, dilutionRisk: 'medium', retailAttention: 58, seed: 6, scoreInputs: { financialQuality: 57, valuation: 64, growth: 77, catalystStrength: 69, marketMomentum: 62, squeezeConditions: 61, liquidity: 72, dataQuality: 69, excessiveDebt: 5, dilution: 5 } }),
];

type CryptoSeed = Pick<CryptoAsset, 'id' | 'symbol' | 'name' | 'price' | 'marketCap' | 'change24h' | 'volume24h' | 'marketCapRank' | 'athDrawdown' | 'totalSupply' | 'circulatingSupply' | 'category'> & { seed: number; scoreInputs: Parameters<typeof scoreCrypto>[0] };

function makeCrypto(s: CryptoSeed): CryptoAsset {
  return {
    id: s.id, kind: 'crypto', symbol: s.symbol, name: s.name, category: s.category, exchange: 'Multiple exchanges',
    price: s.price, marketCap: s.marketCap, change24h: s.change24h, volume24h: s.volume24h, avgDailyDollarVolume: s.volume24h,
    momentum: Math.max(0, Math.min(100, 52 + (s.change24h ?? 0) * 2)), dataQuality: 'medium', dataTimestamp: DEMO_TIME,
    isDemo: true, stale: true, sourceLabel: 'Breakout Radar demo snapshot — illustrative values', sourceLinks: [],
    priceHistory: history(s.price ?? 1, s.seed + 10), score: scoreCrypto(s.scoreInputs), warnings: ['DEMO DATA — not a current market quote.'],
    catalysts: ['Illustrative network upgrade', 'Illustrative adoption milestone'], risks: ['Protocol risk', 'Regulatory uncertainty', 'Large market drawdowns'],
    bullCase: 'Network usage grows faster than supply-related selling pressure.', bearCase: 'Usage, fees, and developer activity fail to justify valuation.',
    thesisNeeds: ['Sustained network usage', 'Deep exchange liquidity', 'No thesis-changing security failure'],
    invalidationPoints: ['Persistent activity decline', 'Critical protocol exploit', 'Adoption catalyst fails'],
    permanentLossCauses: ['Protocol failure', 'Irrecoverable security compromise', 'Demand permanently migrates elsewhere'],
    scenarios: scenarios(s.name), timeHorizon: 'years', marketCapRank: s.marketCapRank, liquidityScore: 78 + s.seed * 2,
    activeAddresses: null, transactionActivity: null, developerActivity: null, protocolRevenue: null, totalValueLocked: null,
    totalSupply: s.totalSupply, circulatingSupply: s.circulatingSupply, inflationRate: null, nextUnlock: null,
    holderConcentration: null, exchangeConcentration: null, securityIncidents: null, regulatoryRisk: 'unknown', athDrawdown: s.athDrawdown,
  };
}

const crypto: CryptoAsset[] = [
  makeCrypto({ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'Store of value', price: 101_200, marketCap: 2_010_000_000_000, change24h: 1.8, volume24h: 48_000_000_000, marketCapRank: 1, athDrawdown: -7.4, totalSupply: 21_000_000, circulatingSupply: 19_850_000, seed: 1, scoreInputs: { adoption: 91, liquidity: 98, tokenomics: 90, developerActivity: 82, security: 91, catalysts: 70, marketMomentum: 64, dataQuality: 88, risk: 45 } }),
  makeCrypto({ id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'Smart-contract platform', price: 3_280, marketCap: 395_000_000_000, change24h: 2.7, volume24h: 22_000_000_000, marketCapRank: 2, athDrawdown: -33.1, totalSupply: 120_500_000, circulatingSupply: 120_500_000, seed: 2, scoreInputs: { adoption: 90, liquidity: 94, tokenomics: 79, developerActivity: 96, security: 86, catalysts: 78, marketMomentum: 60, dataQuality: 86, risk: 50 } }),
  makeCrypto({ id: 'solana', symbol: 'SOL', name: 'Solana', category: 'Smart-contract platform', price: 176.4, marketCap: 86_000_000_000, change24h: 5.1, volume24h: 5_800_000_000, marketCapRank: 5, athDrawdown: -39.6, totalSupply: 595_000_000, circulatingSupply: 488_000_000, seed: 3, scoreInputs: { adoption: 84, liquidity: 88, tokenomics: 68, developerActivity: 88, security: 72, catalysts: 82, marketMomentum: 76, dataQuality: 82, risk: 59 } }),
  makeCrypto({ id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'Oracle network', price: 22.1, marketCap: 14_100_000_000, change24h: 3.9, volume24h: 1_100_000_000, marketCapRank: 14, athDrawdown: -57.3, totalSupply: 1_000_000_000, circulatingSupply: 638_000_000, seed: 4, scoreInputs: { adoption: 81, liquidity: 82, tokenomics: 66, developerActivity: 87, security: 84, catalysts: 80, marketMomentum: 69, dataQuality: 79, risk: 57 } }),
  makeCrypto({ id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', category: 'Smart-contract platform', price: 38.7, marketCap: 16_000_000_000, change24h: -0.8, volume24h: 620_000_000, marketCapRank: 12, athDrawdown: -73.5, totalSupply: 450_000_000, circulatingSupply: 414_000_000, seed: 5, scoreInputs: { adoption: 70, liquidity: 76, tokenomics: 63, developerActivity: 79, security: 78, catalysts: 73, marketMomentum: 48, dataQuality: 75, risk: 63 } }),
];

type MemeSeed = Pick<MemeAsset, 'id' | 'symbol' | 'name' | 'chain' | 'price' | 'marketCap' | 'change24h' | 'volume24h' | 'fullyDilutedValuation' | 'liquidity' | 'holders' | 'top10Concentration' | 'contractVerified' | 'liquidityLocked' | 'mintAuthority'> & { seed: number; scoreInputs: Parameters<typeof scoreMeme>[0] };

function makeMeme(s: MemeSeed): MemeAsset {
  const asset: MemeAsset = {
    id: s.id, kind: 'meme', symbol: s.symbol, name: s.name, category: 'Meme coin', exchange: 'Decentralized exchanges', chain: s.chain,
    price: s.price, marketCap: s.marketCap, change24h: s.change24h, volume24h: s.volume24h, avgDailyDollarVolume: s.volume24h,
    momentum: Math.max(0, Math.min(100, 50 + (s.change24h ?? 0))), dataQuality: 'medium', dataTimestamp: DEMO_TIME,
    isDemo: true, stale: true, sourceLabel: 'Breakout Radar fictional meme-token demo dataset', sourceLinks: [],
    priceHistory: history(s.price ?? 1, s.seed + 20), score: scoreMeme(s.scoreInputs), warnings: ['DEMO DATA — fictional token and illustrative metrics.', 'Meme coins are never classified as safe.'],
    catalysts: ['Illustrative exchange listing', 'Illustrative community activity'], risks: ['Extreme volatility', 'Liquidity can disappear', 'Attention may reverse without warning'],
    bullCase: 'Organic attention persists while verifiable liquidity and distribution improve.', bearCase: 'Momentum fades, concentrated holders sell, or liquidity proves less durable than reported.',
    thesisNeeds: ['Liquidity remains verifiable', 'No adverse contract-permission change', 'Volume is organic rather than wash trading'],
    invalidationPoints: ['Liquidity unlock or removal', 'Contract safety warning', 'Evidence of manipulated volume'],
    permanentLossCauses: ['Rug pull or exploit', 'Irreversible loss of liquidity', 'Token becomes untradeable'],
    scenarios: scenarios(s.name), timeHorizon: 'days', disqualified: false, tokenAgeDays: 220 + s.seed * 80,
    fullyDilutedValuation: s.fullyDilutedValuation, liquidity: s.liquidity, volumeToLiquidity: s.liquidity && s.volume24h !== null ? s.volume24h / s.liquidity : null,
    holders: s.holders, top10Concentration: s.top10Concentration, developerWalletConcentration: 3 + s.seed * 1.3,
    contractVerified: s.contractVerified, ownershipRenounced: s.seed % 2 === 0, mintAuthority: s.mintAuthority,
    freezeAuthority: false, buyTax: 0, sellTax: 0, liquidityLocked: s.liquidityLocked, liquidityLockExpiration: null,
    audited: null, honeypot: false, rugPullRisk: false, largeWalletActivity: 46 + s.seed * 4,
    socialMomentum: 62 + s.seed * 4, exchangeListings: 2 + s.seed,
  };
  const flags = detectMemeRisk(asset);
  return { ...asset, disqualified: flags.disqualified, warnings: [...asset.warnings, ...flags.flags] };
}

const memes: MemeAsset[] = [
  makeMeme({ id: 'meme-moonmutt', symbol: 'MUTT', name: 'MoonMutt', chain: 'Solana', price: 0.00082, marketCap: 38_000_000, change24h: 18.2, volume24h: 12_000_000, fullyDilutedValuation: 41_000_000, liquidity: 4_200_000, holders: 38_000, top10Concentration: 36, contractVerified: true, liquidityLocked: true, mintAuthority: false, seed: 1, scoreInputs: { liquidityQuality: 72, contractSafety: 76, holderDistribution: 64, volumeQuality: 58, tokenomics: 67, marketMomentum: 84, communityMomentum: 80, exchangeAvailability: 48, dataQuality: 68, risk: 76 } }),
  makeMeme({ id: 'meme-bytecat', symbol: 'BYTE', name: 'ByteCat', chain: 'Ethereum', price: 0.0034, marketCap: 72_000_000, change24h: 9.6, volume24h: 8_600_000, fullyDilutedValuation: 76_000_000, liquidity: 6_100_000, holders: 51_000, top10Concentration: 42, contractVerified: true, liquidityLocked: true, mintAuthority: false, seed: 2, scoreInputs: { liquidityQuality: 79, contractSafety: 78, holderDistribution: 59, volumeQuality: 70, tokenomics: 62, marketMomentum: 73, communityMomentum: 72, exchangeAvailability: 58, dataQuality: 70, risk: 72 } }),
  makeMeme({ id: 'meme-frogbyte', symbol: 'FRBY', name: 'FrogByte', chain: 'Base', price: 0.000019, marketCap: 11_000_000, change24h: 31.4, volume24h: 5_500_000, fullyDilutedValuation: 12_000_000, liquidity: 780_000, holders: 14_000, top10Concentration: 57, contractVerified: true, liquidityLocked: true, mintAuthority: false, seed: 3, scoreInputs: { liquidityQuality: 55, contractSafety: 71, holderDistribution: 44, volumeQuality: 39, tokenomics: 58, marketMomentum: 92, communityMomentum: 84, exchangeAvailability: 32, dataQuality: 59, risk: 84 } }),
  makeMeme({ id: 'meme-capydash', symbol: 'CAPY', name: 'CapyDash', chain: 'Solana', price: 0.0012, marketCap: 24_000_000, change24h: -12.7, volume24h: 3_200_000, fullyDilutedValuation: 25_000_000, liquidity: 1_900_000, holders: 23_000, top10Concentration: 48, contractVerified: true, liquidityLocked: true, mintAuthority: false, seed: 4, scoreInputs: { liquidityQuality: 63, contractSafety: 73, holderDistribution: 53, volumeQuality: 61, tokenomics: 60, marketMomentum: 28, communityMomentum: 61, exchangeAvailability: 39, dataQuality: 62, risk: 79 } }),
  makeMeme({ id: 'meme-racc', symbol: 'RACC', name: 'RocketRaccoon', chain: 'Arbitrum', price: 0.0000068, marketCap: 6_800_000, change24h: 44.1, volume24h: 2_900_000, fullyDilutedValuation: 8_500_000, liquidity: 410_000, holders: 8_200, top10Concentration: 68, contractVerified: true, liquidityLocked: true, mintAuthority: false, seed: 5, scoreInputs: { liquidityQuality: 43, contractSafety: 67, holderDistribution: 32, volumeQuality: 31, tokenomics: 48, marketMomentum: 96, communityMomentum: 88, exchangeAvailability: 24, dataQuality: 51, risk: 91 } }),
];

export const demoDataset: MarketDataset = {
  generatedAt: DEMO_TIME,
  mode: 'demo',
  marketRegime: 'neutral',
  regimeExplanation: 'Demo mode uses a neutral regime because no live macro or broad-market feed is available.',
  assets: [...stocks, ...crypto, ...memes],
  errors: ['API keys were not configured or demo mode was requested. All displayed assets and values are clearly labeled demonstration data.'],
};
