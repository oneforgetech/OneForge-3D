import { welcomeConnectReplyEmail } from '@/lib/welcome-email';

/**
 * Local preview of the "Connect with us" auto-reply: /welcome/thank-you-email?name=Ada
 * Add &text to see the plain-text version. Only available while developing; the live site answers 404.
 */
export function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const firstName = url.searchParams.get('name') ?? 'Ada';
  const email = welcomeConnectReplyEmail({ firstName, assetBase: url.origin });

  if (url.searchParams.has('text')) {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return new Response(email.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
