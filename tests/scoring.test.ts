import { describe, expect, it } from 'vitest';
import { scoreCrypto, scoreMeme, scoreStock } from '../src/utils/scoring';

describe('transparent scoring formulas', () => {
  it('applies the published stock weights', () => {
    const result = scoreStock({
      financialQuality: 80, valuation: 70, growth: 60, catalystStrength: 50,
      marketMomentum: 40, squeezeConditions: 30, liquidity: 20, dataQuality: 100,
    });
    expect(result.opportunity).toBe(57);
    expect(result.parts.reduce((sum, p) => sum + p.weight, 0)).toBeCloseTo(1);
  });

  it('keeps stock penalties separate and subtracts them', () => {
    const clean = scoreStock({ financialQuality: 70, valuation: 70, growth: 70, catalystStrength: 70, marketMomentum: 70, squeezeConditions: 70, liquidity: 70, dataQuality: 70 });
    const diluted = scoreStock({ financialQuality: 70, valuation: 70, growth: 70, catalystStrength: 70, marketMomentum: 70, squeezeConditions: 70, liquidity: 70, dataQuality: 70, dilution: 15 });
    expect(clean.opportunity).toBe(70);
    expect(diluted.opportunity).toBe(55);
    expect(diluted.penalties[0].label).toBe('Dilution');
  });

  it('uses the established crypto weights', () => {
    const result = scoreCrypto({ adoption: 100, liquidity: 100, tokenomics: 100, developerActivity: 100, security: 100, catalysts: 100, marketMomentum: 100, dataQuality: 100, risk: 25 });
    expect(result.opportunity).toBe(100);
  });

  it('never presents meme risk below high risk territory', () => {
    const result = scoreMeme({ liquidityQuality: 80, contractSafety: 80, holderDistribution: 80, volumeQuality: 80, tokenomics: 80, marketMomentum: 80, communityMomentum: 80, exchangeAvailability: 80, dataQuality: 80, risk: 10 });
    expect(result.opportunity).toBe(80);
    expect(result.risk).toBe(55);
  });
});
