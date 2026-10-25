'use client';

import { useEffect, useMemo, useRef } from 'react';
import { CHAPTERS, bgFocus, bgImageUrl } from '@/lib/world/chapters';
import { createWorld, type WorldHandle } from '@/lib/world/controller';
import { loadImage } from '@/lib/world/media';
import { useWorldStore } from '@/lib/world/store';
import Image from 'next/image';
import { CHAPTER_VIEWS } from './Chapters';
import { WorldContext, type WorldApi } from './context';
import styles from './World.module.css';

const TOTAL_VH = CHAPTERS.reduce((a, c) => a + c.contentVh + c.portalVh, 0);

export function World() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portalCanvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handleRef = useRef<WorldHandle | null>(null);
  const subsRef = useRef(new Set<(st: Parameters<WorldApi['subscribe']>[0] extends (s: infer S) => void ? S : never) => void>());

  const introReady = useWorldStore((s) => s.introReady);
  const active = useWorldStore((s) => s.active);
  const maxActive = useWorldStore((s) => s.maxActive);
  const goTo = useWorldStore((s) => s.goTo);

  // Subscriptions registered by chapters before the controller exists are replayed onto it.
  const api = useMemo<WorldApi>(
    () => ({
      subscribe(fn) {
        subsRef.current.add(fn);
        const off = handleRef.current?.subscribe(fn);
        return () => {
          subsRef.current.delete(fn);
          off?.();
        };
      },
    }),
    [],
  );

  useEffect(() => {
    // If the safety net switched us to the plain page because the code was slow to arrive, upgrade
    // back to the full experience now that it has (unless the visitor asked for reduced motion).
    const html = document.documentElement;
    let resumeAt = -1;
    if (html.hasAttribute('data-world-fallback') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // remember which section the visitor was reading in the plain page, so we resume there
      const vh = window.innerHeight;
      document.querySelectorAll('section[aria-label]').forEach((sec, i) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) resumeAt = i;
      });
      html.removeAttribute('data-world-fallback');
      html.setAttribute('data-world-live', '');
    }
    if (!html.hasAttribute('data-world-live')) return; // static mode
    const track = trackRef.current;
    const stage = stageRef.current;
    const portalCanvas = portalCanvasRef.current;
    const embersCanvas = embersRef.current;
    const slot = slotRef.current;
    if (!track || !stage || !portalCanvas || !embersCanvas || !slot) return;

    const store = useWorldStore.getState();
    let handle: WorldHandle;
    try {
      handle = createWorld({
      track,
      stage,
      chapterEls: chapterRefs.current.filter(Boolean) as HTMLElement[],
      bgEls: bgRefs.current.filter(Boolean) as HTMLElement[],
      portalCanvas,
      portalSlot: slot,
      embersCanvas,
      finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
      onActive: (i) => useWorldStore.getState().setActive(i),
      });
    } catch {
      // If the engine can't start, fall back to the plain readable page instead of a blank one.
      document.documentElement.removeAttribute('data-world-live');
      return;
    }
    handleRef.current = handle;
    (window as unknown as { __worldReady?: boolean }).__worldReady = true;
    const offs = [...subsRef.current].map((fn) => handle.subscribe(fn));
    store.registerGoTo((t) => handle.goTo(t));
    if (useWorldStore.getState().introReady) handle.setIntro(true);

    // hash links (/#listen …) land on their chapter
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => handle.goTo(hash, true));
    else if (resumeAt > 0) requestAnimationFrame(() => handle.goTo(resumeAt, true));

    return () => {
      offs.forEach((o) => o());
      handle.destroy();
      handleRef.current = null;
      useWorldStore.getState().registerGoTo(() => {});
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('world-intro', introReady);
    if (introReady) handleRef.current?.setIntro(true);
    return () => document.body.classList.remove('world-intro');
  }, [introReady]);

  // quietly fetch the photo two sections ahead (the next one is loaded by the portal itself)
  useEffect(() => {
    const ahead = active + 2;
    if (ahead < CHAPTERS.length) void loadImage(bgImageUrl(ahead));
  }, [active]);

  const next = CHAPTERS[active + 1];

  return (
    <WorldContext.Provider value={api}>
      <div ref={trackRef} className={styles.track} style={{ '--world-len': TOTAL_VH } as React.CSSProperties}>
        <div ref={stageRef} className={styles.stage} data-trail-host="5">
          <div className={styles.bgs} aria-hidden="true">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => void (bgRefs.current[i] = el)}
                className={`${styles.bg} ${i === 0 ? 'is-on' : ''}`}
                style={{ '--fx': `${bgFocus(i)[0] * 100}%`, '--fy': `${bgFocus(i)[1] * 100}%`, backgroundImage: c.bg.placeholder ? `url(${c.bg.placeholder})` : undefined } as React.CSSProperties}
              >
                {c.bg.video ? (
                  <video data-hero-video muted loop playsInline autoPlay preload="metadata" poster={c.bg.src}>
                    <source src="/video/hero-forge.webm" type="video/webm" />
                    <source src="/video/hero-forge.mp4" type="video/mp4" />
                  </video>
                ) : i <= maxActive + 1 ? (
                  // Photos mount only for the section you're on and the one after it, so six
                  // large images don't fight the page's own code for a slow connection.
                  <Image src={c.bg.src} alt="" fill sizes="100vw" priority={i === 1} />
                ) : null}
              </div>
            ))}
          </div>
          <div className={styles.shade} aria-hidden="true" />
          <div className={styles.dimmer} aria-hidden="true" />
          <canvas ref={portalCanvasRef} className={styles.portalCanvas} aria-hidden="true" />
          <canvas ref={embersRef} className={styles.embers} aria-hidden="true" />
          <div className={styles.flash} aria-hidden="true" />

          <div className={styles.scene}>
            {CHAPTERS.map((c, i) => {
              const View = CHAPTER_VIEWS[c.id];
              return (
                <section
                  key={c.id}
                  id={c.id}
                  ref={(el) => void (chapterRefs.current[i] = el)}
                  className={`${styles.chapter} ${styles[c.id]}`}
                  aria-label={c.label}
                >
                  <View />
                </section>
              );
            })}
          </div>

          <div ref={slotRef} className={styles.portalUI}>
            {next && active > 0 && (
              <>
                <button type="button" className={styles.portalBtn} onClick={() => goTo(active + 1)} aria-label={`Go to ${next.caption}`} data-cursor="Step in" />
              </>
            )}
          </div>
        </div>
      </div>
    </WorldContext.Provider>
  );
}
