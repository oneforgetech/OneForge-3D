'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IconMapPin } from '@/components/ui/icons';
import { CHURCH_MAPS_URL } from '@/lib/church';
import { useProgress } from '@/lib/useProgress';
import { Reveal } from './Site';
import a from './About.module.css';

function Photo({ src, scrim }: { src: string; scrim?: React.CSSProperties }) {
  return (
    <>
      <div className={a.bg}>
        <Image src={src} alt="" fill sizes="100vw" />
      </div>
      <div className={a.scrim} style={scrim} />
    </>
  );
}

/* ------------------------------------------------------------------ hero */
const HERO = 'WHO YOU ARE MATTERS.'.split(' ');

export function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  useProgress(ref, 'cross');
  return (
    <section ref={ref} className={`${a.bleed} ${a.hero}`} data-snap>
      <Photo src="/images/backdrops/stillness.jpg" scrim={{ '--scrim-l': 0.82, '--scrim-m': 0.5, '--scrim-r': 0.18 } as React.CSSProperties} />
      <div className={a.heroInner}>
        <h1 className={`${a.heroTitle} display-heading`}>
          {HERO.map((w, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </h1>
        <p className={a.heroLead}>You are more than the room you&apos;re currently in.</p>
      </div>
      <div className={a.cue} aria-hidden="true">
        <span>Scroll</span>
        <span className={a.cueLine} />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- rooms */
const ROOMS = ['The office.', 'The classroom.', 'The boardroom.', 'The relationships', 'The group chat.', 'The places nobody sees.'];

export function Rooms() {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(0);
  const [inView, setInView] = useState(false);

  useProgress(ref, 'cross');

  // the highlight walks through the rooms on its own, only while the section is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setLit((i) => (i + 1) % ROOMS.length), 1700);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <section ref={ref} id="who" className={`${a.bleed} ${a.rooms}`} data-snap>
      <Photo src="/images/backdrops/walking.jpg" scrim={{ '--scrim-l': 0.9, '--scrim-m': 0.68, '--scrim-r': 0.38 } as React.CSSProperties} />
      <div className={a.roomsGrid}>
        <ul className={a.roomList}>
          {ROOMS.map((r, i) => (
            <li key={r} className={`${a.room} ${i === lit ? a.lit : ''}`}>
              {r}
            </li>
          ))}
        </ul>
        <Reveal className={a.mattersCol}>
          <p className={a.matters}>Your whole life matters to God.</p>
          <p className={a.mattersLead}>
            ONEFORGE exists to help you grow in Christ — not just for Sunday, but for every room you enter after it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ vision + mission */
export function VisionMission() {
  const ref = useRef<HTMLElement>(null);
  useProgress(ref, 'cross');
  return (
    <section ref={ref} className={`${a.bleed} ${a.vm}`} data-snap>
      <Photo src="/images/backdrops/movement.jpg" scrim={{ '--scrim-l': 0.7, '--scrim-m': 0.55, '--scrim-r': 0.5 } as React.CSSProperties} />
      <div className={a.vmGrid}>
        <Reveal className={a.vmItem}>
          <span className={a.vmLabel}>OUR VISION</span>
          <p className={a.vmText}>To grow in Christ and lead in every room that matters.</p>
        </Reveal>
        <Reveal className={a.vmItem} delay={140}>
          <span className={a.vmLabel}>OUR MISSION</span>
          <p className={a.vmText}>To gather, form, and deploy believers who carry God&apos;s presence into every sphere of life.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- journey */
const JOURNEY = [
  { name: 'GATHER', text: 'You find a place to belong, build relationships and take your next step.', tone: 'var(--of-teal)' },
  { name: 'FORM', text: 'You grow in Christ, develop your character, build your competence and expand your capacity.', tone: 'var(--of-yellow)' },
  { name: 'DEPLOY', text: 'You carry what has been formed in you into your home, work, community and every room that matters.', tone: 'var(--of-orange)' },
];

export function Journey() {
  return (
    <section className={a.journey} data-snap>
      <div className={a.journeyInner}>
        <Reveal>
          <h2 className={`${a.journeyTitle} display-heading`}>THE JOURNEY</h2>
        </Reveal>
        <div className={a.path}>
          {JOURNEY.map((j, i) => (
            <div key={j.name} className={a.step} style={{ '--node': j.tone } as React.CSSProperties}>
              <span className={a.node} aria-hidden="true" />
              <Reveal delay={i * 140}>
                <div className={`${a.stepCard} glass-on-dark`}>
                  <h3 className={a.stepName}>{j.name}</h3>
                  <p className={a.stepText}>{j.text}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- closing */
const COME = ['Come curious.', 'Come with your story', 'Come questioning.', 'Come believing.', 'Come searching.'];

export function Closing() {
  const ref = useRef<HTMLElement>(null);
  useProgress(ref, 'cross');
  return (
    <section ref={ref} className={`${a.bleed} ${a.close}`} data-snap>
      <Photo src="/images/backdrops/stillness.jpg" scrim={{ '--scrim-l': 0.88, '--scrim-m': 0.66, '--scrim-r': 0.4 } as React.CSSProperties} />
      <div className={a.closeInner}>
        <div className={a.closeTop}>
          <Reveal>
            <span className={a.closeLabel}>A PLACE TO BECOME</span>
            <h2 className={`${a.closeTitle} display-heading`}>YOU CAN COME UNFINISHED.</h2>
            <p className={a.closeLead}>You don&apos;t have to have everything figured out to find your place here.</p>
          </Reveal>
          <ul className={a.comeList}>
            {COME.map((c, i) => (
              <li key={c}>
                <Reveal delay={i * 90}>{c}</Reveal>
              </li>
            ))}
          </ul>
        </div>
        <Reveal delay={200} className={a.closeBottom}>
          <p className={a.justCome}>Just come.</p>
          <div className={a.closeAction}>
            <p className={a.tag}>Forged to lead. Called to impact</p>
            <div className={a.closeButtons}>
              <a className={a.directions} href={CHURCH_MAPS_URL} target="_blank" rel="noopener noreferrer" data-cursor="Map">
                <IconMapPin size={18} />
                Get Directions
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
