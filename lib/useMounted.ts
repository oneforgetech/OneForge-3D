import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** False while the server renders and during hydration, true afterwards: keeps client-only output from clashing with the server HTML. */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
