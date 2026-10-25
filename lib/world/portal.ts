// Canvas portal: a rounded window that tilts toward the pointer over a
// screen-locked photo and expands to swallow the viewport. State (mask, e) is
// pushed in by the world controller from scroll position; this module only draws.

const FOCAL = 850;
const MAX_TILT_Y = 37.4; // ±18.7° across the width
const MAX_TILT_X = -33; // ±16.5° across the height
const CORNER_RATIO = 0.28; // radius as a share of the portal's width
const HEAT = '255,140,0'; // --of-orange
const FOREST = '13,43,43'; // --of-forest-black

type Pt = [number, number];

export type Portal = {
  setMedia: (img: HTMLImageElement | null, focus?: [number, number]) => void;
  /** mask: window scale 0..1. e: expansion 0..1. dim: the next chapter's darkening, applied as the window opens. */
  set: (mask: number, e: number, dim?: number) => void;
  pointer: (clientX: number, clientY: number) => void;
  pointerLeave: () => void;
  /** Draw one frame. Returns true while the tilt is still settling. */
  render: (now: number) => boolean;
  resize: () => void;
  destroy: () => void;
};

function roundedRectPoints(w: number, h: number, radius: number): Pt[] {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const corners: [number, number, number, number][] = [
    [w / 2 - r, -h / 2 + r, -Math.PI / 2, 0],
    [w / 2 - r, h / 2 - r, 0, Math.PI / 2],
    [-w / 2 + r, h / 2 - r, Math.PI / 2, Math.PI],
    [-w / 2 + r, -h / 2 + r, Math.PI, Math.PI * 1.5],
  ];
  const pts: Pt[] = [];
  for (const [cx, cy, a0, a1] of corners) {
    for (let i = 0; i <= 10; i++) {
      const a = a0 + ((a1 - a0) * i) / 10;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return pts;
}

export function createPortal(opts: {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  slot: HTMLElement;
  tilt: boolean;
  idleSway: boolean;
}): Portal {
  const { canvas, container, slot } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d canvas unavailable');

  let W = 0;
  let H = 0;
  let media: HTMLImageElement | null = null;
  let focus: [number, number] = [0.5, 0.5];
  let mask = 0;
  let e = 0;
  let dimNext = 0;
  let rotX = 0;
  let rotY = 0;
  let targetX = 0;
  let targetY = 0;
  let last = 0;
  const t0 = performance.now();

  const resize = () => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const d = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width = Math.round(W * d);
    canvas.height = Math.round(H * d);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };

  const ready = () => !!media && media.complete && media.naturalWidth > 0;

  function drawCover(zoom: number) {
    if (!media || !ready()) return;
    const mw = media.naturalWidth;
    const mh = media.naturalHeight;
    const s = Math.max(W / mw, H / mh) * zoom;
    // portrait screens crop the sides: follow the photo's focus point, exactly like CSS object-position
    const fx = W <= H ? focus[0] : 0.5;
    const fy = W <= H ? focus[1] : 0.5;
    ctx!.drawImage(media, (W - mw * s) * fx, (H - mh * s) * fy, mw * s, mh * s);
  }

  // Mirrors the DOM .shade so the hand-off from canvas to DOM background has no seam.
  function drawShade(alpha: number) {
    if (alpha <= 0) return;
    const c = ctx!;
    c.save();
    c.globalAlpha = alpha;
    const bottom = c.createLinearGradient(0, H, 0, H * 0.48);
    bottom.addColorStop(0, `rgba(${FOREST},.92)`);
    bottom.addColorStop(1, `rgba(${FOREST},0)`);
    c.fillStyle = bottom;
    c.fillRect(0, 0, W, H);
    const left = c.createLinearGradient(0, 0, W * 0.35, 0);
    left.addColorStop(0, `rgba(${FOREST},.55)`);
    left.addColorStop(1, `rgba(${FOREST},0)`);
    c.fillStyle = left;
    c.fillRect(0, 0, W, H);
    const topH = Math.min(160, H * 0.22);
    const top = c.createLinearGradient(0, 0, 0, topH);
    top.addColorStop(0, `rgba(${FOREST},.5)`);
    top.addColorStop(1, `rgba(${FOREST},0)`);
    c.fillStyle = top;
    c.fillRect(0, 0, W, topH);
    c.restore();
  }

  function project(pts: Pt[], cx: number, cy: number, rx: number, ry: number): Pt[] {
    const ax = (rx * Math.PI) / 180;
    const ay = (ry * Math.PI) / 180;
    const cosX = Math.cos(ax);
    const cosY = Math.cos(ay);
    const sinX = Math.sin(ax);
    const sinY = Math.sin(ay);
    return pts.map(([x, y]) => {
      const z = x * sinY - y * sinX;
      const p = FOCAL / (FOCAL + z);
      return [cx + x * cosY * p, cy + y * cosX * p];
    });
  }

  function trace(c: CanvasRenderingContext2D, pts: Pt[]) {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
  }

  function draw() {
    const c = ctx!;
    c.clearRect(0, 0, W, H);
    if (mask <= 0.001 && e <= 0) return;
    const rect = slot.getBoundingClientRect();
    const box = container.getBoundingClientRect();
    const rectCx = rect.left - box.left + rect.width / 2;
    const rectCy = rect.top - box.top + rect.height / 2;
    const cx = rectCx + (W / 2 - rectCx) * e;
    const cy = rectCy + (H / 2 - rectCy) * e;
    const baseW = rect.width + (W - rect.width) * e;
    const baseH = rect.height + (H - rect.height) * e;
    const scale = e ? 1 : mask;
    const w = baseW * scale;
    const h = baseH * scale;
    const r = CORNER_RATIO * rect.width * (1 - e) * scale;
    if (!(w > 1 && h > 1)) return;

    const pts = project(roundedRectPoints(w, h, r), cx, cy, rotX * (1 - e), rotY * (1 - e));
    c.save();
    trace(c, pts);
    c.clip();
    c.fillStyle = `rgb(${FOREST})`;
    c.fillRect(0, 0, W, H);
    // Slightly zoomed at rest (depth); at e=1 it equals the DOM background's plain cover.
    drawCover(1 + 0.08 * (1 - e));
    drawShade(e);
    // the next chapter's darkening grows with the opening, so the hand-over to the page is seamless
    if (dimNext > 0 && e > 0) {
      const a = (f: number) => Math.min(1, dimNext * f * e).toFixed(3);
      if (W > 900) {
        const g = c.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, `rgba(${FOREST},${a(1.15)})`);
        g.addColorStop(0.55, `rgba(${FOREST},${a(0.95)})`);
        g.addColorStop(1, `rgba(${FOREST},${a(0.55)})`);
        c.fillStyle = g;
      } else {
        c.fillStyle = `rgba(${FOREST},${a(0.86)})`;
      }
      c.fillRect(0, 0, W, H);
    }
    c.restore();

    // The one hot moment: the rim glows like metal as the window opens.
    const heat = 4 * e * (1 - e);
    c.save();
    trace(c, pts);
    c.lineWidth = 1.5 + heat * 2;
    c.strokeStyle = e > 0 && e < 1 ? `rgba(${HEAT},${0.35 + heat * 0.65})` : e === 0 ? 'rgba(232,248,245,.35)' : 'rgba(0,0,0,0)';
    c.shadowColor = `rgba(${HEAT},${heat})`;
    c.shadowBlur = 28 * heat;
    c.stroke();
    c.restore();
  }

  resize();

  return {
    setMedia(img, f) {
      media = img;
      focus = f ?? [0.5, 0.5];
    },
    set(m, ex, dim = 0) {
      mask = m;
      e = ex;
      dimNext = dim;
    },
    pointer(clientX, clientY) {
      if (!opts.tilt) return;
      const box = container.getBoundingClientRect();
      targetY = ((clientX - box.left) / box.width - 0.5) * MAX_TILT_Y;
      targetX = ((clientY - box.top) / box.height - 0.5) * MAX_TILT_X;
    },
    pointerLeave() {
      targetX = 0;
      targetY = 0;
    },
    render(now) {
      const dt = Math.min(now - (last || now), 40);
      last = now;
      const k = Math.min(1, dt * 0.009);
      let tx = targetX;
      let ty = targetY;
      if (opts.idleSway && !opts.tilt) {
        const t = (now - t0) / 1000;
        ty = Math.sin((t / 6) * Math.PI * 2) * 1.5;
        tx = Math.cos((t / 6) * Math.PI * 2);
      }
      rotX += (tx - rotX) * k;
      rotY += (ty - rotY) * k;
      draw();
      return Math.abs(tx - rotX) > 0.01 || Math.abs(ty - rotY) > 0.01 || (opts.idleSway && !opts.tilt);
    },
    resize,
    destroy() {
      ctx.clearRect(0, 0, W, H);
    },
  };
}
