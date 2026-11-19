// Run with: npm test  (node --test, no extra packages)
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { beforeEach, test } from 'node:test';
import { _queueLength, hubSubmit, newRequestId, signBody } from './hub.ts';

beforeEach(() => {
  process.env.HUB_INTAKE_URL = 'https://hub.example/api/intake';
  process.env.HUB_INTAKE_SECRET = 'test-secret';
});

test('signs the raw body with the timestamp, as the Hub expects', async () => {
  let seen: { url: string; headers: Record<string, string>; body: string } | null = null;
  const fake = (async (url: string, init: RequestInit) => {
    seen = { url, headers: init.headers as Record<string, string>, body: String(init.body) };
    return new Response('{"ok":true}', { status: 200 });
  }) as unknown as typeof fetch;
  const id = newRequestId();
  assert.equal(await hubSubmit('connect', { 'First name': 'Ada' }, id, fake), true);
  assert.ok(seen);
  const s = seen as { url: string; headers: Record<string, string>; body: string };
  assert.equal(s.url, 'https://hub.example/api/intake/connect');
  assert.equal(s.headers['x-oneforge-request-id'], id);
  const ts = s.headers['x-oneforge-timestamp'];
  assert.equal(s.headers['x-oneforge-signature'], createHmac('sha256', 'test-secret').update(`${ts}.${s.body}`).digest('hex'));
  assert.equal(signBody('k', 1, 'b'), createHmac('sha256', 'k').update('1.b').digest('hex'));
});

test('a Hub that hangs never breaks the form: false after one retry, about 6 s at most', async () => {
  let calls = 0;
  const hanging = ((_url: string, init: RequestInit) => {
    calls++;
    return new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('timeout'))));
  }) as unknown as typeof fetch;
  const started = Date.now();
  const ok = await hubSubmit('serve', { 'First name': 'Bayo' }, newRequestId(), hanging);
  assert.equal(ok, false);
  assert.equal(calls, 2); // one try + one retry
  assert.ok(Date.now() - started < 7_000);
  assert.ok(_queueLength() >= 1); // waits to be retried with the next entry
});

test('a 400 from the Hub is not retried', async () => {
  let calls = 0;
  const id = newRequestId();
  const refusing = (async (_url: string, init: RequestInit) => {
    // Earlier queued entries may be retried here too; count only this entry's tries.
    if ((init.headers as Record<string, string>)['x-oneforge-request-id'] === id) calls++;
    return new Response('{"ok":false}', { status: 400 });
  }) as unknown as typeof fetch;
  assert.equal(await hubSubmit('hello', { Name: 'X' }, id, refusing), false);
  assert.equal(calls, 1);
});

test('does nothing (and says so) when the Hub isn\'t configured', async () => {
  delete process.env.HUB_INTAKE_URL;
  assert.equal(await hubSubmit('partner', {}, newRequestId(), (() => { throw new Error('should not call'); }) as never), false);
});
