import { describe, expect, it } from 'vitest';
import { detectMemeRisk, detectStockRisk, gradeRisk, memeRiskLabel } from '../src/utils/risk';

describe('risk flags', () => {
  it('grades risk independently from opportunity', () => {
    expect(gradeRisk(10)).toBe('A');
    expect(gradeRisk(82)).toBe('F');
  });

  it('disqualifies halted and ultra-illiquid stocks', () => {
    const result = detectStockRisk({ otc: false, bankrupt: false, halted: true, avgDailyDollarVolume: 200_000, reverseSplitCount: 0, dilutionRisk: 'low', dataQuality: 'high' });
    expect(result.disqualified).toBe(true);
    expect(result.flags).toContain('Trading halt identified');
  });

  it('disqualifies severe meme-token contract risks', () => {
    const result = detectMemeRisk({ honeypot: true, mintAuthority: false, freezeAuthority: false, top10Concentration: 30, liquidityLocked: true, contractVerified: true, liquidity: 1_000_000, rugPullRisk: false, dataQuality: 'medium' });
    expect(result.disqualified).toBe(true);
    expect(result.flags).toContain('Honeypot behavior detected');
  });

  it('never calls a meme token safe', () => {
    expect(memeRiskLabel(55, 'high')).toBe('High risk');
    expect(memeRiskLabel(90, 'high')).toBe('Extreme risk');
    expect(memeRiskLabel(70, 'insufficient')).toBe('Insufficient data');
  });
});
