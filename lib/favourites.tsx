import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { City, Place } from '@/data/cities';
import type { Phrase } from '@/data/phrases';

const STORAGE_KEY = 'marhaba.favourites';

export const phraseId = (p: Phrase) => `phrase:${p.darija}`;
export const placeId = (city: City, place: Place) => `place:${city.name}:${place.name}`;

/** Adds the id if missing, removes it if present, keeping the newest first. */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
}

type Favourites = {
  ids: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FavouritesContext = createContext<Favourites>({ ids: [], isSaved: () => false, toggle: () => {} });
export const useFavourites = () => useContext(FavouritesContext);

/** Saved phrases and places, kept on the phone so they work offline. */
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(saved)) setIds(saved.filter((x): x is string => typeof x === 'string'));
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = toggleId(current, id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ids, isSaved: (id: string) => ids.includes(id), toggle }), [ids, toggle]);
  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}
