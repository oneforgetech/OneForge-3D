'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { LIVE_URL } from '@/lib/church';

/** One listener for the whole site: taps on call, email, WhatsApp and "Join us live" links, wherever they are. */
export function ContactClicks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const href = (e.target as Element | null)?.closest?.('a[href]')?.getAttribute('href') ?? '';
      // /live redirects straight to YouTube, so GA never sees it as a page or an outbound link: count it here.
      if (href === LIVE_URL) track('live_click');
      else if (href.startsWith('tel:')) track('contact_click', { method: 'phone' });
      else if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(href)) track('contact_click', { method: 'whatsapp' });
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
