'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

// Green-flame palette (#E9FFFB → #8EFFEA → #06ED89 → #06EDC3 → #032A26), hot core → cool tip.
// Drawn with normal blending (not additive) so the saturated greens stay visible on light sections too.
const STOPS = ['233,255,251', '142,255,234', '6,237,137', '6,237,195', '3,150,120', '3,42,38'];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number };

function makeSprite(rgb: string) {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.55)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
}

/**
 * The flame trail is drawn inside the page (the home stage or the inner-page main), on a layer
 * between the photographs and the text, so it never lingers over what you're reading.
 */
export function FireCursor() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let raf = 0;
    let tries = 0;
    const find = () => {
      const h = document.querySelector<HTMLElement>('[data-trail-host]');
      if (h) setHost(h);
      else if (tries++ < 60) raf = requestAnimationFrame(find);
    };
    raf = requestAnimationFrame(() => {
      setHost(null);
      find();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !host) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sprites = STOPS.map(makeSprite);
    const particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = { x: -1, y: -1 };
    let px = 0;
    let py = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.9,
          vy: -(0.6 + Math.random() * 1.4),
          life: 0,
          max: 34 + Math.random() * 26,
          size: 16 + Math.random() * 20,
          hue: 0,
        });
      }
      if (particles.length > 260) particles.splice(0, particles.length - 260);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
            for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.max) {
          particles.splice(i, 1);
          continue;
        }
        const t = p.life / p.max;
        p.x += p.vx + Math.sin((p.life + p.size) * 0.18) * 0.35;
        p.y += p.vy;
        p.vy *= 0.985;
        const idx = Math.min(sprites.length - 1, Math.floor(t * sprites.length));
        const size = p.size * (1 - t * 0.7);
        ctx.globalAlpha = Math.min(1, (1 - t) * 1.05);
        ctx.drawImage(sprites[idx], p.x - size, p.y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;
      if (particles.length) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      if (last.x < 0) last = { x: px, y: py };
      const dx = px - last.x;
      const dy = py - last.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.min(6, Math.ceil(dist / 14));
      for (let i = 1; i <= steps; i++) {
        spawn(last.x + (dx * i) / steps, last.y + (dy * i) / steps, 2);
      }
      last = { x: px, y: py };
      start();
    };

    const onLeave = () => {
      last = { x: -1, y: -1 };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [host]);

  if (!host) return null;
  return createPortal(
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: Number(host.dataset.trailHost) || 2 }}
    />,
    host,
  );
}
