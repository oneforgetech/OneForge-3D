// Run with: npm test  (node --test, no extra packages)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateJuniors } from './juniors.ts';

const today = '2026-11-22';
const good = {
  parentName: 'Ngozi Obi',
  relationship: 'Mother',
  childName: 'Ada Chioma Obi',
  gender: 'Female',
  dateOfBirth: '2019-05-01',
  phone: '0803 123 4567',
  email: ' Ngozi@Example.com ',
  allergies: 'yes',
  allergyDetails: 'Peanuts',
  guardianConsent: true,
};

test('a complete registration produces the Hub fields, phones in E.164, no age field', () => {
  const r = validateJuniors(good, today);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.fields['Phone reachable during Sunday services'], '+2348031234567');
  assert.equal(r.fields.Email, 'ngozi@example.com');
  assert.equal(r.fields['Guardian consent'], 'yes');
  assert.equal(r.fields['Photo and video consent'], 'no'); // default no
  assert.ok(!Object.keys(r.fields).some((k) => /age\b/i.test(k) && !/language|message/i.test(k)));
});

test('guardian consent is required', () => {
  assert.deepEqual(validateJuniors({ ...good, guardianConsent: false }, today), { ok: false, error: 'consent_required' });
  assert.deepEqual(validateJuniors({ ...good, guardianConsent: 'true' }, today), { ok: false, error: 'consent_required' });
});

test('the date of birth must be a real date for a child aged 0–18', () => {
  assert.deepEqual(validateJuniors({ ...good, dateOfBirth: '2019-02-30' }, today), { ok: false, error: 'dob_invalid' });
  assert.deepEqual(validateJuniors({ ...good, dateOfBirth: '22/11/2019' }, today), { ok: false, error: 'dob_invalid' });
  assert.deepEqual(validateJuniors({ ...good, dateOfBirth: '2027-01-01' }, today), { ok: false, error: 'dob_out_of_range' });
  assert.deepEqual(validateJuniors({ ...good, dateOfBirth: '2007-11-21' }, today), { ok: false, error: 'dob_out_of_range' });
  assert.equal(validateJuniors({ ...good, dateOfBirth: '2008-11-22' }, today).ok, true); // 18 today
});

test('allergy details are required when allergies are ticked', () => {
  assert.deepEqual(validateJuniors({ ...good, allergyDetails: '' }, today), { ok: false, error: 'allergy_details_required' });
  assert.equal(validateJuniors({ ...good, allergies: 'no', allergyDetails: '' }, today).ok, true);
});

test('names, relationship and phone are checked', () => {
  assert.deepEqual(validateJuniors({ ...good, childName: 'Ada' }, today), { ok: false, error: 'child_name_required' });
  assert.deepEqual(validateJuniors({ ...good, relationship: 'Uncle-ish' }, today), { ok: false, error: 'relationship_required' });
  assert.deepEqual(validateJuniors({ ...good, phone: '123' }, today), { ok: false, error: 'phone_invalid' });
});
