'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Writes scroll progress for an element to a CSS variable and calls back with it.
 *  - 'cross'  : 0 when the element's top meets the viewport bottom, 1 when its bottom leaves the top.
 *  - 'sticky' : 0 when the element reaches the top, 1 when its sticky stage is about to leave.
 * Reduced motion gets a fixed, fully-revealed value instead of a moving one.
 */
export function useProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  mode: 'cross' | 'sticky',
  onChange?: (p: number) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = 0;
      if (reduced) p = mode === 'sticky' ? 1 : 0.5;
      else if (mode === 'cross') p = (vh - r.top) / (r.height + vh);
      else p = -r.top / Math.max(1, r.height - vh);
      p = Math.min(1, Math.max(0, p));
      el.style.setProperty('--sp', p.toFixed(4));
      onChange?.(p);
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, [ref, mode, onChange]);
}
