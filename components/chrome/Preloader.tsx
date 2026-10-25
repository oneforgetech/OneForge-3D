'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { bgImageUrl } from '@/lib/world/chapters';
import { loadImage } from '@/lib/world/media';
import { useWorldStore } from '@/lib/world/store';
import styles from './Preloader.module.css';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const SEEN_KEY = 'of-world-seen';
const MIN_MS = 450;
const MAX_MS = 1400;

function shouldSkip() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string; downlink?: number; rtt?: number };
    deviceMemory?: number;
  };
  const conn = nav.connection;
  // low-end phones and slow links get the page straight away; a loading screen only adds waiting
  const slow =
    !!conn?.saveData ||
    ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '') ||
    (!!conn?.downlink && conn.downlink < 2) ||
    (!!conn?.rtt && conn.rtt >= 400) ||
    (!!nav.deviceMemory && nav.deviceMemory <= 2);
  let seen = false;
  try {
    seen = !!sessionStorage.getItem(SEEN_KEY);
  } catch {
    /* storage can be blocked */
  }
  // data-world-fallback: the page was slow to arrive and is already showing; no loading screen on top
  return reduced || slow || seen || !!window.location.hash || document.documentElement.hasAttribute('data-world-fallback');
}

/**
 * First visit of a session: forest-black screen, the hero video fading up
 * beneath, a thin 0–100% counter, and the logo gliding into the HUD. Skippable,
 * never on repeat visits / hash links / reduced motion / Save-Data, and it can
 * never hang: a hard cap releases the page whatever the network does.
 */
export function Preloader() {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  useIsoLayoutEffect(() => {
    skipRef.current = shouldSkip();
    if (skipRef.current) {
      document.documentElement.setAttribute('data-world-seen', '');
      setPhase('done');
      useWorldStore.getState().setIntroReady(true);
    }
    return () => useWorldStore.getState().setIntroReady(false);
  }, []);

  useEffect(() => {
    if (skipRef.current) return;
    const body = document.body;
    body.classList.add('world-preloading', 'world-locked');
    window.scrollTo(0, 0);

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => !cancelled && fn(), ms));

    let finished = false;
    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* ignore */
      }
      if (valueRef.current) valueRef.current.textContent = '100';
      countRef.current?.classList.add(styles.leaving);
      overlayRef.current?.classList.add(styles.fading);
      body.classList.remove('world-locked');
      useWorldStore.getState().setIntroReady(true);

      const logo = logoRef.current;
      const target = document.querySelector<HTMLElement>('[data-nav-logo]')?.querySelector<HTMLElement>('img, svg');
      const r = target?.getBoundingClientRect();
      const handoff = () => {
        body.classList.remove('world-preloading');
        body.classList.add('hud-reveal');
        logo?.classList.add(styles.logoGone);
        later(() => setPhase('done'), 300);
      };
      if (logo && r && r.width > 0) {
        logo.style.left = `${r.left + r.width / 2}px`;
        logo.style.top = `${r.top + r.height / 2}px`;
        logo.style.width = `${r.width}px`;
        logo.style.height = `${r.height}px`;
        later(handoff, 520);
      } else {
        handoff();
      }
    };
    finishRef.current = finish;

    const start = performance.now();
    const done = { fonts: false, hero: false, portal: false };
    const W = { fonts: 0.3, hero: 0.4, portal: 0.3 };
    if (document.fonts) document.fonts.ready.then(() => (done.fonts = true), () => (done.fonts = true));
    else done.fonts = true;
    // The hero shows its poster frame instantly; the video streams in behind it, so never wait on it.
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    video?.play().catch(() => {});
    void loadImage(bgImageUrl(0)).then(() => (done.hero = true));
    void loadImage(bgImageUrl(1)).then(() => (done.portal = true));

    let shown = 0;
    let lastTen = -1;
    const tick = () => {
      if (cancelled || finished) return;
      const elapsed = performance.now() - start;
      const real = (done.fonts ? W.fonts : 0) + (done.hero ? W.hero : 0) + (done.portal ? W.portal : 0);
      shown = Math.max(shown, Math.min(real, elapsed / MIN_MS));
      const pct = Math.round(shown * 100);
      if (valueRef.current) valueRef.current.textContent = String(pct);
      overlayRef.current?.style.setProperty('--p', shown.toFixed(3));
      const ten = Math.floor(pct / 10);
      if (ten !== lastTen) {
        lastTen = ten;
        overlayRef.current?.setAttribute('aria-valuenow', String(ten * 10));
      }
      if ((real >= 0.999 && elapsed >= MIN_MS) || elapsed >= MAX_MS) finish();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
      body.classList.remove('world-preloading', 'world-locked', 'hud-reveal');
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <>
      <div
        ref={overlayRef}
        className={styles.overlay}
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        onClick={() => finishRef.current()}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-position hand-off target, sized by JS */}
      <img ref={logoRef} className={styles.logo} src="/brand/oneforge-logo.png" alt="ONEFORGE" />
      <div ref={countRef} className={styles.count} aria-hidden="true">
        <span ref={valueRef} className={styles.value}>
          0
        </span>
        <span className={styles.percent}>%</span>
      </div>
      <button type="button" className={`${styles.skip} kicker`} onClick={() => finishRef.current()}>
        Skip
      </button>
    </>
  );
}
