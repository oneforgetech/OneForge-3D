'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import styles from './FloatingPlayer.module.css';

interface SpotifyPlaybackEvent {
  data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number };
}

interface SpotifyController {
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (e: SpotifyPlaybackEvent) => void) => void;
}

interface SpotifyIFrameAPI {
  createController: (
    el: HTMLElement,
    options: { uri: string; width: string | number; height: number },
    cb: (controller: SpotifyController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyApi?: SpotifyIFrameAPI;
  }
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (window.__spotifyApi) return Promise.resolve(window.__spotifyApi);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyApi = api;
        resolve(api);
      };
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    });
  }
  return apiPromise;
}

/**
 * Global player (lives in the root layout so playback survives route changes
 * and scrolling). Playback happens inside Spotify's official embed, controlled
 * through its iFrame API; the embed itself is the visible mini player. While
 * the hero's inline widget is on screen the embed stays mounted (so audio
 * never stops) but is tucked out of sight to avoid showing two players.
 *
 * Note: unauthenticated listeners get Spotify's 30-second preview; full
 * episodes play for visitors who are logged in to Spotify in their browser.
 */
export function FloatingPlayer() {
  const currentEpisode = useAppStore((s) => s.currentEpisode);
  const toggleRequest = useAppStore((s) => s.toggleRequest);
  const heroPlayerInView = useAppStore((s) => s.heroPlayerInView);
  const setPlayback = useAppStore((s) => s.setPlayback);
  const closePlayer = useAppStore((s) => s.closePlayer);

  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const loadedUriRef = useRef<string | null>(null);
  const seenToggleRef = useRef(toggleRequest);
  const uri = currentEpisode?.uri ?? null;

  useEffect(() => {
    if (!uri) return;
    let cancelled = false;

    if (controllerRef.current) {
      if (loadedUriRef.current !== uri) {
        controllerRef.current.loadUri(uri);
        controllerRef.current.play();
        loadedUriRef.current = uri;
      }
      return;
    }

    loadSpotifyApi().then((api) => {
      const host = mountRef.current;
      if (cancelled || !host) return;
      const target = document.createElement('div');
      host.appendChild(target);
      api.createController(target, { uri, width: '100%', height: 80 }, (controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        loadedUriRef.current = uri;
        controller.addListener('playback_update', (e) => {
          setPlayback({
            isPlaying: !e.data.isPaused,
            progress: e.data.position / 1000,
            duration: e.data.duration / 1000,
          });
        });
        controller.addListener('ready', () => controller.play());
      });
    });

    return () => {
      cancelled = true;
    };
  }, [uri, setPlayback]);

  useEffect(() => {
    if (toggleRequest !== seenToggleRef.current) {
      seenToggleRef.current = toggleRequest;
      controllerRef.current?.togglePlay();
    }
  }, [toggleRequest]);

  // Closing tears the embed down completely (stops audio).
  useEffect(() => {
    if (uri) return;
    controllerRef.current?.destroy();
    controllerRef.current = null;
    loadedUriRef.current = null;
    if (mountRef.current) mountRef.current.innerHTML = '';
  }, [uri]);

  const visible = !!uri && !heroPlayerInView;

  useEffect(() => {
    // On mobile the player becomes a full-width bottom bar, which would
    // otherwise sit on top of (and block taps on) the page bottom/footer.
    document.body.classList.toggle('has-floating-player', visible);
    return () => document.body.classList.remove('has-floating-player');
  }, [visible]);

  return (
    <div
      className={`${styles.player} ${visible ? styles.visible : ''}`}
      role="region"
      aria-label="Now playing"
      aria-hidden={!visible}
      hidden={!uri}
    >
      <div ref={mountRef} className={styles.embed} />
      <button type="button" className={styles.closeButton} onClick={closePlayer} aria-label="Close player">
        ×
      </button>
    </div>
  );
}
