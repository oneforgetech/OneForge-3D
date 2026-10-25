// Section pager for the inner pages (mouse + keyboard). One wheel gesture or key
// press moves exactly one stop: the top of the next section, or the next screenful
// inside a section taller than the window. Trackpad momentum is ignored.
// Touch devices use native CSS scroll-snap instead (see globals.css).

import { createWheelGate } from './wheelGate';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function computeStops(): number[] {
  const vh = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const pts: number[] = [];
  document.querySelectorAll<HTMLElement>('[data-snap]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const bottom = top + r.height;
    let y = top;
    pts.push(y);
    // tall section: page through it a screenful at a time, ending bottom-aligned
    while (bottom - (y + vh) > vh * 0.2) {
      y += vh * 0.88;
      pts.push(y);
    }
  });
  pts.push(max);
  return [...new Set(pts.map((p) => Math.round(clamp(p, 0, max) )))].sort((a, b) => a - b);
}

export function createPager(): () => void {
  let animating = false;
  let raf = 0;
  const gate = createWheelGate();
  let animDir = 0;
  let pending = 0;
  let settleTimer = 0;
  let destroyed = false;

  const blocked = () => document.body.classList.contains('modal-open');
  const typing = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('input,textarea,select,[contenteditable]');

  function animateTo(to: number) {
    cancelAnimationFrame(raf);
    const from = window.scrollY;
    if (Math.abs(to - from) < 2) {
      animating = false;
      return;
    }
    const dur = clamp(420 + Math.abs(to - from) * 0.3, 520, 1000);
    const t0 = performance.now();
    animating = true;
    animDir = Math.sign(to - from);
    const tick = (now: number) => {
      if (destroyed) return;
      const p = clamp((now - t0) / dur);
      window.scrollTo(0, from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        animating = false;
        if (pending && !destroyed) {
          const d = Math.sign(pending);
          pending -= d;
          window.setTimeout(() => !animating && !destroyed && step(d), 40);
        }
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function step(dir: number) {
    const y = window.scrollY;
    const stops = computeStops();
    const target = dir > 0 ? stops.find((p) => p > y + 4) : [...stops].reverse().find((p) => p < y - 4);
    if (target != null) animateTo(target);
  }

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || blocked()) return;
    const el = e.target as HTMLElement | null;
    if (el?.closest?.('textarea,select,iframe')) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    if (Math.abs(e.deltaX) > Math.abs(dy)) return;
    const dir = Math.sign(dy);
    if (!dir) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    if ((dir > 0 && window.scrollY >= max - 1) || (dir < 0 && window.scrollY <= 0)) {
      gate(e.timeStamp, dy);
      return; // nothing further to page to
    }
    e.preventDefault();
    if (!gate(e.timeStamp, dy)) return; // the momentum tail of a flick we already acted on
    if (animating) {
      if (dir !== animDir) {
        cancelAnimationFrame(raf);
        animating = false;
        pending = 0;
        step(dir);
      } else {
        pending = Math.max(-2, Math.min(2, pending + dir)); // queue (up to two) for when this glide lands
      }
      return;
    }
    step(dir);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || blocked() || typing(e.target)) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest?.('summary,iframe')) return;
    if (e.key === ' ' && t?.closest?.('button,a')) return;
    let dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    else if (e.key === ' ') dir = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home') {
      e.preventDefault();
      animateTo(0);
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      animateTo(document.documentElement.scrollHeight - innerHeight);
      return;
    }
    if (!dir) return;
    e.preventDefault();
    if (!animating) step(dir);
    else if (dir === animDir) pending = Math.max(-2, Math.min(2, pending + dir));
  };

  // anything that lands between stops (scrollbar drag, anchor links) settles on the nearest
  const onScroll = () => {
    clearTimeout(settleTimer);
    if (animating) return;
    settleTimer = window.setTimeout(() => {
      if (destroyed || animating || blocked() || typing(document.activeElement)) return;
      const y = window.scrollY;
      const stops = computeStops();
      const nearest = stops.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a), stops[0]);
      if (Math.abs(nearest - y) > 3) animateTo(nearest);
    }, 220);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Touch release assist for the inner pages. Native scroll-snap does the paging; this only catches
 * a decisive swipe that the browser snapped straight back from (short or gentle), and completes it
 * to the next stop in the swipe direction.
 */
export function createTouchAssist(): () => void {
  let startY = 0;
  let startT = 0;
  let startScroll = 0;
  let dir = 0;
  let timer = 0;
  let tracking = false;

  const onStart = (e: TouchEvent) => {
    tracking = e.touches.length === 1;
    if (!tracking) return;
    clearTimeout(timer);
    startY = e.touches[0].clientY;
    startT = e.timeStamp;
    startScroll = window.scrollY;
  };
  const onEnd = (e: TouchEvent) => {
    if (!tracking || e.touches.length) return;
    tracking = false;
    const dy = startY - e.changedTouches[0].clientY;
    const v = Math.abs(dy) / Math.max(1, e.timeStamp - startT);
    if (Math.abs(dy) < 36 && v < 0.3) return;
    dir = Math.sign(dy);
    if (document.body.classList.contains('modal-open')) return;
    settle();
  };
  // wait until the browser has finished its own scroll/snap, then check where it ended up
  const settle = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (Math.abs(window.scrollY - startScroll) > 6) return; // native snap advanced — nothing to do
      const stops = computeStops();
      const target = dir > 0 ? stops.find((p) => p > startScroll + 4) : [...stops].reverse().find((p) => p < startScroll - 4);
      if (target != null) window.scrollTo({ top: target, behavior: 'smooth' });
    }, 380);
  };

  window.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchend', onEnd, { passive: true });
  return () => {
    clearTimeout(timer);
    window.removeEventListener('touchstart', onStart);
    window.removeEventListener('touchend', onEnd);
  };
}
