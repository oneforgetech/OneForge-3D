// Run with: npm test  (node --test, no extra packages)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanEmail, toE164 } from './phone.ts';

test('Nigerian numbers become E.164', () => {
  assert.equal(toE164('08171156652'), '+2348171156652');
  assert.equal(toE164('8171156652'), '+2348171156652');
  assert.equal(toE164('+2348171156652'), '+2348171156652');
  assert.equal(toE164('2348171156652'), '+2348171156652');
  assert.equal(toE164('+08035122991'), '+2348035122991'); // the old "+0…" bug
  assert.equal(toE164('0703 070 5916'), '+2347030705916');
  assert.equal(toE164('+7039284642'), '+2347039284642');
});

test('international numbers keep their country code', () => {
  assert.equal(toE164('+44 7700 900123'), '+447700900123');
  assert.equal(toE164('0044 7700 900123'), '+447700900123');
});

test('anything doubtful is kept as typed, for the Hub to flag', () => {
  assert.equal(toE164('+234813527301'), '+234813527301');
  assert.equal(toE164('0815?711028'), '0815?711028');
  assert.equal(toE164(''), '');
});

test('emails are trimmed and lower-cased only', () => {
  assert.equal(cleanEmail('  Ada.Obi@Gmail.COM '), 'ada.obi@gmail.com');
  assert.equal(cleanEmail('ada@gmil.com'), 'ada@gmil.com');
});
