'use client';

import { useEffect, useRef } from 'react';
import styles from './Cursor.module.css';

/**
 * Dot (exact) + ring (eased). Any element with `data-cursor="Label"` swells the
 * ring and shows the label. Only on fine pointers; the native cursor comes back
 * on touch, with reduced motion, or if anything throws.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !label) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let shown = false;
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - (last || now), 50);
      last = now;
      const k = 1 - Math.pow(0.8, dt / 16.67);
      x += (tx - x) * k;
      y += (ty - y) * k;
      ring.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      label.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        document.documentElement.classList.add('has-cursor');
        root.classList.add(styles.on);
        raf = requestAnimationFrame(loop);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button, summary, label');
      const text = el?.dataset.cursor ?? '';
      label.textContent = text;
      root.classList.toggle(styles.hot, !!el);
      root.classList.toggle(styles.labelled, !!text);
    };
    const onLeave = () => root.classList.remove(styles.on);
    const onEnter = () => shown && root.classList.add(styles.on);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <span ref={ringRef} className={styles.ring} />
      <span ref={dotRef} className={styles.dot} />
      <span ref={labelRef} className={styles.label} />
    </div>
  );
}
