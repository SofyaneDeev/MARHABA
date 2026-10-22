import AsyncStorage from '@react-native-async-storage/async-storage';

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CAD', 'CHF'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** How many units of each currency one Moroccan dirham buys. */
export type Rates = { perDirham: Record<Currency, number>; updatedUtc: string; fetchedAt: number };

const CACHE_KEY = 'marhaba.rates';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
// Free, keyless rates by ExchangeRate-API (attribution shown in the app).
const RATES_URL = 'https://open.er-api.com/v6/latest/MAD';

/** Converts between a foreign currency and dirhams. */
export function convert(amount: number, perDirham: number, toDirham: boolean): number {
  if (!Number.isFinite(amount) || perDirham <= 0) return 0;
  return toDirham ? amount / perDirham : amount * perDirham;
}

/** Parses "12,5" or "12.5" into a number; empty or invalid text gives NaN. */
export function parseAmount(text: string): number {
  const cleaned = text.replace(/\s/g, '').replace(',', '.');
  return cleaned === '' || !/^\d*\.?\d*$/.test(cleaned) ? NaN : Number(cleaned);
}

export function formatMoney(value: number, currency: Currency | 'MAD'): string {
  const digits = value >= 100 ? 0 : 2;
  return `${value.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currency}`;
}

async function readCache(): Promise<Rates | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Rates) : null;
  } catch {
    return null;
  }
}

/**
 * Today's rates: fresh from the internet when the saved copy is older than 12 hours,
 * otherwise (or when offline) the saved copy. Null if there has never been a connection.
 */
export async function loadRates(now: number = Date.now()): Promise<Rates | null> {
  const cached = await readCache();
  if (cached && now - cached.fetchedAt < MAX_AGE_MS) return cached;
  try {
    const res = await fetch(RATES_URL);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    if (data.result !== 'success' || !data.rates) return cached;
    const perDirham = {} as Record<Currency, number>;
    for (const code of CURRENCIES) {
      const rate = data.rates[code];
      if (typeof rate !== 'number' || rate <= 0) return cached;
      perDirham[code] = rate;
    }
    const rates: Rates = { perDirham, updatedUtc: data.time_last_update_utc ?? '', fetchedAt: now };
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rates)).catch(() => {});
    return rates;
  } catch {
    return cached;
  }
}
