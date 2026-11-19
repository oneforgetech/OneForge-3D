/**
 * Server-only: send a form entry to ONEFORGE Hub's intake API (HUB_INTAKE_URL).
 *
 * - Signs the raw body: HMAC-SHA256(HUB_INTAKE_SECRET, `${timestamp}.${body}`).
 * - 3-second timeout and one retry (network errors, timeouts and 5xx only).
 * - Never throws. A Hub outage must never break a website form: the caller keeps
 *   writing to the Google Sheet, and the Hub's sheet sync backfills anything missed,
 *   matched by the same request id (the sheet's last column, hub_request_id).
 * - Failed sends wait in a small in-memory queue and are retried with the next
 *   entry this server instance handles. That queue is best effort (it is lost if
 *   the instance stops); the sheet + sync is the durable safety net.
 * - Never logs the entry itself.
 */
import { createHmac, randomUUID } from 'node:crypto';

if (typeof window !== 'undefined') throw new Error('lib/hub.ts is server-only');

export type HubForm = 'connect' | 'serve' | 'hello' | 'partner' | 'faith' | 'juniors';

type Pending = { form: HubForm; body: string; requestId: string; tries: number };
const queue: Pending[] = [];
const QUEUE_MAX = 50;
const TIMEOUT_MS = 3_000;

export function hubConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!(env.HUB_INTAKE_URL && env.HUB_INTAKE_SECRET);
}

export function newRequestId(): string {
  return `req-${randomUUID()}`;
}

export function signBody(secret: string, timestamp: number, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

async function postOnce(form: HubForm, body: string, requestId: string, fetchImpl: typeof fetch): Promise<'ok' | 'retry' | 'reject'> {
  const base = (process.env.HUB_INTAKE_URL ?? '').replace(/\/$/, '');
  const secret = process.env.HUB_INTAKE_SECRET ?? '';
  const timestamp = Math.floor(Date.now() / 1000);
  try {
    const res = await fetchImpl(`${base}/${form}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-oneforge-timestamp': String(timestamp),
        'x-oneforge-signature': signBody(secret, timestamp, body),
        'x-oneforge-request-id': requestId,
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (res.ok) return 'ok';
    return res.status >= 500 || res.status === 429 ? 'retry' : 'reject';
  } catch {
    return 'retry'; // timeout or network
  }
}

async function send(item: Pending, fetchImpl: typeof fetch): Promise<boolean> {
  let result = await postOnce(item.form, item.body, item.requestId, fetchImpl);
  if (result === 'retry') result = await postOnce(item.form, item.body, item.requestId, fetchImpl);
  if (result === 'ok') return true;
  if (result === 'retry' && queue.length < QUEUE_MAX && item.tries < 5) queue.push({ ...item, tries: item.tries + 1 });
  // 'reject' (4xx) means the Hub refused this entry; retrying won't help. The sheet still has it.
  console.error(`[hub] ${item.form} entry not delivered (${result})`);
  return false;
}

/**
 * Send one entry. `fields` are the same labelled values written to the sheet row.
 * Resolves true when the Hub has it; false otherwise (never rejects).
 */
export async function hubSubmit(
  form: HubForm,
  fields: Record<string, string>,
  requestId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!hubConfigured()) return false;
  // Try anything waiting from earlier failures, without holding up this visitor.
  if (queue.length) {
    const waiting = queue.splice(0, 5);
    void Promise.all(waiting.map((w) => send(w, fetchImpl)));
  }
  return send({ form, body: JSON.stringify({ fields }), requestId, tries: 0 }, fetchImpl);
}

/** For tests. */
export const _queueLength = () => queue.length;
