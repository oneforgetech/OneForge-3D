'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './TypewriterText.module.css';

/**
 * Typewriter reveal. The full text is always in the DOM (so it reads
 * normally to screen readers / with JS off) — the "typing" look comes from
 * a CSS width/steps animation that clips it, triggered once the element
 * scrolls into view. `prefers-reduced-motion` skips straight to the final
 * state.
 */
export function TypewriterText({
  text,
  className,
  as: Tag = 'span',
  cursor = true,
  durationMs,
  startDelayMs = 0,
}: {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'h2' | 'h3';
  cursor?: boolean;
  durationMs?: number;
  /** Extra pause after the element becomes visible, before typing starts — lets an earlier entrance animation finish first. */
  startDelayMs?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [wantsToType, setWantsToType] = useState(false);
  const [typing, setTyping] = useState(false);
  // `ch` is defined by the font's "0" glyph, which under-measures some
  // letters (an "S" was getting clipped by the cursor) — measure the
  // actual rendered text instead of guessing from character count.
  // `scrollWidth` reports the full content width even while CSS clips the
  // box to `width: 0`, so this doesn't need the text visible to measure it.
  // Measured only once, after web fonts are confirmed loaded: an earlier
  // measurement against a fallback font gets baked into the CSS
  // animation's `forwards`-held end width and a later correction to the
  // custom property doesn't retroactively fix an already-completed
  // animation, so typing is held back (below) until this is ready.
  const [charWidth, setCharWidth] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;
      setCharWidth(ref.current.scrollWidth);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setWantsToType(true));
      return () => cancelAnimationFrame(frame);
    }

    let timeout: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeout = window.setTimeout(() => setWantsToType(true), startDelayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [startDelayMs]);

  useEffect(() => {
    if (!wantsToType || charWidth <= 0) return;
    const frame = requestAnimationFrame(() => setTyping(true));
    return () => cancelAnimationFrame(frame);
  }, [wantsToType, charWidth]);

  const chars = [...text].length;
  const ms = durationMs ?? Math.max(600, chars * 55);

  return (
    <Tag
      ref={ref as never}
      className={`${styles.typewriter} ${typing ? styles.typing : ''} ${cursor ? styles.cursor : ''} ${className ?? ''}`}
      style={{ '--char-count': chars, '--char-width': `${charWidth}px`, '--type-duration': `${ms}ms` } as React.CSSProperties}
    >
      {text}
    </Tag>
  );
}
