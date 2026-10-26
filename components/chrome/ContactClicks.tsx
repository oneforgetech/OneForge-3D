'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** One listener for the whole site: taps on call, email and WhatsApp links, wherever they are. */
export function ContactClicks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const href = (e.target as Element | null)?.closest?.('a[href]')?.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) track('contact_click', { method: 'phone' });
      else if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(href)) track('contact_click', { method: 'whatsapp' });
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
