'use client';

import { create } from 'zustand';
import type { Episode } from './episodes';

/**
 * Playback lives inside Spotify's embedded player (driven through its iFrame
 * API by FloatingPlayer). The store is the app-side mirror: components ask for
 * playback via playEpisode(), and FloatingPlayer reports state back through
 * the setters as Spotify emits playback updates. Progress/duration are seconds.
 */
interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  /** Bumped when the same episode is requested again, meaning "toggle". */
  toggleRequest: number;
  playEpisode: (episode: Episode) => void;
  setPlayback: (playback: { isPlaying: boolean; progress: number; duration: number }) => void;
  closePlayer: () => void;
  /** True while the hero's own inline player widget is on screen — the
   * floating player hides then, since it would just duplicate it. */
  heroPlayerInView: boolean;
  setHeroPlayerInView: (inView: boolean) => void;
}

export const useAppStore = create<PlayerState>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  toggleRequest: 0,
  heroPlayerInView: false,
  setHeroPlayerInView: (inView) => set({ heroPlayerInView: inView }),
  playEpisode: (episode) => {
    if (get().currentEpisode?.id === episode.id) {
      set((s) => ({ toggleRequest: s.toggleRequest + 1 }));
      return;
    }
    set({ currentEpisode: episode, isPlaying: false, progress: 0, duration: 0 });
  },
  setPlayback: ({ isPlaying, progress, duration }) => set({ isPlaying, progress, duration }),
  closePlayer: () => set({ currentEpisode: null, isPlaying: false, progress: 0, duration: 0 }),
}));
