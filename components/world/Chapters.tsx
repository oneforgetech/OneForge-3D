'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Countdown } from '@/components/ui/Countdown';
import { IconArrowUpRight, IconPause, IconPlay } from '@/components/ui/icons';
import { CHURCH_ADDRESS, CHURCH_EMAIL, CHURCH_MAPS_URL, LIVE_URL, YOUTUBE_MUSIC_URL } from '@/lib/church';
import { visitCta } from '@/lib/content';
import { SPOTIFY_SHOW_EMBED_URL, SPOTIFY_SHOW_URL, latestEpisode } from '@/lib/episodes';
import { launchCopy } from '@/lib/launch';
import { useAppStore } from '@/lib/store';
import { chapterIndex } from '@/lib/world/chapters';
import type { FrameState } from '@/lib/world/controller';
import { useWorldStore } from '@/lib/world/store';
import { useWorldFrame } from './context';
import styles from './World.module.css';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const vars = (o: Record<string, string | number>) => o as React.CSSProperties;

function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.pill} data-cursor="Go">
      {children}
      <span className={styles.pillIcon}>
        <IconArrowUpRight size={16} />
      </span>
    </Link>
  );
}

/* ---------------------------------------------------------------- arrive */
/* Compact Spotify player for the hero: plays through the global player (so audio keeps going as you scroll). */
function HeroPlayer() {
  const ref = useRef<HTMLButtonElement>(null);
  const current = useAppStore((s) => s.currentEpisode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const progress = useAppStore((s) => s.progress);
  const duration = useAppStore((s) => s.duration);
  const playEpisode = useAppStore((s) => s.playEpisode);
  const setHeroPlayerInView = useAppStore((s) => s.setHeroPlayerInView);
  const active = useWorldStore((s) => s.active);
  const [seen, setSeen] = useState(false);
  const isCurrent = current?.id === latestEpisode.id;
  const showPause = isCurrent && isPlaying;
  const pct = isCurrent && duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  // The global player tucks away while this one is on screen, so there are never two.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const live = document.documentElement.hasAttribute('data-world-live');
    setHeroPlayerInView(seen && (!live || active === 0));
    return () => setHeroPlayerInView(false);
  }, [seen, active, setHeroPlayerInView]);

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.latest} ${styles.heroPlayer} glass-on-dark`}
      onClick={() => playEpisode(latestEpisode)}
      aria-label={showPause ? `Pause ${latestEpisode.title}` : `Play ${latestEpisode.title}`}
      data-cursor={showPause ? 'Pause' : 'Play'}
    >
      <span className={styles.latestThumb}>
        <Image src={latestEpisode.artworkUrl} alt="" fill sizes="52px" unoptimized />
        <span className={styles.latestPlay}>{showPause ? <IconPause size={16} /> : <IconPlay size={16} />}</span>
      </span>
      <span className={styles.latestText}>
        <span className="kicker">{isCurrent ? 'Now playing' : 'Listen to latest sermon'}</span>
        <strong>{latestEpisode.title}</strong>
        {isCurrent && (
          <span className={styles.heroProgress}>
            <span style={{ width: `${pct}%` }} />
          </span>
        )}
      </span>
    </button>
  );
}

export function Arrive() {
  const cta = visitCta();
  return (
    <>
      <h1 className="visually-hidden">ONEFORGE Church · Ogudu, Lagos</h1>
      <div className={`${styles.layer} ${styles.heroCentre}`} style={vars({ '--depth': 10 })}>
        <div className={styles.heroMain}>
          <p className={`${styles.heroMeta} ${styles.rise}`}>
            {launchCopy('9:00 AM · OGUDU, LAGOS', 'SUNDAYS · 9:00 AM · OGUDU, LAGOS')}
          </p>
          <h2 className={`${styles.heroHead} ${styles.rise} ${styles.titleRise} display-heading`}>
            {launchCopy<React.ReactNode>(
              <>
                November 1<sup>st</sup>
              </>,
              'Sundays at 9',
            )}
          </h2>
          <p className={`${styles.heroSub} ${styles.rise}`}>{launchCopy('Our first Sunday together.', 'Come as you are.')}</p>
          <div className={`${styles.heroCount} ${styles.rise}`}>
            <Countdown className={styles.countdown} unitClass={`${styles.unit} glass-on-dark`} numClass={styles.unitNum} labelClass={styles.unitLabel} />
          </div>
          <div className={`${styles.ctaRow} ${styles.rise}`}>
            <Pill href={cta.href}>{cta.label}</Pill>
            <Link href="/visit" className={styles.link}>
              Everything to know before you come →
            </Link>
          </div>
        </div>
      </div>
      <div className={`${styles.layer} ${styles.heroCorner} ${styles.rise}`} style={vars({ '--depth': 10 })}>
        <HeroPlayer />
      </div>
    </>
  );
}

/* --------------------------------------------------------------- divided */
const DIVIDED = 'YOU WERE NEVER MEANT TO LIVE DIVIDED.'.split(' ');

export function Divided() {
  return (
    <>
      <div className={styles.layer} style={vars({ '--depth': 20 })}>
        <h2 className={`${styles.shout} ${styles.shoutA} display-heading`} style={{ perspective: 900, ...vars({ '--n': DIVIDED.length }) }}>
          {DIVIDED.map((w, i) => (
            <span key={i}>
              <span className={styles.word} style={vars({ '--i': i })}>
                {w}
              </span>{' '}
            </span>
          ))}
        </h2>
      </div>
      <div className={styles.layer} style={vars({ '--depth': 34, '--delay': 0.15 })}>
        <p className={styles.keywords}>
          {['Faith.', 'Work.', 'Ambition.', 'Character...'].map((w, i) => (
            <span key={w}>
              <span style={vars({ '--i': i })}>{w}</span>{' '}
            </span>
          ))}
        </p>
        <p className={styles.compete}>They were never meant to compete.</p>
        <p className={styles.resolve}>Grow in Christ. Lead in every room that matters.</p>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- feeling */
const FEELING = 'YOU KNOW THE FEELING.'.split(' ');

export function Feeling() {
  return (
    <>
      <div className={styles.layer} style={vars({ '--depth': 20 })}>
        <h2 className={`${styles.shout} ${styles.shoutB} display-heading`} style={{ perspective: 900, ...vars({ '--n': FEELING.length }) }}>
          {FEELING.map((w, i) => (
            <span key={i}>
              <span className={styles.word} style={vars({ '--i': i })}>
                {w}
              </span>{' '}
            </span>
          ))}
        </h2>
      </div>
      <div className={styles.layer} style={vars({ '--depth': 34, '--delay': 0.15 })}>
        <div className={styles.versions}>
          <p className={styles.verA}>Different versions of yourself here.</p>
          <p className={styles.verB}>Different versions there.</p>
        </div>
        <p className={styles.question}>What if you didn&apos;t have to be?</p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- fronts */
const FRONTS_IDX = chapterIndex('fronts');
const PILLARS = [
  { name: 'CHARACTER', line: 'Who you are when no one is watching.', tone: 'var(--of-teal)' },
  { name: 'COMPETENCE', line: 'What you can do, and how well you can do it.', tone: 'var(--of-orange)' },
  { name: 'CAPACITY', line: 'What you can carry as your responsibility, influence and calling grow.', tone: 'var(--of-yellow)' },
];

export function Fronts() {
  const cta = visitCta();
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  // Two beats share one screen: the pillars hand over to the closing words and the button.
  const frame = useCallback((st: FrameState) => {
    const t = st.t[FRONTS_IDX];
    const a = 1 - clamp((t - 0.55) / 0.1);
    const b = clamp((t - 0.6) / 0.12);
    const A = aRef.current;
    const B = bRef.current;
    if (A) {
      A.style.opacity = a.toFixed(3);
      A.style.transform = `translate3d(0,${((1 - a) * -40).toFixed(1)}px,${((1 - a) * -260).toFixed(1)}px)`;
      A.style.filter = a < 1 ? `blur(${((1 - a) * 8).toFixed(1)}px)` : 'none';
      A.style.visibility = a > 0.01 ? 'visible' : 'hidden';
    }
    if (B) {
      B.style.opacity = b.toFixed(3);
      B.style.transform = `translate3d(0,${((1 - b) * 50).toFixed(1)}px,${((1 - b) * -260).toFixed(1)}px)`;
      B.style.filter = b < 1 ? `blur(${((1 - b) * 8).toFixed(1)}px)` : 'none';
      B.style.visibility = b > 0.01 ? 'visible' : 'hidden';
    }
  }, []);
  useWorldFrame(frame);

  return (
    <div className={styles.beats}>
      <div className={styles.layer} style={vars({ '--depth': 22 })}>
        <div ref={aRef} className={styles.beat}>
          <h2 className={`${styles.shout} ${styles.shoutC} display-heading`}>WHOLE ON THREE FRONTS.</h2>
          <div className={styles.pillars}>
            {PILLARS.map((p) => (
              <div key={p.name} className={`${styles.pillar} glass-on-dark`} style={{ borderTopColor: p.tone }}>
                <h3 className={styles.pillarName}>{p.name}</h3>
                <p>{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.layer} style={vars({ '--depth': 30 })}>
        <div ref={bRef} className={`${styles.beat} ${styles.beatB}`}>
          <p className={styles.carry}>
            Being capable isn&apos;t enough. Being sincere isn&apos;t enough. You are becoming someone who can carry both.
          </p>
          <p className={styles.fire}>Come as you are. Let the fire form you.</p>
          <Link href={cta.href} className={styles.startCta} data-cursor="Start">
            Start Here →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- listen */
export function Listen() {
  const mounted = useWorldStore((s) => s.maxActive >= chapterIndex('listen') - 1);
  const current = useAppStore((s) => s.currentEpisode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const playEpisode = useAppStore((s) => s.playEpisode);
  const isCurrent = current?.id === latestEpisode.id;
  const showPause = isCurrent && isPlaying;

  return (
    <div className={styles.split}>
      <div className={styles.layer} style={vars({ '--depth': 22 })}>
        <h2 className={`${styles.h2} display-heading`}>Every message, free.</h2>
        <p className={styles.lead} style={{ marginTop: 18 }}>
          Something to have on while you do the dishes or drive to work.
        </p>
        <button
          type="button"
          className={`${styles.latest} glass-on-dark`}
          onClick={() => playEpisode(latestEpisode)}
          aria-label={showPause ? `Pause ${latestEpisode.title}` : `Play ${latestEpisode.title}`}
          data-cursor={showPause ? 'Pause' : 'Play'}
        >
          <span className={styles.latestThumb}>
            <Image src={latestEpisode.artworkUrl} alt="" fill sizes="52px" unoptimized />
            <span className={styles.latestPlay}>{showPause ? <IconPause size={16} /> : <IconPlay size={16} />}</span>
          </span>
          <span className={styles.latestText}>
            <span className="kicker">{isCurrent ? 'Now playing' : 'Latest on Spotify'}</span>
            <strong>{latestEpisode.title}</strong>
          </span>
        </button>
        <div className={styles.listenLinks}>
          <a className={styles.link} href={SPOTIFY_SHOW_URL} target="_blank" rel="noreferrer">
            Open in Spotify ↗
          </a>
          <a className={styles.ghost} href={YOUTUBE_MUSIC_URL} target="_blank" rel="noreferrer" data-cursor="Open">
            Open on YouTube Music ↗
          </a>
        </div>
        <div className={styles.liveRow}>
          <a className={styles.ghost} href={LIVE_URL} target="_blank" rel="noreferrer" data-cursor="Live">
            Join Us Live ↗
          </a>
        </div>
      </div>

      <div className={styles.layer} style={vars({ '--delay': 0.25, '--depth': 46 })}>
        <div className={`${styles.embed} glass-on-dark`}>
          {mounted && (
            <iframe
              title="ONEFORGE on Spotify"
              src={SPOTIFY_SHOW_EMBED_URL}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              suppressHydrationWarning
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- begin */
export function Begin() {
  const cta = visitCta();
  return (
    <>
      <div className={`${styles.layer} ${styles.beginHead}`} style={vars({ '--depth': 20 })}>
        <h2 className={`${styles.h2} display-heading`}>Tell us you&apos;re coming.</h2>
        <p className={styles.lead} style={{ margin: '18px 0 26px' }}>
          You don&apos;t have to. It just means someone will look out for you.
        </p>
        <Pill href={cta.href}>{cta.label}</Pill>
      </div>
      <div className={styles.layer} style={vars({ '--delay': 0.5, '--depth': 14 })}>
        <div className={styles.contact}>
          <a href={`mailto:${CHURCH_EMAIL}`}>{CHURCH_EMAIL}</a>
          <a href={CHURCH_MAPS_URL} target="_blank" rel="noreferrer">
            {CHURCH_ADDRESS}
          </a>
        </div>
      </div>
    </>
  );
}

export const CHAPTER_VIEWS: Record<string, () => React.ReactElement> = {
  arrive: Arrive,
  divided: Divided,
  feeling: Feeling,
  fronts: Fronts,
  listen: Listen,
  begin: Begin,
};


