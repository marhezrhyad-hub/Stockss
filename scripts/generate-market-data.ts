import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MarketAsset, MarketDataset } from '../src/types/market';
import { demoDataset } from '../src/data/demoAssets';
import { fetchCoinGeckoEstablished, fetchCoinGeckoMemes } from './adapters/coingecko';
import { fetchFinnhubStocks } from './adapters/finnhub';
import { validateAndDedupe } from './validate';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const outputPath = resolve(projectRoot, 'public/data/market-data.json');
const retrievedAt = new Date().toISOString();
const errors: string[] = [];
const collected: MarketAsset[] = [];
let usedDemo = false;
let usedLive = false;

async function attempt<T>(label: string, action: () => Promise<T>, fallback: T): Promise<T> {
  try { const value = await action(); usedLive = true; return value; }
  catch (error) { usedDemo = true; errors.push(`${label}: ${error instanceof Error ? error.message : 'unknown provider error'}`); return fallback; }
}

if (process.env.FORCE_DEMO_DATA === 'true') {
  usedDemo = true;
  collected.push(...demoDataset.assets);
  errors.push('FORCE_DEMO_DATA=true; provider requests were skipped.');
} else {
  const demoStocks = demoDataset.assets.filter((asset) => asset.kind === 'stock');
  const demoCrypto = demoDataset.assets.filter((asset) => asset.kind === 'crypto');
  const demoMemes = demoDataset.assets.filter((asset) => asset.kind === 'meme');
  const key = process.env.FINNHUB_API_KEY?.trim();
  if (key) {
    const symbols = (process.env.STOCK_SYMBOLS || 'RKLB,SOFI,IONQ,ASTS,JOBY,OPEN,ACHR,SOUN').split(',').map((symbol) => symbol.trim().toUpperCase()).filter(Boolean).slice(0, 12);
    collected.push(...await attempt('Finnhub stocks', () => fetchFinnhubStocks(symbols, key, retrievedAt), demoStocks));
  } else {
    usedDemo = true; errors.push('FINNHUB_API_KEY is missing; fictional demo stocks were used.'); collected.push(...demoStocks);
  }
  const cgKey = process.env.COINGECKO_API_KEY?.trim();
  collected.push(...await attempt('CoinGecko established crypto', () => fetchCoinGeckoEstablished(cgKey, retrievedAt), demoCrypto));
  collected.push(...await attempt('CoinGecko meme coins', () => fetchCoinGeckoMemes(cgKey, retrievedAt), demoMemes));
}

const validated = validateAndDedupe(collected);
errors.push(...validated.errors);
const liveChange = validated.assets.filter((asset) => !asset.isDemo && asset.change24h !== null);
const positiveShare = liveChange.length ? liveChange.filter((asset) => (asset.change24h ?? 0) > 0).length / liveChange.length : 0.5;
const marketRegime = liveChange.length < 5 ? 'neutral' : positiveShare >= 0.65 ? 'risk-on' : positiveShare <= 0.35 ? 'risk-off' : 'neutral';
const dataset: MarketDataset = {
  generatedAt: retrievedAt,
  mode: usedLive && usedDemo ? 'mixed' : usedLive ? 'live' : 'demo',
  marketRegime,
  regimeExplanation: liveChange.length < 5 ? 'Neutral because broad live coverage is insufficient.' : `Breadth proxy: ${(positiveShare * 100).toFixed(0)}% of covered assets had a positive daily/24-hour change.`,
  assets: validated.assets,
  errors,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
console.log(`Generated ${validated.assets.length} assets in ${dataset.mode} mode at ${outputPath}`);
if (errors.length) console.log(errors.map((error) => `- ${error}`).join('\n'));
