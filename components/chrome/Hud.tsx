'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMounted } from '@/lib/useMounted';
import { NAV_GROUPS, NAV_MORE, type NavGroup } from '@/lib/nav';
import { useWorldStore } from '@/lib/world/store';
import { IconArrowUpRight } from '@/components/ui/icons';
import { Menu } from './Menu';
import styles from './Hud.module.css';

function Group({ group, cta }: { group: NavGroup; cta?: boolean }) {
  return (
    <div className={styles.group}>
      <Link href={group.href} className={cta ? styles.visit : styles.navLink}>
        {group.label}
        {cta && (
          <span className={styles.visitIcon}>
            <IconArrowUpRight size={15} />
          </span>
        )}
      </Link>
      <div className={`${styles.panel} glass-on-dark`}>
        {group.items.map((item) =>
          item.external ? (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label} ↗
            </a>
          ) : (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

/** Discover | Watch | ONEFORGE | Give | Visit | Next Steps — fixed across every page. */
export function Hud() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // The server can't always know the path when it prerenders the shared layout, so the home-only
  // bits appear after hydration instead of risking a server/client mismatch.
  const home = useMounted() && pathname === '/';
  const goTo = useWorldStore((s) => s.goTo);
  const [discover, watch, visit] = NAV_GROUPS;
  const give = NAV_MORE.find((item) => item.label === 'Give')!;

  return (
    <>
      <header className={styles.hud} data-hud>
        <div className={styles.left}>
          <button type="button" className={`${styles.menuBtn} glass-on-dark`} onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} data-cursor="Menu">
            <span className={styles.burger} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className={styles.menuLabel}>Menu</span>
          </button>
          <nav aria-label="Discover and watch" className={styles.side}>
            <Group group={discover} />
            <Group group={watch} />
          </nav>
        </div>

        <Link
          href="/"
          className={styles.logo}
          data-nav-logo
          aria-label="ONEFORGE — home"
          onClick={() => {
            if (home) goTo(0);
          }}
        >
          <Image src="/brand/oneforge-logo.png" alt="ONEFORGE" width={170} height={136} className={styles.logoImg} priority />
        </Link>

        <div className={styles.right}>
          <Link href={give.href} className={`${styles.visit} ${styles.extraCta}`} data-cursor="Go">
            Give
            <span className={styles.visitIcon}>
              <IconArrowUpRight size={15} />
            </span>
          </Link>
          <Group group={visit} cta />
          <Link href="/welcome" className={`${styles.visit} ${styles.extraCta}`} data-cursor="Go">
            Next Steps
            <span className={styles.visitIcon}>
              <IconArrowUpRight size={15} />
            </span>
          </Link>
        </div>

        {home && <span className={styles.progress} aria-hidden="true" />}
      </header>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
