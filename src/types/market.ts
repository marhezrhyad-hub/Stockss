export type AssetKind = 'stock' | 'crypto' | 'meme';
export type MarketRegime = 'risk-on' | 'neutral' | 'risk-off';
export type DataQuality = 'high' | 'medium' | 'low' | 'insufficient';
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type TimeHorizon = 'days' | 'weeks' | 'months' | 'years';

export interface PricePoint {
  time: string;
  price: number;
  volume?: number;
}

export interface SourceLink {
  name: string;
  url: string;
  retrievedAt: string;
}

export interface ScorePart {
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface ScorePenalty {
  label: string;
  points: number;
  explanation: string;
}

export interface ScoreResult {
  opportunity: number;
  risk: number;
  riskGrade: RiskGrade;
  parts: ScorePart[];
  penalties: ScorePenalty[];
  explanation: string;
}

export interface Scenario {
  label: 'Best case' | 'Base case' | 'Worst case';
  narrative: string;
  assumptions: string[];
}

export interface BaseAsset {
  id: string;
  kind: AssetKind;
  symbol: string;
  name: string;
  category: string;
  exchange: string;
  price: number | null;
  marketCap: number | null;
  change24h: number | null;
  volume24h: number | null;
  avgDailyDollarVolume: number | null;
  momentum: number | null;
  dataQuality: DataQuality;
  dataTimestamp: string;
  isDemo: boolean;
  stale: boolean;
  sourceLabel: string;
  sourceLinks: SourceLink[];
  priceHistory: PricePoint[];
  score: ScoreResult;
  warnings: string[];
  catalysts: string[];
  risks: string[];
  bullCase: string;
  bearCase: string;
  thesisNeeds: string[];
  invalidationPoints: string[];
  permanentLossCauses: string[];
  scenarios: Scenario[];
  timeHorizon: TimeHorizon;
  disqualified?: boolean;
}

export interface StockAsset extends BaseAsset {
  kind: 'stock';
  sector: string;
  enterpriseValue: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  freeCashFlow: number | null;
  cash: number | null;
  debt: number | null;
  priceToSales: number | null;
  priceToEarnings: number | null;
  estimateRevisions: number | null;
  insiderNetBuying: number | null;
  institutionalOwnership: number | null;
  shortInterest: number | null;
  daysToCover: number | null;
  publicFloat: number | null;
  relativeVolume: number | null;
  upcomingEarnings: string | null;
  recentFilings: SourceLink[];
  shelfRegistration: boolean | null;
  convertibleDebt: boolean | null;
  reverseSplitCount: number | null;
  dilutionRisk: 'low' | 'medium' | 'high' | 'unknown';
  otc: boolean;
  bankrupt: boolean | null;
  halted: boolean | null;
  retailAttention: number | null;
  optionsActivity: number | null;
  searchMomentum: number | null;
  socialMomentum: number | null;
  borrowPressure: number | null;
}

export interface CryptoAsset extends BaseAsset {
  kind: 'crypto';
  marketCapRank: number | null;
  liquidityScore: number | null;
  activeAddresses: number | null;
  transactionActivity: number | null;
  developerActivity: number | null;
  protocolRevenue: number | null;
  totalValueLocked: number | null;
  totalSupply: number | null;
  circulatingSupply: number | null;
  inflationRate: number | null;
  nextUnlock: string | null;
  holderConcentration: number | null;
  exchangeConcentration: number | null;
  securityIncidents: number | null;
  regulatoryRisk: 'low' | 'medium' | 'high' | 'unknown';
  athDrawdown: number | null;
}

export interface MemeAsset extends BaseAsset {
  kind: 'meme';
  chain: string;
  tokenAgeDays: number | null;
  fullyDilutedValuation: number | null;
  liquidity: number | null;
  volumeToLiquidity: number | null;
  holders: number | null;
  top10Concentration: number | null;
  developerWalletConcentration: number | null;
  contractVerified: boolean | null;
  ownershipRenounced: boolean | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  buyTax: number | null;
  sellTax: number | null;
  liquidityLocked: boolean | null;
  liquidityLockExpiration: string | null;
  audited: boolean | null;
  honeypot: boolean | null;
  rugPullRisk: boolean | null;
  largeWalletActivity: number | null;
  socialMomentum: number | null;
  exchangeListings: number | null;
}

export type MarketAsset = StockAsset | CryptoAsset | MemeAsset;

export interface MarketDataset {
  generatedAt: string;
  mode: 'live' | 'mixed' | 'demo';
  marketRegime: MarketRegime;
  regimeExplanation: string;
  assets: MarketAsset[];
  errors: string[];
}

export interface FilterState {
  search: string;
  maxPrice: number | null;
  maxMarketCap: number | null;
  minVolume: number | null;
  maxRisk: RiskGrade | 'all';
  category: string;
  minShortInterest: number | null;
  minMomentum: number | null;
  timeHorizon: TimeHorizon | 'all';
  exchange: string;
  dataQuality: DataQuality | 'all';
}
