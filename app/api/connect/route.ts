import { NextResponse } from 'next/server';
import { CHURCH_EMAIL } from '@/lib/church';
import { PARTNER_EMAIL, PARTNER_GIFT_OPTIONS } from '@/lib/partner';
import { partnerThanksEmail } from '@/lib/partner-email';
import { WELCOME_INTERESTS } from '@/lib/welcome';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/connect — the "Say hello" form, (topic "partner") the /partner page's
 * "Let us say thank you" form, and (topic "welcome") the /welcome guest card.
 *
 * Delivery (set at least one in production; see .env.example):
 *   - Email via Resend:  RESEND_API_KEY + CONNECT_FROM_EMAIL (+ CONNECT_TO_EMAIL, default hello@oneforge.org;
 *                        partner forms go to PARTNER_TO_EMAIL, default boye.oloyede@oneforge.org)
 *   - Google Sheet:      SHEETS_WEBHOOK_URL  (the Apps Script in integrations/google-sheet.gs; one tab per form)
 *   - Webhook:           CONNECT_WEBHOOK_URL  (Slack / Zapier / Make…)
 * With none set, production answers 503 so nobody is ever told "we've got it" when we haven't.
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

const GIFTS = new Set(PARTNER_GIFT_OPTIONS.map((o) => o.value));

// The Google Sheet's "Say hello" columns, in order. Questions only some topics ask stay blank on the others.
const HELLO_SHEET_COLUMNS = [
  'Name',
  'WhatsApp',
  'Email',
  'Topic',
  'Which Sunday',
  'Bringing children',
  'Children’s ages',
  'Wants to hear when this opens',
  'Group',
  'Where they could serve',
  'Prayer request',
  'Keep private to the prayer team',
  'Question',
  'Message',
  'OK to add to the WhatsApp community',
];

const WELCOME_SHEET_COLUMNS = ['Name', 'Interested in', 'Email', 'Phone', 'OK to contact', 'Anything else'];

const MAX_BODY_BYTES = 12_000;
const LIMITS = { name: 80, email: 120, text: 1500, short: 80 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()\-.]+$/;

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

  if (body.topic === 'partner') return partner(body);
  if (body.topic === 'welcome') return welcomeCard(body);

  // 5) validate
  const firstName = clean(body.firstName, LIMITS.name);
  const whatsappRaw = clean(body.whatsapp, 30);
  const digits = whatsappRaw.replace(/\D/g, '');
  const topic = clean(body.topic, 20) as Topic;
  const email = clean(body.email, LIMITS.email);
  if (!firstName) return fail(400, 'name_required');
  if (digits.length < 10 || digits.length > 15 || !PHONE_RE.test(whatsappRaw)) return fail(400, 'whatsapp_invalid');
  if (!TOPICS.includes(topic)) return fail(400, 'topic_invalid');
  if (body.permission !== true) return fail(400, 'permission_required');
  if (email && !EMAIL_RE.test(email)) return fail(400, 'email_invalid');

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
  fields.push(['OK to add to the WhatsApp community', body.community === true ? 'yes' : 'no']);

  // 6) deliver
  return deliver({
    subject: `[ONEFORGE] ${topic} — ${firstName}`,
    fields,
    to: process.env.CONNECT_TO_EMAIL || CHURCH_EMAIL,
    replyTo: email,
    data: { topic, name: firstName, whatsapp: `+${digits}`, email: email || null },
    sheet: { tab: 'Say hello', columns: HELLO_SHEET_COLUMNS },
  });
}

/** The partner page's "Let us say thank you" form: email is required, phone is optional, no WhatsApp permission. */
async function partner(body: Record<string, unknown>) {
  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const phone = clean(body.phone, 30);
  const phoneDigits = phone.replace(/\D/g, '');
  const gift = clean(body.gift, 20);
  if (!name) return fail(400, 'name_required');
  if (!EMAIL_RE.test(email)) return fail(400, 'email_invalid');
  if (phone && (phoneDigits.length < 7 || phoneDigits.length > 15 || !PHONE_RE.test(phone))) return fail(400, 'phone_invalid');
  if (!GIFTS.has(gift)) return fail(400, 'invalid');

  const response = await deliver({
    subject: `[ONEFORGE] partner — ${name}`,
    fields: [
      ['Name', name],
      ['Email', email],
      ['Phone or WhatsApp', phone || '—'],
      ['Gave to', PARTNER_GIFT_OPTIONS.find((o) => o.value === gift)?.label ?? gift],
      ['Reference', gift],
    ],
    to: process.env.PARTNER_TO_EMAIL || PARTNER_EMAIL,
    replyTo: email,
    data: { topic: 'partner', name, email, phone: phone || null, gift },
    sheet: { tab: 'Partner' },
  });
  // Only once the entry has reached us, so a failed send (which the giver may retry) never gets thanked twice.
  if (response.ok) await sendPartnerThanks({ name, email, gift });
  return response;
}

/**
 * Boye's thank-you email to the giver (lib/partner-email.ts). Needs Resend; sent from PARTNER_FROM_EMAIL
 * (falling back to CONNECT_FROM_EMAIL), with replies going to Boye. If it fails, the entry still counts.
 */
async function sendPartnerThanks({ name, email, gift }: { name: string; email: string; gift: string }) {
  const { subject, html, text } = partnerThanksEmail({ name, gift });
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.PARTNER_FROM_EMAIL || process.env.CONNECT_FROM_EMAIL;
  if (!resendKey || !from) {
    if (process.env.NODE_ENV !== 'production') console.log(`[partner thank-you — dev only, nothing was sent]\nSubject: ${subject}\n\n${text}`);
    return;
  }
  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject, html, text, reply_to: PARTNER_EMAIL }),
    signal: AbortSignal.timeout(8_000),
  })
    .then((r) => r.ok)
    .catch(() => false);
  if (!sent) console.error('[partner form] thank-you email not sent');
}

/** The /welcome guest card (QR code handed out in-service): name + what they'd like help with, email and phone optional. */
async function welcomeCard(body: Record<string, unknown>) {
  const name = clean(body.name, LIMITS.name);
  const interests = Array.isArray(body.interests)
    ? body.interests.filter((v): v is string => typeof v === 'string' && WELCOME_INTERESTS.some((i) => i.value === v))
    : [];
  const email = clean(body.email, LIMITS.email);
  const phone = clean(body.phone, 30);
  const phoneDigits = phone.replace(/\D/g, '');
  const anythingElse = clean(body.anythingElse, LIMITS.text);
  if (!name) return fail(400, 'name_required');
  if (interests.length === 0) return fail(400, 'interests_required');
  if (email && !EMAIL_RE.test(email)) return fail(400, 'email_invalid');
  if (phone && (phoneDigits.length < 7 || phoneDigits.length > 15 || !PHONE_RE.test(phone))) return fail(400, 'phone_invalid');

  const interestLabels = interests.map((v) => WELCOME_INTERESTS.find((i) => i.value === v)!.label);

  return deliver({
    subject: `[ONEFORGE] welcome card — ${name}`,
    fields: [
      ['Name', name],
      ['Interested in', interestLabels.join('; ')],
      ['Email', email || '—'],
      ['Phone', phone || '—'],
      ['OK to contact', body.contactConsent === true ? 'yes' : 'no'],
      ['Anything else', anythingElse || '—'],
    ],
    to: process.env.CONNECT_TO_EMAIL || CHURCH_EMAIL,
    replyTo: email || undefined,
    data: { topic: 'welcome', name, interests, email: email || null, phone: phone || null },
    sheet: { tab: 'Welcome card', columns: WELCOME_SHEET_COLUMNS },
  });
}

async function deliver({
  subject,
  fields,
  to,
  replyTo,
  data,
  sheet,
}: {
  subject: string;
  fields: [string, string][];
  to: string;
  replyTo?: string;
  data: Record<string, unknown>;
  /** The Google Sheet tab this form's entries go to, and its column order (default: the order of `fields`). */
  sheet: { tab: string; columns?: readonly string[] };
}) {
  const text = [...fields, ['Received', new Date().toISOString()]].map(([k, v]) => `${k}: ${v}`).join('\n');
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.CONNECT_FROM_EMAIL;
  const webhook = process.env.CONNECT_WEBHOOK_URL;
  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  const configured = !!(resendKey && from) || !!webhook || !!sheetUrl;

  if (!configured) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[connect form — dev only, nothing was sent]\n' + text);
      return NextResponse.json({ ok: true, dev: true }, { headers: { 'Cache-Control': 'no-store' } });
    }
    console.error('[connect form] no delivery configured: set RESEND_API_KEY + CONNECT_FROM_EMAIL, SHEETS_WEBHOOK_URL or CONNECT_WEBHOOK_URL');
    return fail(503, 'not_configured');
  }

  const attempts: [channel: string, sent: Promise<boolean>][] = [];
  if (resendKey && from) {
    attempts.push([
      'email',
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
        signal: AbortSignal.timeout(10_000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    ]);
  }
  if (sheetUrl) {
    attempts.push([
      'Google Sheet',
      fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab: sheet.tab, row: sheetRow(fields, sheet.columns) }),
        signal: AbortSignal.timeout(15_000),
      })
        // Apps Script answers 200 even when the script fails (after a redirect, which fetch follows),
        // so the script's own { ok } decides.
        .then(async (r) => r.ok && (await r.json())?.ok === true)
        .catch(() => false),
    ]);
  }
  if (webhook) {
    attempts.push([
      'webhook',
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*${subject}*\n${text}`, subject, ...data, message: text }),
        signal: AbortSignal.timeout(10_000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    ]);
  }
  const results = await Promise.all(attempts.map(([, sent]) => sent));
  const failed = attempts.filter((_, i) => !results[i]).map(([channel]) => channel);
  if (failed.length === attempts.length) {
    console.error('[connect form] delivery failed on every configured channel');
    return fail(502, 'delivery_failed');
  }
  if (failed.length) console.error(`[connect form] not delivered by: ${failed.join(', ')}`);
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

/** One Google Sheet row: the tab's columns first (blank where this entry has no answer), then any other field. */
function sheetRow(fields: [string, string][], columns: readonly string[] = []) {
  const given = new Map(fields);
  const order = [...columns, ...fields.map(([label]) => label).filter((label) => !columns.includes(label))];
  return Object.fromEntries(
    order.map((label) => {
      const value = given.get(label) ?? '';
      return [label, value === '—' ? '' : value];
    }),
  );
}

// Everything else is not allowed.
export function GET() {
  return fail(405, 'method_not_allowed');
}
