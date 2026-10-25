import Image from 'next/image';
import Link from 'next/link';
import { CHURCH_ADDRESS, CHURCH_EMAIL, CHURCH_FORMAL_NAME, CHURCH_MAPS_URL, CHURCH_SUNDAY_TIME, LIVE_URL, SOCIAL_LINKS } from '@/lib/church';
import { SPOTIFY_SHOW_URL } from '@/lib/episodes';
import { launchCopy } from '@/lib/launch';
import { NAV_GROUPS, NAV_MORE } from '@/lib/nav';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer} data-snap>
      <div className={styles.inner}>
        {/* the three ways to show up, said plainly */}
        <div className={styles.when}>
          <div className={styles.slot}>
            <span className={`${styles.label} kicker`}>Sundays</span>
            <strong className={styles.big}>{CHURCH_SUNDAY_TIME}</strong>
            <span className={styles.sub}>{launchCopy('From 1 November', 'In person')}</span>
          </div>
          <div className={styles.slot}>
            <span className={`${styles.label} kicker`}>Online</span>
            <strong className={styles.place}>Join us live</strong>
            <span className={styles.sub}>Watch our services as they happen.</span>
            <a className={styles.subLink} href={LIVE_URL} target="_blank" rel="noreferrer">
              Join Us Live ↗
            </a>
          </div>
          <div className={styles.slot}>
            <span className={`${styles.label} kicker`}>Where</span>
            <strong className={styles.place}>Ogudu, Lagos</strong>
            <span className={styles.sub}>{CHURCH_ADDRESS}</span>
            <a className={styles.subLink} href={CHURCH_MAPS_URL} target="_blank" rel="noreferrer">
              Get directions ↗
            </a>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.brand}>
            <Image src="/brand/oneforge-logo.png" alt="ONEFORGE" width={150} height={120} className={styles.logo} />
            <p className={styles.tagline}>{CHURCH_FORMAL_NAME}. Forged to lead. Called to impact.</p>
            <a className={styles.mail} href={`mailto:${CHURCH_EMAIL}`}>
              {CHURCH_EMAIL}
            </a>
          </div>

          <nav className={styles.cols} aria-label="Footer">
            {NAV_GROUPS.map((g) => (
              <div key={g.id} className={styles.col}>
                <span className={`${styles.title} kicker`}>{g.label}</span>
                {g.items.map((l) =>
                  l.external ? (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link key={l.label} href={l.href}>
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.bar}>
        <span>© {new Date().getFullYear()} {CHURCH_FORMAL_NAME}</span>
        <span className={styles.barLinks}>
          {NAV_MORE.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </span>
        <span className={styles.barLinks}>
          <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noreferrer">
            Spotify
          </a>
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
