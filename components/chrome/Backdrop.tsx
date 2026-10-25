'use client';

import { useEffect, useRef } from 'react';
import { createEmbers } from '@/lib/world/embers';
import styles from './Backdrop.module.css';

/** Fixed ember field for the inner pages: gradient behind the content, embers floating above the photos. */
export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let embers: ReturnType<typeof createEmbers>;
    try {
      embers = createEmbers(canvas, window.matchMedia('(pointer: coarse)').matches ? 60 : 120);
    } catch {
      return;
    }
    let raf = 0;
    let last = 0;
    let lastY = window.scrollY;
    let flow = 0;
    let visible = true;
    const frame = (now: number) => {
      const dt = Math.min(now - (last || now), 50);
      last = now;
      const y = window.scrollY;
      flow += ((y - lastY) / Math.max(dt, 1) * 16.67 - flow) * 0.2;
      lastY = y;
      embers.render(dt, flow, 0);
      if (visible) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onVis = () => {
      visible = document.visibilityState === 'visible';
      if (visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const onResize = () => embers.resize();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" />
      {/* above the page's photographs (like the home page), below the header and menu */}
      <canvas ref={ref} className={styles.particles} aria-hidden="true" />
    </>
  );
}
