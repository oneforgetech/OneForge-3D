'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '@/components/ui/icons';
import { SERVE_AREAS } from '@/lib/serve';
import { useMounted } from '@/lib/useMounted';
import styles from './ServeAreasModal.module.css';

const FOCUSABLE = 'button:not([disabled]), a[href]';

/** "Learn more" on the /welcome Serve section: what each area involves, to read before signing up. */
export function ServeAreasModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('modal-open');
    closeRef.current?.focus();
    // everything behind the dialog is inert (it stays visible, just not reachable)
    const behind = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('data-serve-areas-root') && el.tagName !== 'SCRIPT',
    );
    behind.forEach((el) => {
      el.inert = true;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      behind.forEach((el) => {
        el.inert = false;
      });
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.backdrop} data-serve-areas-root onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Ways to serve"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <IconClose size={18} />
        </button>
        <h2 className={`${styles.heading} display-heading`}>Ways to serve</h2>
        <p className={styles.intro}>Here&apos;s a closer look at each one, so you know what you&apos;re saying yes to.</p>
        <div className={styles.grid}>
          {SERVE_AREAS.map((a, i) => (
            <div key={a.value} className={styles.card}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.cardTitle}>{a.label}</h3>
              <p className={styles.cardText}>{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
