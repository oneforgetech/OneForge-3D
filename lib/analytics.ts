/**
 * Google Analytics 4. Nothing loads unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set (in Vercel, set it for
 * Production only, so previews and local work don't count as visits).
 *
 * Page views, including moving between pages, outbound links, scrolls and file downloads, are counted by
 * GA's own "Enhanced measurement". track() adds the site's key actions on top.
 * Never send anything that identifies a person: no names, emails, phone numbers or message text.
 */

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/i.test(RAW_ID) ? RAW_ID : '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** The events the site sends. Names are what appear in GA's Events report. */
type Events = {
  connect_form_sent: { topic: string };
  partner_form_sent: { gift: string };
  welcome_form_sent: Record<string, never>;
  copy_account_number: { bank: string; currency: string };
  invitation_video_open: Record<string, never>;
  listen_play: { episode: string };
  contact_click: { method: 'phone' | 'email' | 'whatsapp' };
  live_click: Record<string, never>;
};

export function track<E extends keyof Events>(event: E, ...[params]: Events[E] extends Record<string, never> ? [] : [Events[E]]) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads its queue as `arguments` objects, so this stand-in (used until the script loads) must push those.
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag('event', event, params ?? {});
}
