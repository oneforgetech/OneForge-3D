import { createContext, useContext, useEffect } from 'react';
import type { FrameState } from '@/lib/world/controller';

export type WorldApi = { subscribe: (fn: (st: FrameState) => void) => () => void };

export const WorldContext = createContext<WorldApi | null>(null);

/** Run `fn` on every world frame (scroll-smoothed). No-op in static mode. */
export function useWorldFrame(fn: (st: FrameState) => void) {
  const api = useContext(WorldContext);
  useEffect(() => api?.subscribe(fn), [api, fn]);
}
