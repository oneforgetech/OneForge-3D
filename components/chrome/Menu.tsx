'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/church';
import { NAV_GROUPS, NAV_MORE, type NavItem } from '@/lib/nav';
import { IconClose } from '@/components/ui/icons';
import styles from './Menu.module.css';

const FOCUSABLE = 'a[href], button:not([disabled])';

export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('modal-open');
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    // Everything else on the page is inert while the menu covers it.
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== overlayRef.current && el.tagName !== 'SCRIPT',
    );
    siblings.forEach((el) => {
      el.inert = true;
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab') return;
      const f = Array.from(overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
      siblings.forEach((el) => {
        el.inert = false;
      });
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const tab = open ? 0 : -1;
  let n = 0;

  const renderLink = (l: NavItem, cls: string) => {
    const i = n++;
    const style = { '--i': i } as React.CSSProperties;
    return l.external ? (
      <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={cls} style={style} tabIndex={tab} data-cursor="Go" onClick={onClose}>
        {l.label} ↗
      </a>
    ) : (
      <Link key={l.label} href={l.href} className={cls} style={style} tabIndex={tab} data-cursor="Go" onClick={onClose}>
        {l.label}
      </Link>
    );
  };

  return (
    <div ref={overlayRef} className={`${styles.overlay} ${open ? styles.open : ''}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-label="Site menu">
      <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close menu" tabIndex={tab} data-cursor="Close">
        <IconClose />
      </button>

      <div className={styles.panel}>
        <div className={styles.columns}>
          {NAV_GROUPS.map((g) => (
            <div key={g.id}>
              <span className={`${styles.colLabel} kicker`}>{g.label}</span>
              <div className={styles.links}>{g.items.map((l) => renderLink(l, styles.link))}</div>
            </div>
          ))}
        </div>

        <div className={styles.foot}>
          <div className={styles.more}>{NAV_MORE.map((l) => renderLink(l, styles.moreLink))}</div>
          <div className={styles.social}>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" tabIndex={tab}>
                {s.label}
              </a>
            ))}
            <a href="mailto:hello@oneforge.org" tabIndex={tab}>
              hello@oneforge.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
