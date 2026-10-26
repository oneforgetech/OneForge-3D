// The scroll world: one tall track, one sticky stage. Scroll position (smoothed)
// is turned into per-chapter CSS variables, the portal's mask/expansion, the
// active background, and the ember flow. Everything is a pure function of
// scroll position, so it plays backwards exactly as it plays forwards.

import { CHAPTERS, bgFocus, bgImageUrl } from './chapters';
import { createWheelGate } from '../wheelGate';
import { createEmbers } from './embers';
import { loadImage } from './media';
import { createPortal } from './portal';

const TOUCH_SCALE = 0.7;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export type FrameState = {
  /** Smoothed scroll within the track, px. */
  s: number;
  index: number;
  /** Content progress 0..1 per chapter. */
  t: number[];
  /** Enter / exit factors 0..1 per chapter. */
  inn: number[];
  out: number[];
};

export type WorldHandle = {
  goTo: (target: number | string, instant?: boolean) => void;
  subscribe: (fn: (st: FrameState) => void) => () => void;
  setIntro: (on: boolean) => void;
  destroy: () => void;
};

type Options = {
  track: HTMLElement;
  stage: HTMLElement;
  chapterEls: HTMLElement[];
  bgEls: HTMLElement[];
  portalCanvas: HTMLCanvasElement;
  portalSlot: HTMLElement;
  embersCanvas: HTMLCanvasElement;
  finePointer: boolean;
  onActive: (i: number) => void;
};

export function createWorld(o: Options): WorldHandle {
  const { track, stage, chapterEls, bgEls } = o;
  const N = CHAPTERS.length;
  const subs = new Set<(st: FrameState) => void>();

  // --- layout (px) -------------------------------------------------------
  let unit = 1; // 1vh in px
  let trackTop = 0;
  let range = 1;
  let starts: number[] = [];
  let contentPx: number[] = [];
  let portalPx: number[] = [];
  let stops: number[] = [];
  let firstStop: number[] = [];
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const html = document.documentElement;
  // On touch screens the scroll distance between stops is shortened, so one ordinary swipe is
  // enough for the browser's own scroll-snap to carry you to the next stop.
  const TSCALE = coarse ? TOUCH_SCALE : 1;
  let markers: HTMLElement[] = [];
  const buildMarkers = () => {
    if (!coarse) return;
    markers.forEach((m) => m.remove());
    markers = stops.slice(0, -1).map((y) => {
      const m = document.createElement('div');
      m.setAttribute('aria-hidden', 'true');
      m.style.cssText = `position:absolute;left:0;top:${Math.round(y)}px;width:1px;height:1px;pointer-events:none;visibility:hidden;scroll-snap-align:start;scroll-snap-stop:always;`;
      track.appendChild(m);
      return m;
    });
  };
  const layout = () => {
    unit = o.stage.clientHeight / 100;
    trackTop = track.getBoundingClientRect().top + window.scrollY;
    let acc = 0;
    starts = [];
    contentPx = [];
    portalPx = [];
    CHAPTERS.forEach((c) => {
      starts.push(acc);
      contentPx.push(c.contentVh * unit * TSCALE);
      portalPx.push(c.portalVh * unit * TSCALE);
      acc += (c.contentVh + c.portalVh) * unit * TSCALE;
    });
    range = Math.max(1, acc);
    stops = [];
    firstStop = [];
    CHAPTERS.forEach((c, i) => {
      firstStop.push(stops.length);
      c.rests.forEach((t) => stops.push(starts[i] + t * contentPx[i]));
    });
    // The footer boundary: past this, scrolling is native. On touch screens the footer's own top is
    // the final snap stop, so a swipe from the last section lands cleanly on it.
    stops.push(coarse ? range + o.stage.clientHeight : range);
    track.style.setProperty('--world-len', String(CHAPTERS.reduce((a, c) => a + c.contentVh + c.portalVh, 0) * TSCALE));
    buildMarkers();
  };
  layout();

  // --- engines -------------------------------------------------------------
  let portal: ReturnType<typeof createPortal> | null = null;
  try {
    portal = createPortal({
      canvas: o.portalCanvas,
      container: stage,
      slot: o.portalSlot,
      tilt: false,
      idleSway: false,
    });
  } catch {
    portal = null;
  }
  let embers: ReturnType<typeof createEmbers> | null = null;
  try {
    embers = createEmbers(o.embersCanvas, coarse ? 60 : 120);
  } catch {
    embers = null;
  }

  // Portal media = the NEXT chapter's photo, so at full expansion it equals that
  // chapter's DOM background exactly.
  let mediaIndex = -1;
  const setPortalMedia = (i: number) => {
    const next = i + 1;
    if (next >= N || mediaIndex === next) return;
    mediaIndex = next;
    void loadImage(bgImageUrl(next)).then((img) => {
      if (mediaIndex === next) portal?.setMedia(img, bgFocus(next));
    });
  };

  // --- state ----------------------------------------------------------------
  let s = clampScroll(window.scrollY - trackTop);
  let target = s;
  let prevS = s;
  let flow = 0;
  let introMask = 0;
  let introFrom = 0;
  let introStart = 0;
  let introOn = false;
  let activeIdx = -1;
  let lastBg = -1;
  let pastEnd = false;
  let raf = 0;
  let last = 0;
  let running = false;
  let visible = true;
  let onScreen = true;
  let destroyed = false;
  const cache: Record<string, string> = {};

  function clampScroll(v: number) {
    return clamp(v, 0, range);
  }

  const setVar = (el: HTMLElement, name: string, v: number, digits = 3) => {
    const str = v.toFixed(digits);
    const key = `${name}:${el.dataset.wid ?? ''}`;
    if (cache[key] === str) return;
    cache[key] = str;
    el.style.setProperty(name, str);
  };

  function apply(now: number) {
    const t: number[] = new Array(N).fill(0);
    const innArr: number[] = new Array(N).fill(1);
    const outArr: number[] = new Array(N).fill(0);
    let index = 0;
    let portalU = -1; // 0..1 inside a portal phase
    for (let i = 0; i < N; i++) {
      const end = starts[i] + contentPx[i] + portalPx[i];
      if (s >= starts[i] && (s < end || i === N - 1)) index = i;
      t[i] = clamp((s - starts[i]) / contentPx[i]);
    }
    const inPortal = portalPx[index] > 0 && s > starts[index] + contentPx[index];
    if (inPortal) portalU = clamp((s - starts[index] - contentPx[index]) / portalPx[index]);

    // chapter vars
    chapterEls.forEach((el, i) => {
      const enterPx = Math.min(contentPx[i] * 0.16, unit * 90);
      const exitPx = portalPx[i] > 0 ? Math.min(contentPx[i] * 0.12, unit * 70) : 0;
      const cEnd = starts[i] + contentPx[i];
      const inn = i === 0 ? 1 : easeInOutCubic(clamp((s - starts[i]) / enterPx));
      const out = exitPx ? easeInOutCubic(clamp((s - (cEnd - exitPx)) / exitPx)) : 0;
      el.style.visibility = (i === 0 || inn > 0.001) && out < 0.999 ? 'visible' : 'hidden';
      // only the section you're on takes taps and clicks; the others are see-through, never in the way
      el.style.pointerEvents = i === index ? '' : 'none';
      innArr[i] = inn;
      outArr[i] = out;
      setVar(el, '--in', inn);
      setVar(el, '--out', out);
      setVar(el, '--t', t[i]);
    });

    // portal + background
    // The hero has no window: it hands over to the next section with a soft crossfade.
    // Every later section opens the portal window as before.
    let mask = 0;
    let e = 0;
    let heroFade = 0;
    if (index === 0) {
      if (portalU >= 0) heroFade = easeInOutCubic(clamp((portalU - 0.1) / 0.8));
    } else if (portalU >= 0) {
      mask = easeInOutCubic(clamp(portalU / 0.22));
      e = easeInOutCubic(clamp((portalU - 0.5) / 0.5));
    }
    setPortalMedia(index);
    const nextDim = index < N - 1 ? CHAPTERS[index + 1].dim : CHAPTERS[index].dim;
    portal?.set(mask, e, nextDim);
    // the darkening layer eases from this chapter's value to the next as the hand-over happens
    const blend = index === 0 ? heroFade : portalU >= 0 ? e : 0;
    const dimNow = CHAPTERS[index].dim + (nextDim - CHAPTERS[index].dim) * blend;
    stage.style.setProperty('--dim', dimNow.toFixed(3));
    if (bgEls[1]) bgEls[1].style.opacity = index === 0 && heroFade > 0 ? heroFade.toFixed(3) : '';
    const heat = 4 * e * (1 - e);
    const bgIndex = index;
    if (bgIndex !== lastBg) {
      lastBg = bgIndex;
      bgEls.forEach((b, i) => b.classList.toggle('is-on', i === bgIndex));
    }
    // slow push-in on the current background
    const bgEl = bgEls[bgIndex];
    if (bgEl) bgEl.style.setProperty('--push', (1 + 0.07 * t[index]).toFixed(4));

    const portalOn = mask >= 0.9 && e < 0.15 && index < N - 1;
    stage.dataset.portal = portalOn ? 'on' : 'off';
    stage.toggleAttribute('data-native', window.scrollY - trackTop >= range - 1);
    stage.dataset.active = String(index);
    stage.style.setProperty('--flash', (heat * heat * 0.4).toFixed(3));
    document.documentElement.style.setProperty('--world-p', (s / range).toFixed(4));
    // once the stage scrolls away into the footer, the HUD rail steps aside
    const past = window.scrollY > trackTop + range + unit * 8;
    if (past !== pastEnd) {
      pastEnd = past;
      document.documentElement.toggleAttribute('data-world-past', past);
    }

    if (index !== activeIdx) {
      activeIdx = index;
      o.onActive(index);
    }

    subs.forEach((fn) => fn({ s, index, t, inn: innArr, out: outArr }));
    void now;
    return { heat };
  }

  function frame(now: number) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(now - (last || now), 50);
    last = now;
    target = clampScroll(window.scrollY - trackTop);
    const k = coarse ? 1 : 1 - Math.pow(0.9, dt / 16.67);
    s += (target - s) * k;
    if (Math.abs(target - s) < 0.1) s = target;
    const vel = ((s - prevS) / Math.max(dt, 1)) * 16.67;
    prevS = s;
    flow += (vel - flow) * 0.2;

    // intro mask tween (arrive chapter)
    if (introOn && introMask < 1) {
      introMask = easeInOutCubic(clamp((now - introStart) / 750)) * (1 - introFrom) + introFrom;
    }

    const { heat } = apply(now);
    const settling = portal ? portal.render(now) : false;
    embers?.render(dt, flow, heat);
    void settling;

    if (visible && onScreen) raf = requestAnimationFrame(frame);
    else running = false;
  }

  function wake() {
    if (destroyed || running || !visible || !onScreen) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }


  // --- paged scrolling ------------------------------------------------------
  // One gesture = one stop. Wheel, swipe and keys all step to the neighbouring
  // resting point and ignore the rest of that gesture (trackpad momentum
  // included). Past the footer boundary the page scrolls natively.
  let animating = false;
  let animRaf = 0;
  const gate = createWheelGate();
  let lastWheel = 0;
  let animDir = 0; // direction of the glide in progress
  let pending = 0; // one queued step, if a fresh flick arrives mid-glide
  let settleTimer = 0;
  const relY = () => window.scrollY - trackTop;
  const blocked = () => document.body.classList.contains('modal-open') || document.body.classList.contains('world-locked');
  const inZone = (dir: number) => {
    const y = relY();
    if (y > range + 1) return false;
    if (y >= range - 1 && dir > 0) return false;
    return true;
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateTo(rel: number, instant = false) {
    cancelAnimationFrame(animRaf);
    const from = window.scrollY;
    const to = Math.round(trackTop + rel);
    if (instant || reducedMotion || Math.abs(to - from) < 2) {
      if (coarse) html.style.scrollSnapType = 'none';
      window.scrollTo(0, to);
      if (coarse) requestAnimationFrame(() => ((html.style.scrollSnapType = ''), (html.style.overflow = '')));
      animating = false;
      wake();
      return;
    }
    const dist = Math.abs(to - from) / unit;
    const dur = clamp(520 + dist * 4, 700, 1400);
    const t0 = performance.now();
    animating = true;
    animDir = Math.sign(to - from);
    if (coarse) {
      html.style.scrollSnapType = 'none'; // otherwise each frame would snap to the nearest stop
      html.style.overflow = 'hidden'; // and leftover swipe momentum can't carry us past the target
    }
    const tick = (now: number) => {
      if (destroyed) return;
      const p = clamp((now - t0) / dur);
      window.scrollTo(0, from + (to - from) * easeInOutCubic(p));
      if (p < 1) animRaf = requestAnimationFrame(tick);
      else {
        animating = false;
        if (coarse) {
          html.style.scrollSnapType = '';
          window.setTimeout(() => !animating && (html.style.overflow = ''), 140);
        }
        // a fresh flick arrived while we were gliding: take that step now
        if (pending && !destroyed) {
          const d = Math.sign(pending);
          pending -= d;
          if (inZone(d)) window.setTimeout(() => !animating && !destroyed && stepDir(d), 40);
        }
      }
    };
    animRaf = requestAnimationFrame(tick);
    wake();
  }

  function stepDir(dir: number) {
    const y = relY();
    const eps = 2;
    const target = dir > 0 ? stops.find((p) => p > y + eps) : [...stops].reverse().find((p) => p < y - eps);
    if (target == null) return;
    animateTo(target);
  }

  const onWheel = (e: WheelEvent) => {
    if (coarse || e.ctrlKey || blocked()) return; // pinch-zoom, menu open, preloading
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    if (Math.abs(e.deltaX) > Math.abs(dy)) return;
    const dir = Math.sign(dy);
    if (!dir) return;
    if (!inZone(dir)) {
      // The tail of a trackpad flick keeps arriving after we've reached the footer
      // boundary; swallow it so one gesture doesn't also drag the footer into view.
      if (e.timeStamp - lastWheel < 160) {
        e.preventDefault();
        lastWheel = e.timeStamp;
      }
      gate(e.timeStamp, dy);
      return;
    }
    e.preventDefault();
    lastWheel = e.timeStamp;
    if (!gate(e.timeStamp, dy)) return; // the momentum tail of a flick we already acted on
    if (animating) {
      if (dir !== animDir) {
        // changed their mind mid-glide: reverse from wherever we are
        cancelAnimationFrame(animRaf);
        animating = false;
        pending = 0;
        stepDir(dir);
      } else {
        pending = Math.max(-2, Math.min(2, pending + dir)); // same direction: queue (up to two) for when this glide lands
      }
      return;
    }
    stepDir(dir);
  };

  // Touch: native scrolling + the browser's own scroll-snap (markers + CSS) carry the page. As a
  // safety net the browser's snap alone drops a short swipe back where it started, so on release we
  // also glide to the next stop in the direction swiped. A new swipe during a glide takes over.
  let touching = false;
  let tStartRel = 0;
  let tStartIdx = 0;
  let tStartY = 0;
  let tLastY = 0;
  const nearestIndex = (y: number) => stops.reduce((best, p, i) => (Math.abs(p - y) < Math.abs(stops[best] - y) ? i : best), 0);
  const onTouchStart = (e: TouchEvent) => {
    if (!coarse) return;
    cancelAnimationFrame(animRaf);
    animating = false;
    html.style.scrollSnapType = '';
    html.style.overflow = '';
    touching = e.touches.length === 1;
    if (!touching) return;
    tStartRel = relY();
    tStartIdx = nearestIndex(tStartRel);
    tStartY = tLastY = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (coarse && touching) tLastY = e.touches[0].clientY;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!coarse || !touching) return;
    touching = false;
    if (blocked() || tStartRel < 0 || tStartRel > stops[stops.length - 1] + 2) return; // inside the footer: native
    const moved = relY() - tStartRel;
    const finger = tStartY - (e.changedTouches[0]?.clientY ?? tLastY);
    let idx = tStartIdx;
    if (Math.abs(moved) > unit * 3 || Math.abs(finger) > 26) idx = tStartIdx + (moved !== 0 ? Math.sign(moved) : Math.sign(finger));
    idx = Math.min(stops.length - 1, Math.max(0, idx));
    if (tStartIdx === stops.length - 1 && moved > 0) return; // swiping on into the footer: native
    animateTo(stops[idx]);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || blocked()) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest('input,textarea,select,[contenteditable],iframe,summary')) return;
    if (e.key === ' ' && t?.closest('button,a')) return;
    let dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    else if (e.key === ' ') dir = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home' && inZone(-1)) {
      e.preventDefault();
      if (!animating) animateTo(stops[0]);
      return;
    } else if (e.key === 'End' && inZone(1)) {
      e.preventDefault();
      if (!animating) animateTo(stops[stops.length - 2]);
      return;
    }
    if (!dir || !inZone(dir)) return;
    e.preventDefault();
    if (!animating) stepDir(dir);
    else if (dir === animDir) pending = Math.max(-2, Math.min(2, pending + dir));
  };

  // Scrollbar drags, restored scroll positions and anything else that lands
  // between stops settles onto the nearest one.
  const onScrollSettle = () => {
    clearTimeout(settleTimer);
    if (animating || coarse) return; // touch: the browser's own scroll-snap settles on a stop
    settleTimer = window.setTimeout(() => {
      if (destroyed || animating || blocked()) return;
      const y = relY();
      if (y < 0 || y > range - 1) return;
      const nearest = stops.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a), stops[0]);
      if (Math.abs(nearest - y) > 3) animateTo(nearest);
    }, 180);
  };

  // --- listeners -------------------------------------------------------------
  const onScroll = () => {
    wake();
    onScrollSettle();
  };
  const onResize = () => {
    // Every stop is a multiple of the viewport height, so when the window changes size
    // (rotate, resize, split-screen) carry the scroll position across proportionally.
    // Otherwise the page keeps its old pixel offset and drifts into another section.
    const prevUnit = unit;
    const rel = relY();
    layout();
    if (prevUnit > 0 && Math.abs(unit - prevUnit) > 0.5) {
      cancelAnimationFrame(animRaf);
      animating = false;
      window.scrollTo(0, Math.round(trackTop + (rel / prevUnit) * unit));
      s = clampScroll(window.scrollY - trackTop);
      prevS = s;
    }
    portal?.resize();
    embers?.resize();
    wake();
  };
  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
    wake();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    wake();
  });
  io.observe(track);
  const ro = new ResizeObserver(() => onResize());
  ro.observe(stage);
  document.fonts?.ready.then(() => !destroyed && onResize());

  chapterEls.forEach((el, i) => (el.dataset.wid = String(i)));
  if (coarse) html.classList.add('world-snap');
  wake();

  return {
    goTo(targetChapter, instant = false) {
      const i = typeof targetChapter === 'number' ? targetChapter : CHAPTERS.findIndex((c) => c.id === targetChapter);
      if (i < 0 || i >= N) return;
      layout();
      animateTo(stops[firstStop[i]], instant);
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    setIntro(on) {
      if (on && !introOn) {
        introOn = true;
        introFrom = introMask;
        introStart = performance.now();
      }
      wake();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      clearTimeout(settleTimer);
      cancelAnimationFrame(animRaf);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      ro.disconnect();
      portal?.destroy();
      document.documentElement.style.removeProperty('--world-p');
      document.documentElement.removeAttribute('data-world-past');
      html.classList.remove('world-snap');
      html.style.scrollSnapType = '';
      html.style.overflow = '';
      markers.forEach((m) => m.remove());

    },
  };
}
