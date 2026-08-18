import type { MemeAsset, RiskGrade, StockAsset } from '../types/market';

export function gradeRisk(risk: number): RiskGrade {
  if (risk < 20) return 'A';
  if (risk < 35) return 'B';
  if (risk < 50) return 'C';
  if (risk < 65) return 'D';
  if (risk < 80) return 'E';
  return 'F';
}

export interface RiskFlagResult {
  disqualified: boolean;
  flags: string[];
}

export function detectStockRisk(asset: Pick<StockAsset,
  'otc' | 'bankrupt' | 'halted' | 'avgDailyDollarVolume' | 'reverseSplitCount' | 'dilutionRisk' | 'dataQuality'
>): RiskFlagResult {
  const flags: string[] = [];
  if (asset.otc) flags.push('OTC security');
  if (asset.bankrupt) flags.push('Bankruptcy identified');
  if (asset.halted) flags.push('Trading halt identified');
  if (asset.avgDailyDollarVolume !== null && asset.avgDailyDollarVolume < 500_000) flags.push('Extremely low liquidity');
  if ((asset.reverseSplitCount ?? 0) >= 2) flags.push('Repeated reverse splits');
  if (asset.dilutionRisk === 'high') flags.push('Severe dilution risk');
  if (asset.dataQuality === 'insufficient') flags.push('Unreliable or missing data');
  return {
    disqualified: Boolean(asset.otc || asset.bankrupt || asset.halted || flags.includes('Extremely low liquidity')),
    flags,
  };
}

export function detectMemeRisk(asset: Pick<MemeAsset,
  'honeypot' | 'mintAuthority' | 'freezeAuthority' | 'top10Concentration' | 'liquidityLocked' | 'contractVerified' | 'liquidity' | 'rugPullRisk' | 'dataQuality'
>): RiskFlagResult {
  const flags: string[] = [];
  if (asset.honeypot === true) flags.push('Honeypot behavior detected');
  if (asset.mintAuthority === true) flags.push('Unrestricted mint authority');
  if (asset.freezeAuthority === true) flags.push('Transfer freeze authority present');
  if ((asset.top10Concentration ?? 0) > 80) flags.push('Extremely concentrated ownership');
  if (asset.liquidityLocked === false) flags.push('Liquidity is unlocked or removable');
  if (asset.contractVerified === false) flags.push('Unverified contract');
  if (asset.liquidity !== null && asset.liquidity < 100_000) flags.push('Very low liquidity');
  if (asset.rugPullRisk === true) flags.push('Severe rug-pull indicators');
  if (asset.dataQuality === 'insufficient') flags.push('Anonymous, unverifiable, or insufficient data');
  return { disqualified: flags.length > 0, flags };
}

export function memeRiskLabel(risk: number, dataQuality: string): 'Extreme risk' | 'Very high risk' | 'High risk' | 'Insufficient data' {
  if (dataQuality === 'insufficient') return 'Insufficient data';
  if (risk >= 85) return 'Extreme risk';
  if (risk >= 70) return 'Very high risk';
  return 'High risk';
}
