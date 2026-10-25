/** Optimized URL for canvas sampling (1920w is in Next's default deviceSizes). */
export function canvasImageUrl(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;
}

// Resolves with the element even on failure (the canvas skips unloaded media),
// so one bad image can never stall the world.
const cache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = cache.get(url);
  if (!p) {
    p = new Promise((resolve) => {
      const img = new window.Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = url;
    });
    cache.set(url, p);
  }
  return p;
}
