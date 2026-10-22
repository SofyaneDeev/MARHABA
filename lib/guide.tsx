import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { cities as builtInCities, type City, type PlaceKind, type Season } from '@/data/cities';
import { parks as builtInParks, type Park, type ParkKind } from '@/data/parks';
import { seasonGuides as builtInSeasons, type SeasonGuide } from '@/data/seasons';
import { hasBackend, SUPABASE_URL, supabaseHeaders } from '@/lib/supabase';

/**
 * Where the guide on screen came from:
 * - live: just loaded from Supabase
 * - saved: the copy saved on this phone the last time it was online
 * - built-in: the guide shipped inside the app (first launch with no internet)
 */
export type GuideSource = 'live' | 'saved' | 'built-in';

export type GuideContent = { cities: City[]; parks: Park[]; seasons: SeasonGuide[] };
export type Guide = GuideContent & { source: GuideSource; savedAt?: number };

export const builtInGuide: Guide = {
  cities: builtInCities,
  parks: builtInParks,
  seasons: builtInSeasons,
  source: 'built-in',
};

const CACHE_KEY = 'marhaba.guide.v1';

/* ---------- Reading database rows safely ---------- */

const PLACE_KINDS: PlaceKind[] = ['gate', 'sight', 'square', 'market', 'garden', 'nature', 'nightlife'];
const PARK_KINDS: ParkKind[] = ['garden', 'park', 'national'];
const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];

type Row = Record<string, unknown>;
const isRow = (v: unknown): v is Row => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const byOrder = (a: Row, b: Row) => (num(a.sort_order) ?? 0) - (num(b.sort_order) ?? 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/**
 * Turns rows from Supabase into the app's guide. Rows with missing or unknown
 * values are skipped rather than crashing the app; returns null if nothing usable is left.
 */
export function parseGuide(raw: { cities: unknown; parks: unknown; seasons: unknown }): GuideContent | null {
  const cities: City[] = (Array.isArray(raw.cities) ? raw.cities : [])
    .filter(isRow)
    .sort(byOrder)
    .flatMap((row): City[] => {
      const name = str(row.name);
      const lat = num(row.lat);
      const lng = num(row.lng);
      const knownFor = str(row.known_for);
      const tipTitle = str(row.tip_title);
      const tipText = str(row.tip_text);
      const bestSeason = str(row.best_season);
      if (!name || lat === null || lng === null || !knownFor || !tipTitle || !tipText || !bestSeason) return [];
      const places = (Array.isArray(row.places) ? row.places : [])
        .filter(isRow)
        .sort(byOrder)
        .flatMap((p) => {
          const placeName = str(p.name);
          const description = str(p.description);
          const kind = p.kind as PlaceKind;
          return placeName && description && PLACE_KINDS.includes(kind) ? [{ name: placeName, kind, description }] : [];
        });
      return [
        {
          name,
          lat,
          lng,
          knownFor,
          tipTitle,
          tipText,
          bestSeason,
          seasons: strings(row.seasons).filter((s): s is Season => SEASONS.includes(s as Season)),
          nightlifeTip: str(row.nightlife_tip) ?? undefined,
          places,
        },
      ];
    });

  const parks: Park[] = (Array.isArray(raw.parks) ? raw.parks : [])
    .filter(isRow)
    .sort(byOrder)
    .flatMap((row) => {
      const name = str(row.name);
      const near = str(row.near);
      const bestFor = str(row.best_for);
      const kind = row.kind as ParkKind;
      return name && near && bestFor && PARK_KINDS.includes(kind) ? [{ name, near, bestFor, kind }] : [];
    });

  const seasons: SeasonGuide[] = (Array.isArray(raw.seasons) ? raw.seasons : [])
    .filter(isRow)
    .sort(byOrder)
    .flatMap((row) => {
      const season = row.season as Season;
      const label = str(row.label);
      const months = str(row.months);
      const experiences = str(row.experiences);
      return SEASONS.includes(season) && label && months && experiences
        ? [{ season, label, months, experiences, destinations: strings(row.destinations) }]
        : [];
    });

  if (cities.length === 0) return null;
  return {
    cities,
    // Keep the built-in lists if the database ones are empty or unreadable.
    parks: parks.length > 0 ? parks : builtInParks,
    seasons: seasons.length > 0 ? seasons : builtInSeasons,
  };
}

/* ---------- Loading ---------- */

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: supabaseHeaders() });
  if (!res.ok) throw new Error(`Guide request failed (${res.status})`);
  return res.json();
}

/** The latest guide from Supabase. Throws when offline or when the data is unusable. */
export async function fetchGuide(): Promise<GuideContent> {
  if (!hasBackend()) throw new Error('No backend configured');
  const [cities, parks, seasons] = await Promise.all([
    getJson('cities?select=*,places(name,kind,description,sort_order)&order=sort_order&places.order=sort_order'),
    getJson('parks?select=*&order=sort_order'),
    getJson('seasonal_recommendations?select=*&order=sort_order'),
  ]);
  const guide = parseGuide({ cities, parks, seasons });
  if (!guide) throw new Error('Guide data was empty');
  return guide;
}

async function readSaved(): Promise<Guide | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as GuideContent & { savedAt: number };
    return Array.isArray(saved.cities) && saved.cities.length > 0 ? { ...saved, source: 'saved' } : null;
  } catch {
    return null;
  }
}

/* ---------- Sharing it with the app ---------- */

// Screens rendered without the provider (tests, previews) get the built-in guide.
const GuideContext = createContext<Guide>(builtInGuide);
export const useGuide = () => useContext(GuideContext);

/** Shows the saved copy right away, then swaps in the live guide when it arrives. */
export function GuideProvider({ children }: { children: ReactNode }) {
  const [guide, setGuide] = useState<Guide>(builtInGuide);

  useEffect(() => {
    let cancelled = false;
    let gotLive = false;

    readSaved().then((saved) => {
      if (saved && !cancelled && !gotLive) setGuide(saved);
    });

    fetchGuide()
      .then((content) => {
        if (cancelled) return;
        gotLive = true;
        const savedAt = Date.now();
        setGuide({ ...content, source: 'live', savedAt });
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...content, savedAt })).catch(() => {});
      })
      .catch(() => {
        // Offline or unreachable: keep the saved or built-in guide.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <GuideContext.Provider value={guide}>{children}</GuideContext.Provider>;
}

/** Finds a city in the guide currently shown, falling back to its first city. */
export function cityByName(guide: Guide, name: string | null): City {
  return guide.cities.find((c) => c.name === name) ?? guide.cities[0];
}
