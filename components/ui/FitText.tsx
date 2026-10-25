'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Sizes a single line of display type to fill its column (up to a cap).
 * Sets `--fit` on the element; the stylesheet decides what to do with it.
 */
export function FitText({
  as: Tag = 'h1',
  className,
  innerClassName,
  text,
  capVw = 21.8,
  capPx = 314,
  narrowCapVw = 34,
  narrowCapPx = 160,
  minPx = 40,
}: {
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  innerClassName?: string;
  text: string;
  capVw?: number;
  capPx?: number;
  narrowCapVw?: number;
  narrowCapPx?: number;
  minPx?: number;
}) {
  const hRef = useRef<HTMLHeadingElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const fit = useCallback(() => {
    const h = hRef.current;
    const span = spanRef.current;
    const col = h?.parentElement;
    if (!h || !span || !col) return;
    h.style.setProperty('--fit', '100px');
    const em = span.offsetWidth / 100;
    if (!em) return;
    const narrow = window.innerWidth <= 700;
    const cap = narrow ? Math.min(narrowCapPx, (window.innerWidth * narrowCapVw) / 100) : Math.min((window.innerWidth * capVw) / 100, capPx);
    const hCap = window.innerHeight < 560 ? window.innerHeight * 0.24 : Infinity;
    const size = Math.max(minPx, Math.min(cap, hCap, (col.clientWidth - 2) / em));
    h.style.setProperty('--fit', `${size.toFixed(1)}px`);
  }, [capVw, capPx, narrowCapVw, narrowCapPx, minPx]);

  useIsoLayoutEffect(() => {
    fit();
  }, [fit, text]);

  useEffect(() => {
    const col = hRef.current?.parentElement;
    if (!col) return;
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && fit());
    const ro = new ResizeObserver(() => fit());
    ro.observe(col);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [fit]);

  return (
    <Tag ref={hRef} className={className}>
      <span ref={spanRef} className={innerClassName}>
        {text}
      </span>
    </Tag>
  );
}
