import { create } from 'zustand';

/** Tiny bridge between the scroll world and the chrome (HUD rail, portal caption, preloader). */
type WorldStore = {
  /** Index of the chapter currently on stage. */
  active: number;
  /** Furthest chapter reached this visit — lets heavy embeds mount late, once. */
  maxActive: number;
  /** The preloader (or its skip) has finished; the hero may reveal. */
  introReady: boolean;
  /** Smooth-scroll to a chapter by index or id. Registered by <World>. */
  goTo: (target: number | string) => void;
  setActive: (i: number) => void;
  setIntroReady: (v: boolean) => void;
  registerGoTo: (fn: (target: number | string) => void) => void;
};

export const useWorldStore = create<WorldStore>((set) => ({
  active: 0,
  maxActive: 0,
  introReady: false,
  goTo: () => {},
  setActive: (active) => set((s) => ({ active, maxActive: Math.max(s.maxActive, active) })),
  setIntroReady: (introReady) => set({ introReady }),
  registerGoTo: (goTo) => set({ goTo }),
}));
