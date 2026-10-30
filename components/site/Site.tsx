'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Backdrop } from '@/components/chrome/Backdrop';
import { IconArrowUpRight } from '@/components/ui/icons';
import { createPager, createTouchAssist } from '@/lib/pager';
import styles from './Page.module.css';

/** Inner-page frame: ember backdrop + pointer tilt for [data-tilt] slabs. */
export function PageShell({ children }: { children: React.ReactNode }) {
  // One flick = one section. Mouse/keyboard: our pager steps section to section (and screen by
  // screen inside tall sections). Touch: native CSS scroll-snap (see globals.css), which
  // handles swipes and momentum properly. Reduced motion keeps ordinary scrolling.
  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.matchMedia('(pointer: coarse)').matches) {
      html.classList.add('snap-page');
      const stopAssist = reduced ? undefined : createTouchAssist();
      return () => {
        stopAssist?.();
        html.classList.remove('snap-page');
      };
    }
    if (reduced) return;
    return createPager();
  }, []);

  // Depth: each section's content flies in from behind as it enters and recedes as it leaves.
  // Only the edges animate, so tall sections stay fully readable while you're inside them.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-snap]')).map((sec) => ({
      sec,
      inner: sec.querySelector<HTMLElement>(`.${styles.depth}`),
    }));
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const band = vh * 0.4;
      for (const { sec, inner } of els) {
        if (!inner) continue;
        const r = sec.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        const entering = Math.min(1, Math.max(0, (vh - r.top) / band));
        const leaving = Math.min(1, Math.max(0, r.bottom / band));
        const a = 1 - Math.min(entering, leaving); // 0 = settled, 1 = fully behind
        const dir = entering < leaving ? 1 : -1; // enters from below, leaves upward
        inner.style.setProperty('--da', a.toFixed(3));
        inner.style.setProperty('--dd', String(dir));
      }
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
  }, []);

  return (
    <>
      <Backdrop />
      <main className={styles.page} data-trail-host="2">
        {children}
      </main>
    </>
  );
}

export function PageHero({
  title,
  lead,
  image,
  alt,
  kicker,
  centred,
  titleClassName,
  children,
}: {
  title: string;
  /** One paragraph, or several. */
  lead?: string | string[];
  image: string;
  alt: string;
  kicker?: string;
  /** Line the photo up with the middle of the text instead of its bottom (for heroes with a lot of text). */
  centred?: boolean;
  /** Extra class for the title, e.g. to cap its size so a forced line break (\n + pre-line) holds at every width. */
  titleClassName?: string;
  /** Extra hero content under the lead (buttons, a footnote). */
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  // Scroll parallax: the photo window flies toward you, the title recedes.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      // A hero taller than the screen (long copy, or a phone) is still being read until its bottom is in view,
      // so the fade only starts from there. A hero that fits on one screen starts fading straight away.
      const rest = Math.max(0, el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight);
      const progress = (window.scrollY - rest) / (window.innerHeight * 0.9);
      el.style.setProperty('--hp', Math.min(1, Math.max(0, progress)).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section ref={ref} className={`${styles.hero} ${centred ? styles.heroCentred : ''}`} data-snap>
      <div className={styles.heroText}>
        {kicker && <p className={`kicker ${styles.kick} ${styles.heroKicker}`}>{kicker}</p>}
        <h1 className={`${styles.heroTitle} ${titleClassName ?? ''} display-heading`}>{title}</h1>
        {lead &&
          [lead].flat().map((paragraph) => (
            <p key={paragraph} className={styles.heroLead}>
              {paragraph}
            </p>
          ))}
        {children && <div className={styles.heroExtra}>{children}</div>}
      </div>
      <div className={styles.heroWin}>
        <Image src={image} alt={alt} fill priority sizes="(min-width: 860px) 420px, 70vw" />
      </div>
    </section>
  );
}

/** Scroll reveal: visible by default; below-the-fold blocks are armed after hydration, then fly in from depth. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add(styles.armed);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.setProperty('--rd', `${delay}ms`);
          el.classList.add(styles.revealed);
          el.classList.remove(styles.armed);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    const safety = window.setTimeout(() => {
      el.classList.add(styles.revealed);
      el.classList.remove(styles.armed);
    }, 9000);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function Section({ children, band, id }: { children: React.ReactNode; band?: boolean; id?: string }) {
  return (
    <section id={id} data-snap className={`${styles.section} ${band ? styles.band : ''}`}>
      <div className={`${styles.inner} ${styles.depth}`}>{children}</div>
    </section>
  );
}

export function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.pill} data-cursor="Go">
      {children}
      <span className={styles.pillIcon}>
        <IconArrowUpRight size={16} />
      </span>
    </Link>
  );
}

