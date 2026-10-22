import { useSyncExternalStore } from 'react';

/**
 * Small hand-offs between screens that don't go through the URL:
 * - which tab to open after the "trip or tour?" choice,
 * - which city the Cities tab should show (from the trip planner).
 */

export type StartChoice = 'trip' | 'tour';

let startChoice: StartChoice | null = null;

export function setStartChoice(choice: StartChoice) {
  startChoice = choice;
}

/** Returns the pending choice once, then forgets it. */
export function takeStartChoice(): StartChoice | null {
  const c = startChoice;
  startChoice = null;
  return c;
}

type CityRequest = { city: string | null; n: number };
let cityRequest: CityRequest = { city: null, n: 0 };
const listeners = new Set<() => void>();

/** Asks the Cities tab to show this city. */
export function requestCity(city: string) {
  cityRequest = { city, n: cityRequest.n + 1 };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The latest city request (a new object each time a city is requested). */
export function useCityRequest(): CityRequest {
  return useSyncExternalStore(subscribe, () => cityRequest, () => cityRequest);
}
