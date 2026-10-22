import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import CitiesScreen from '@/app/(tabs)/medina';
import { builtInGuide, GuideProvider, parseGuide } from '@/lib/guide';

jest.mock('@/lib/supabase', () => ({
  hasBackend: () => true,
  SUPABASE_URL: 'https://test.supabase.co',
  supabaseHeaders: (extra: Record<string, string> = {}) => ({ apikey: 'anon', ...extra }),
}));

const CITY_ROW = {
  id: 'fes',
  name: 'Fes',
  lat: 34.03,
  lng: -5,
  known_for: 'Edited in Supabase',
  tip_title: 'Tip',
  tip_text: 'Walk uphill to leave the medina.',
  best_season: 'Spring',
  seasons: ['spring', 'monsoon'],
  nightlife_tip: null,
  sort_order: 10,
  places: [
    { name: 'Second', kind: 'sight', description: 'Shown second.', sort_order: 20 },
    { name: 'First', kind: 'garden', description: 'Shown first.', sort_order: 10 },
    { name: 'Broken', kind: 'castle', description: 'Unknown kind, skipped.', sort_order: 30 },
  ],
};

const realFetch = globalThis.fetch;
const respond = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

beforeEach(async () => {
  await AsyncStorage.clear();
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

describe('parseGuide', () => {
  it('maps rows to the app’s guide, in order, skipping bad values', () => {
    const guide = parseGuide({ cities: [CITY_ROW], parks: [], seasons: [] })!;
    const fes = guide.cities[0];
    expect(fes.knownFor).toBe('Edited in Supabase');
    expect(fes.seasons).toEqual(['spring']);
    expect(fes.nightlifeTip).toBeUndefined();
    expect(fes.places.map((p) => p.name)).toEqual(['First', 'Second']);
    // Empty park and season lists fall back to the built-in ones.
    expect(guide.parks).toBe(builtInGuide.parks);
    expect(guide.seasons).toBe(builtInGuide.seasons);
  });

  it('skips cities with missing fields and rejects an empty guide', () => {
    expect(parseGuide({ cities: [{ ...CITY_ROW, lat: 'north' }], parks: [], seasons: [] })).toBeNull();
    expect(parseGuide({ cities: 'nope', parks: null, seasons: undefined })).toBeNull();
  });
});

describe('GuideProvider', () => {
  it('shows the live guide and saves it for offline use', async () => {
    globalThis.fetch = jest.fn(async (url: string) =>
      respond(url.includes('/cities') ? [CITY_ROW] : []),
    ) as unknown as typeof fetch;

    await render(
      <GuideProvider>
        <CitiesScreen />
      </GuideProvider>,
    );
    expect(await screen.findByText('Edited in Supabase')).toBeTruthy();
    expect(screen.getByText('Guide up to date.')).toBeTruthy();
    expect(await AsyncStorage.getItem('marhaba.guide.v1')).toContain('Edited in Supabase');
  });

  it('uses the saved copy when offline', async () => {
    const saved = parseGuide({ cities: [CITY_ROW], parks: [], seasons: [] })!;
    await AsyncStorage.setItem('marhaba.guide.v1', JSON.stringify({ ...saved, savedAt: Date.UTC(2026, 9, 22, 9, 30) }));
    globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;

    await render(
      <GuideProvider>
        <CitiesScreen />
      </GuideProvider>,
    );
    expect(await screen.findByText('Edited in Supabase')).toBeTruthy();
    expect(screen.getByText(/Offline copy from/)).toBeTruthy();
  });

  it('falls back to the built-in guide on a first launch with no internet', async () => {
    globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;

    await render(
      <GuideProvider>
        <CitiesScreen />
      </GuideProvider>,
    );
    expect(screen.getByText('The Red City: souks, palaces and Jemaa el-Fna')).toBeTruthy();
    expect(screen.getByText('Built-in guide. It updates when you’re online.')).toBeTruthy();
  });
});
