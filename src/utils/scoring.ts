import type { ScorePart, ScorePenalty, ScoreResult } from '../types/market';
import { gradeRisk } from './risk';

export interface StockScoreInput {
  financialQuality: number;
  valuation: number;
  growth: number;
  catalystStrength: number;
  marketMomentum: number;
  squeezeConditions: number;
  liquidity: number;
  dataQuality: number;
  dilution?: number;
  excessiveDebt?: number;
  poorLiquidity?: number;
  accountingConcerns?: number;
  missingData?: number;
  reverseSplits?: number;
  insiderSelling?: number;
  extremeVolatility?: number;
}

export interface CryptoScoreInput {
  adoption: number;
  liquidity: number;
  tokenomics: number;
  developerActivity: number;
  security: number;
  catalysts: number;
  marketMomentum: number;
  dataQuality: number;
  risk: number;
}

export interface MemeScoreInput {
  liquidityQuality: number;
  contractSafety: number;
  holderDistribution: number;
  volumeQuality: number;
  tokenomics: number;
  marketMomentum: number;
  communityMomentum: number;
  exchangeAvailability: number;
  dataQuality: number;
  risk: number;
}

const bounded = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
const rounded = (value: number) => Math.round(value * 10) / 10;

function part(label: string, score: number, weight: number, explanation: string): ScorePart {
  return { label, score: bounded(score), weight, explanation };
}

function combine(parts: ScorePart[], penalties: ScorePenalty[], risk: number, label: string): ScoreResult {
  const weighted = parts.reduce((sum, item) => sum + item.score * item.weight, 0);
  const penaltyTotal = penalties.reduce((sum, item) => sum + item.points, 0);
  const opportunity = bounded(weighted - penaltyTotal);
  return {
    opportunity: rounded(opportunity),
    risk: rounded(bounded(risk)),
    riskGrade: gradeRisk(risk),
    parts,
    penalties,
    explanation: `${label} is a weighted research score, reduced by ${rounded(penaltyTotal)} separate penalty points. It is not a forecast or recommendation.`,
  };
}

export function scoreStock(input: StockScoreInput): ScoreResult {
  const parts = [
    part('Financial quality', input.financialQuality, 0.2, 'Cash generation, balance-sheet strength, and operating quality.'),
    part('Valuation', input.valuation, 0.15, 'Valuation relative to fundamentals, not the nominal share price.'),
    part('Growth', input.growth, 0.15, 'Revenue and earnings trajectory.'),
    part('Catalyst strength', input.catalystStrength, 0.15, 'Specific, time-bound events with credible evidence.'),
    part('Market momentum', input.marketMomentum, 0.1, 'Price and volume trend without assuming persistence.'),
    part('Potential squeeze conditions', input.squeezeConditions, 0.1, 'Short interest, float, days to cover, and attention; no squeeze is predicted.'),
    part('Liquidity', input.liquidity, 0.1, 'Ability to trade without excessive price impact.'),
    part('Data quality', input.dataQuality, 0.05, 'Coverage, freshness, and source reliability.'),
  ];
  const penaltyMap: Array<[string, number | undefined, string]> = [
    ['Dilution', input.dilution, 'Potential new shares or convertibles can reduce each holder’s ownership.'],
    ['Excessive debt', input.excessiveDebt, 'Debt can impair flexibility or create refinancing risk.'],
    ['Poor liquidity', input.poorLiquidity, 'Thin trading can amplify slippage and volatility.'],
    ['Accounting concerns', input.accountingConcerns, 'Reporting quality or controls require extra skepticism.'],
    ['Missing data', input.missingData, 'Incomplete inputs reduce confidence in the ranking.'],
    ['Reverse splits', input.reverseSplits, 'Repeated reverse splits can indicate a destructive capital history.'],
    ['Insider selling', input.insiderSelling, 'Meaningful net selling may weaken alignment.'],
    ['Extreme volatility', input.extremeVolatility, 'Large swings increase loss and timing risk.'],
  ];
  const penalties = penaltyMap
    .filter(([, points]) => Boolean(points && points > 0))
    .map(([label, points, explanation]) => ({ label, points: bounded(points ?? 0), explanation }));
  const risk = bounded(100 - input.financialQuality * 0.25 - input.liquidity * 0.15 + penalties.reduce((s, p) => s + p.points, 0) * 1.4);
  return combine(parts, penalties, risk, 'Stock Opportunity Score');
}

export function scoreCrypto(input: CryptoScoreInput): ScoreResult {
  const parts = [
    part('Adoption & network usage', input.adoption, 0.2, 'Usage, activity, and demonstrated demand.'),
    part('Liquidity', input.liquidity, 0.15, 'Trading depth and exchange access.'),
    part('Tokenomics', input.tokenomics, 0.15, 'Supply, inflation, unlocks, and concentration.'),
    part('Developer activity', input.developerActivity, 0.15, 'Sustained protocol development and maintenance.'),
    part('Security', input.security, 0.15, 'Design resilience and incident history.'),
    part('Catalysts', input.catalysts, 0.1, 'Credible adoption or protocol milestones.'),
    part('Market momentum', input.marketMomentum, 0.05, 'Price trend; deliberately a small weight.'),
    part('Data quality', input.dataQuality, 0.05, 'Coverage, freshness, and source reliability.'),
  ];
  return combine(parts, [], input.risk, 'Established Crypto Score');
}

export function scoreMeme(input: MemeScoreInput): ScoreResult {
  const parts = [
    part('Liquidity quality', input.liquidityQuality, 0.2, 'Depth and durability of available liquidity.'),
    part('Contract safety', input.contractSafety, 0.2, 'Contract verification, permissions, taxes, and security signals.'),
    part('Holder distribution', input.holderDistribution, 0.15, 'Concentration across holders and developer wallets.'),
    part('Volume quality', input.volumeQuality, 0.1, 'Plausibility of volume relative to liquidity.'),
    part('Tokenomics', input.tokenomics, 0.1, 'Supply controls, inflation, and unlock risks.'),
    part('Market momentum', input.marketMomentum, 0.1, 'Price trend without treating momentum as safety.'),
    part('Community momentum', input.communityMomentum, 0.05, 'Organic attention; never a call for coordinated buying.'),
    part('Exchange availability', input.exchangeAvailability, 0.05, 'Breadth and quality of trading venues.'),
    part('Data quality', input.dataQuality, 0.05, 'Coverage, freshness, and verifiability.'),
  ];
  return combine(parts, [], Math.max(55, input.risk), 'Meme-Coin Score');
}
