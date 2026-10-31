'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '@/components/ui/icons';
import { useMounted } from '@/lib/useMounted';
import styles from './Modal.module.css';

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

/**
 * Generic modal shell: portal to document.body, focus trap (inert behind it, Escape to
 * close, Tab wraps inside, focus returns to whatever opened it). Same pattern as
 * InvitationVideo's one-off video dialog, generalised so other dialogs (forms, info cards)
 * don't each reimplement it.
 */
export function Modal({
  open,
  onClose,
  label,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (not necessarily rendered — most callers also show a visible heading). */
  label: string;
  /** Wider dialog, for content like a card grid instead of a single form. */
  wide?: boolean;
  children: React.ReactNode;
}) {
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
      (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('data-modal-root') && el.tagName !== 'SCRIPT',
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
    <div className={styles.backdrop} data-modal-root onClick={onClose}>
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <IconClose size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
