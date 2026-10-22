import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// During server rendering and hydration React uses the server snapshot (false),
// then re-renders on the client with the client snapshot (true).
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? client : server;
}
