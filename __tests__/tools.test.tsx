import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import type { ReactElement } from 'react';

import PhrasesScreen from '@/app/(tabs)/phrases';
import ToolsScreen from '@/app/(tabs)/tools';
import { cities } from '@/data/cities';
import { convert, formatMoney, loadRates, parseAmount } from '@/lib/currency';
import { FavouritesProvider, toggleId } from '@/lib/favourites';
import { formatMoroccoTime, nextPrayer, prayerTimes } from '@/lib/prayer';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const RATES_RESPONSE = {
  result: 'success',
  time_last_update_utc: 'Wed, 21 Oct 2026 00:02:32 +0000',
  rates: { EUR: 0.0909, USD: 0.102, GBP: 0.0764, CAD: 0.1434, CHF: 0.0842 },
};

const realFetch = globalThis.fetch;
beforeEach(async () => {
  await AsyncStorage.clear();
  globalThis.fetch = jest.fn(async () => ({ ok: true, json: async () => RATES_RESPONSE })) as unknown as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

const withFavourites = (ui: ReactElement) => <FavouritesProvider>{ui}</FavouritesProvider>;

describe('currency', () => {
  it('converts both ways', () => {
    expect(convert(100, 0.1, true)).toBeCloseTo(1000);
    expect(convert(1000, 0.1, false)).toBeCloseTo(100);
  });

  it('reads amounts typed with a comma or a dot', () => {
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount(' 1 000 ')).toBe(1000);
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });

  it('formats money for reading', () => {
    expect(formatMoney(1100.4, 'MAD')).toBe('1,100 MAD');
    expect(formatMoney(9.5, 'EUR')).toBe('9.50 EUR');
  });

  it('keeps the saved rates when offline', async () => {
    const first = await loadRates(0);
    expect(first?.perDirham.EUR).toBe(0.0909);

    globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    const later = await loadRates(24 * 60 * 60 * 1000);
    expect(later?.perDirham.EUR).toBe(0.0909);
  });
});

describe('prayer times', () => {
  const marrakech = cities.find((c) => c.name === 'Marrakech')!;
  const day = new Date('2026-10-21T10:00:00Z');

  it('lists the day in order', () => {
    const times = prayerTimes(marrakech.lat, marrakech.lng, day);
    expect(times.map((t) => t.name)).toEqual(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);
    for (let i = 1; i < times.length; i++) expect(times[i].time.getTime()).toBeGreaterThan(times[i - 1].time.getTime());
  });

  it('matches the expected times for Marrakech on 21 October 2026', () => {
    const shown = prayerTimes(marrakech.lat, marrakech.lng, day).map((t) => formatMoroccoTime(t.time));
    expect(shown).toEqual(['05:13', '06:39', '12:17', '15:27', '17:53', '19:10']);
  });

  it('finds the next prayer and skips sunrise', () => {
    const times = prayerTimes(marrakech.lat, marrakech.lng, day);
    expect(nextPrayer(times, new Date('2026-10-21T06:00:00Z'))).toBe('dhuhr');
    expect(nextPrayer(times, new Date('2026-10-21T23:00:00Z'))).toBeNull();
  });
});

describe('favourites', () => {
  it('adds new items first and removes them again', () => {
    expect(toggleId(['a'], 'b')).toEqual(['b', 'a']);
    expect(toggleId(['b', 'a'], 'b')).toEqual(['a']);
  });
});

describe('Phrases', () => {
  it('reads a phrase aloud in Arabic', async () => {
    await render(withFavourites(<PhrasesScreen />));
    await fireEvent.press(screen.getByLabelText('Listen: Shukran'));
    expect(Speech.speak).toHaveBeenCalledWith('شكرا', expect.objectContaining({ language: 'ar-SA' }));
  });
});

describe('Tools', () => {
  it('converts euros to dirhams with live rates', async () => {
    await render(withFavourites(<ToolsScreen />));
    expect(await screen.findByText('= 1,100 MAD')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Swap currencies'));
    expect(screen.getByText('= 9.09 EUR')).toBeTruthy();
  });

  it('shows saved phrases', async () => {
    await render(
      withFavourites(
        <>
          <PhrasesScreen />
          <ToolsScreen />
        </>,
      ),
    );
    expect(screen.getByText(/Tap ☆ on a phrase or a place/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Save Bslama'));
    // Starred both in the phrase list and in the Saved card.
    expect(await screen.findAllByLabelText('Remove Bslama from saved')).toHaveLength(2);
    expect(screen.queryByText(/Tap ☆ on a phrase or a place/)).toBeNull();
  });
});

describe('SOS button', () => {
  it('opens the emergency screen, not another tab', async () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    router.push.mockClear();
    await render(withFavourites(<ToolsScreen />));
    await fireEvent.press(screen.getByLabelText('Emergency help: police 19, ambulance 15, mobile 112'));
    expect(router.push).toHaveBeenCalledWith('/sos');
  });
});
