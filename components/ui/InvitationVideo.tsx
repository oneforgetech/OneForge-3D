'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconClose, IconPlay } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { INVITATION_VIDEO_URL } from '@/lib/church';
import { youtubeId } from '@/lib/youtube';
import { useMounted } from '@/lib/useMounted';
import styles from './InvitationVideo.module.css';

const FOCUSABLE = 'button:not([disabled]), a[href], iframe';
const YT_ORIGIN = 'https://www.youtube-nocookie.com';

/** "Here's Your Invitation": a prominent play button that opens the film in a modal over the page. */
export function InvitationVideo({ className }: { className?: string }) {
  const id = youtubeId(INVITATION_VIDEO_URL);
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('modal-open');
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    // everything behind the dialog is inert (it stays visible, just not reachable)
    const behind = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('data-invitation-root') && el.tagName !== 'SCRIPT',
    );
    behind.forEach((el) => {
      el.inert = true;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
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
      trigger?.focus();
    };
  }, [open]);

  if (!id) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.button} ${className ?? ''}`}
        onClick={() => {
          setOpen(true);
          track('invitation_video_open');
        }}
        data-cursor="Play"
      >
        <span className={styles.play}>
          <IconPlay size={22} />
        </span>
        <span className={styles.label}>Here&apos;s Your Invitation</span>
      </button>
      {mounted &&
        open &&
        createPortal(
          <div className={styles.backdrop} data-invitation-root onClick={() => setOpen(false)}>
            <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-label="Here's Your Invitation" onClick={(e) => e.stopPropagation()}>
              <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close the video">
                <IconClose size={20} />
              </button>
              <div className={styles.frame}>
                <iframe
                  className={styles.iframe}
                  src={`${YT_ORIGIN}/embed/${id}?autoplay=1&rel=0&playsinline=1`}
                  title="Here's Your Invitation"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
