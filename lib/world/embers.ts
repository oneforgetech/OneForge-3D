// Depth-projected ember field. Particles live in a 3D box; scrolling flies the
// camera through it (streaks), the portal's hot moment feeds more orange.

type Ember = { x: number; y: number; z: number; s: number; hue: number; ph: number; px: number; py: number };

const ZFAR = 2200;
const FOCAL = 760;
// teal, orange, yellow, mint — brand palette
const COLORS = ['6,237,195', '255,140,0', '255,215,0', '232,248,245'];

export type Embers = {
  /** flow: scroll velocity in px/frame (+down). heat: 0..1 portal heat. */
  render: (dt: number, flow: number, heat: number) => void;
  resize: () => void;
};

export function createEmbers(canvas: HTMLCanvasElement, count: number): Embers {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d canvas unavailable');
  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;

  const make = (far = false): Ember => ({
    x: (Math.random() * 2 - 1) * W * 1.1,
    y: (Math.random() * 2 - 1) * H * 1.1,
    z: far ? ZFAR * (0.6 + Math.random() * 0.4) : 40 + Math.random() * ZFAR,
    s: 0.6 + Math.random() * 1.6,
    hue: Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : Math.random() < 0.6 ? 2 : 3,
    ph: Math.random() * 6.28,
    px: 0,
    py: 0,
  });
  let list: Ember[] = [];

  const resize = () => {
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * d);
    canvas.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    cx = W / 2;
    cy = H / 2;
    list = Array.from({ length: count }, () => make());
  };
  resize();

  return {
    resize,
    render(dt, flow, heat) {
      const c = ctx;
      c.clearRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      const f = dt / 16.67;
      const streak = Math.min(1, Math.abs(flow) / 40);
      for (const p of list) {
        // slower and calmer than before: a drift, not a stream
        p.ph += 0.009 * f;
        p.y -= (0.2 + p.s * 0.14 + heat * 0.8) * f * (ZFAR / (p.z + 400)) * 1.2;
        p.x += Math.sin(p.ph) * 0.18 * f;
        p.z -= (0.38 + flow * 0.9) * f * 1.4;
        const sx = cx + (p.x * FOCAL) / p.z;
        const sy = cy + (p.y * FOCAL) / p.z;
        if (p.z < 30 || p.z > ZFAR * 1.15 || sy < -60 || sx < -120 || sx > W + 120) {
          const n = make();
          n.z = p.z < 30 ? ZFAR * (0.7 + Math.random() * 0.3) : p.z > ZFAR * 1.1 ? 60 + Math.random() * 400 : ZFAR * (0.5 + Math.random() * 0.5);
          n.y = H * (0.4 + Math.random() * 0.7);
          Object.assign(p, n);
          continue;
        }
        const depth = 1 - p.z / ZFAR;
        const size = (0.5 + depth * 3.2) * p.s;
        const hue = heat > 0.15 && p.hue !== 1 && Math.random() < heat * 0.02 ? 1 : p.hue;
        const a = Math.max(0, Math.min(1, (0.15 + depth * 0.85) * (0.6 + 0.4 * Math.sin(p.ph * 2.3))));
        c.strokeStyle = `rgba(${COLORS[hue]},${a})`;
        c.fillStyle = `rgba(${COLORS[hue]},${a})`;
        if (streak > 0.12 && p.px) {
          c.lineWidth = Math.max(0.6, size * 0.9);
          c.beginPath();
          c.moveTo(p.px, p.py);
          c.lineTo(sx, sy);
          c.stroke();
        } else {
          c.beginPath();
          c.arc(sx, sy, size, 0, 6.283);
          c.fill();
        }
        p.px = sx;
        p.py = sy;
      }
      c.globalCompositeOperation = 'source-over';
    },
  };
}
