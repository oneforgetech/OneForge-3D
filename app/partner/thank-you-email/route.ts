import { partnerThanksEmail } from '@/lib/partner-email';
import { PARTNER_GIFT_OPTIONS } from '@/lib/partner';

/**
 * Local preview of the partner thank-you email: /partner/thank-you-email?name=Ada%20Okafor&gift=JUNIOR
 * Add &text to see the plain-text version. Only available while developing; the live site answers 404.
 */
export function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const name = url.searchParams.get('name') ?? 'Ada Okafor';
  const requested = url.searchParams.get('gift') ?? 'JUNIOR';
  const gift = PARTNER_GIFT_OPTIONS.some((o) => o.value === requested) ? requested : 'JUNIOR';
  const email = partnerThanksEmail({ name, gift, assetBase: url.origin });

  if (url.searchParams.has('text')) {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return new Response(email.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
