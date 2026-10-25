import { NextResponse } from 'next/server';
import { CHURCH_EMAIL } from '@/lib/church';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/connect — the "Say hello" form.
 *
 * Delivery (set at least one in production; see .env.example):
 *   - Email via Resend:  RESEND_API_KEY + CONNECT_FROM_EMAIL (+ CONNECT_TO_EMAIL, default hello@oneforge.org)
 *   - Webhook:           CONNECT_WEBHOOK_URL  (Slack / Zapier / Make / Google Apps Script…)
 * With neither set, production answers 503 so nobody is ever told "we've got it" when we haven't.
 * (In local development it just logs, so the form can be tried without keys.)
 *
 * Protections: same-origin check, JSON-only with a size cap, strict field validation and length
 * caps, a honeypot and a minimum-fill-time check (both answered with a quiet success so bots learn
 * nothing), and a per-IP rate limit. Nothing personal is written to logs in production.
 */

const TOPICS = ['visiting', 'group', 'serving', 'prayer', 'opening', 'question', 'hello'] as const;
type Topic = (typeof TOPICS)[number];
const OPENING = new Set(['foundations', 'worship', 'depth', 'craft', 'calling', 'junior-church', 'family-ministry', 'family-ministry-marriage', 'family-ministry-singles', 'family-ministry-men', 'family-ministry-women']);
const GROUPS = new Set(['fireside', 'forge']);

const MAX_BODY_BYTES = 12_000;
const LIMITS = { name: 80, email: 120, text: 1500, short: 80 };

// --- rate limit (per IP; in memory, so it resets when the server instance does) --------------
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 60 * 60_000)) hits.delete(k);
  const lastMinute = recent.filter((t) => now - t < 60_000).length;
  return lastMinute > 4 || recent.length > 15;
}

const clean = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '';

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  // 1) must come from our own pages
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return fail(403, 'forbidden');
  if (origin) {
    try {
      if (new URL(origin).host !== host) return fail(403, 'forbidden');
    } catch {
      return fail(403, 'forbidden');
    }
  }
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return fail(415, 'unsupported');

  // 2) rate limit
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return fail(429, 'rate_limited');

  // 3) parse (size-capped)
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, 'invalid');
  }
  if (raw.length > MAX_BODY_BYTES) return fail(413, 'too_large');
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape');
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, 'invalid');
  }

  // 4) bots: honeypot filled, or submitted faster than a person can type. Quiet success.
  if (clean(body.website, 50) || (typeof body.elapsedMs === 'number' && body.elapsedMs < 1200)) {
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // 5) validate
  const firstName = clean(body.firstName, LIMITS.name);
  const whatsappRaw = clean(body.whatsapp, 30);
  const digits = whatsappRaw.replace(/\D/g, '');
  const topic = clean(body.topic, 20) as Topic;
  const email = clean(body.email, LIMITS.email);
  if (!firstName) return fail(400, 'name_required');
  if (digits.length < 10 || digits.length > 15 || !/^[+\d\s()\-.]+$/.test(whatsappRaw)) return fail(400, 'whatsapp_invalid');
  if (!TOPICS.includes(topic)) return fail(400, 'topic_invalid');
  if (body.permission !== true) return fail(400, 'permission_required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(400, 'email_invalid');

  const opening = clean(body.opening, LIMITS.short);
  const group = clean(body.group, LIMITS.short);
  const visitDate = clean(body.visitDate, 20);
  if (topic === 'opening' && opening && !OPENING.has(opening)) return fail(400, 'invalid');
  if (topic === 'group' && group && !GROUPS.has(group)) return fail(400, 'invalid');
  if (visitDate && !/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) return fail(400, 'invalid');

  const fields: [string, string][] = [
    ['Name', firstName],
    ['WhatsApp', `+${digits}`],
    ['Email', email || '—'],
    ['Topic', topic],
  ];
  if (topic === 'visiting') {
    fields.push(['Which Sunday', visitDate || '—'], ['Bringing children', clean(body.bringingChildren, 5) || '—']);
    if (clean(body.bringingChildren, 5) === 'yes') fields.push(['Children’s ages', clean(body.childrenAges, LIMITS.short) || '—']);
  }
  if (topic === 'opening') fields.push(['Wants to hear when this opens', opening || '—']);
  if (topic === 'group') fields.push(['Group', group || '—']);
  if (topic === 'serving') fields.push(['Where they could serve', clean(body.serving, LIMITS.text) || '—']);
  if (topic === 'prayer') fields.push(['Prayer request', clean(body.prayerText, LIMITS.text) || '—'], ['Keep private to the prayer team', body.prayerPrivate === false ? 'no' : 'yes']);
  if (topic === 'question') fields.push(['Question', clean(body.question, LIMITS.text) || '—']);
  const note = clean(body.message, LIMITS.text);
  if (note) fields.push(['Message', note]);
  fields.push(['OK to add to the WhatsApp community', body.community === true ? 'yes' : 'no'], ['Received', new Date().toISOString()]);

  const text = fields.map(([k, v]) => `${k}: ${v}`).join('\n');
  const subject = `[ONEFORGE] ${topic} — ${firstName}`;

  // 6) deliver
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.CONNECT_FROM_EMAIL;
  const to = process.env.CONNECT_TO_EMAIL || CHURCH_EMAIL;
  const webhook = process.env.CONNECT_WEBHOOK_URL;
  const configured = !!(resendKey && from) || !!webhook;

  if (!configured) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[connect form — dev only, nothing was sent]\n' + text);
      return NextResponse.json({ ok: true, dev: true }, { headers: { 'Cache-Control': 'no-store' } });
    }
    console.error('[connect form] no delivery configured: set RESEND_API_KEY + CONNECT_FROM_EMAIL, or CONNECT_WEBHOOK_URL');
    return fail(503, 'not_configured');
  }

  const attempts: Promise<boolean>[] = [];
  if (resendKey && from) {
    attempts.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, text, ...(email ? { reply_to: email } : {}) }),
        signal: AbortSignal.timeout(10_000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }
  if (webhook) {
    attempts.push(
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*${subject}*\n${text}`, subject, topic, name: firstName, whatsapp: `+${digits}`, email: email || null, message: text }),
        signal: AbortSignal.timeout(10_000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }
  const results = await Promise.all(attempts);
  if (!results.some(Boolean)) {
    console.error('[connect form] delivery failed on every configured channel');
    return fail(502, 'delivery_failed');
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

// Everything else is not allowed.
export function GET() {
  return fail(405, 'method_not_allowed');
}
