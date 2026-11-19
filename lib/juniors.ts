/**
 * ONEFORGE Juniors registration (/welcome): validation and the labelled fields
 * sent to ONEFORGE Hub. Pure functions (no Next.js imports) so they're testable
 * with node --test. Children's health details go ONLY to the Hub, encrypted
 * there: never to the Google Sheet, email or any webhook.
 */
import { cleanEmail, toE164 } from './phone.ts';

export const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'] as const;

export type JuniorsError =
  | 'parent_name_required'
  | 'relationship_required'
  | 'child_name_required'
  | 'gender_required'
  | 'dob_invalid'
  | 'dob_out_of_range'
  | 'phone_invalid'
  | 'email_invalid'
  | 'allergies_required'
  | 'allergy_details_required'
  | 'consent_required';

const clean = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneOk = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && /^[+\d\s()\-.]+$/.test(raw);
};

/** Whole years on `onIso` for a YYYY-MM-DD birth date. */
export function ageOn(dobIso: string, onIso: string): number {
  const [by, bm, bd] = dobIso.split('-').map(Number);
  const [y, m, d] = onIso.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

export function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Today in Lagos (UTC+1, no DST). */
export const lagosToday = (now = new Date()) => new Date(now.getTime() + 3600_000).toISOString().slice(0, 10);

export function validateJuniors(
  body: Record<string, unknown>,
  today = lagosToday(),
): { ok: true; fields: Record<string, string> } | { ok: false; error: JuniorsError } {
  const parentName = clean(body.parentName, 120);
  const relationship = clean(body.relationship, 40);
  const childName = clean(body.childName, 160);
  const gender = clean(body.gender, 10);
  const dob = clean(body.dateOfBirth, 10);
  const phone = clean(body.phone, 30);
  const whatsapp = clean(body.whatsapp, 30);
  const email = cleanEmail(clean(body.email, 120));
  const allergies = clean(body.allergies, 3);
  const allergyDetails = clean(body.allergyDetails, 1000);
  const needs = clean(body.needs, 1500);
  const secondName = clean(body.secondName, 120);
  const secondRelationship = clean(body.secondRelationship, 40);
  const secondPhone = clean(body.secondPhone, 30);

  if (!parentName) return { ok: false, error: 'parent_name_required' };
  if (!(RELATIONSHIPS as readonly string[]).includes(relationship)) return { ok: false, error: 'relationship_required' };
  if (childName.split(/\s+/).filter(Boolean).length < 2) return { ok: false, error: 'child_name_required' };
  if (gender !== 'Female' && gender !== 'Male') return { ok: false, error: 'gender_required' };
  if (!isRealDate(dob)) return { ok: false, error: 'dob_invalid' };
  const age = ageOn(dob, today);
  if (dob > today || age > 18) return { ok: false, error: 'dob_out_of_range' };
  if (!phoneOk(phone) || (whatsapp && !phoneOk(whatsapp)) || (secondPhone && !phoneOk(secondPhone))) return { ok: false, error: 'phone_invalid' };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: 'email_invalid' };
  if (allergies !== 'yes' && allergies !== 'no') return { ok: false, error: 'allergies_required' };
  if (allergies === 'yes' && !allergyDetails) return { ok: false, error: 'allergy_details_required' };
  if (body.guardianConsent !== true) return { ok: false, error: 'consent_required' };

  return {
    ok: true,
    // Labels match ONEFORGE Hub's mapping (config/form-mapping.yaml, "Juniors registration").
    fields: {
      'Parent or guardian name': parentName,
      'Relationship to the child': relationship,
      Email: email,
      "Child's full name": childName,
      Gender: gender,
      'Date of birth': dob,
      'Current class or grade': clean(body.schoolClass, 60),
      'Phone reachable during Sunday services': toE164(phone),
      'WhatsApp number': whatsapp ? toE164(whatsapp) : '',
      'Known allergies': allergies,
      'Allergy details': allergies === 'yes' ? allergyDetails : '',
      'Special learning needs, disabilities or medical conditions': needs,
      'Second contact name': secondName,
      'Second contact relationship': secondName ? secondRelationship : '',
      'Second contact phone': secondName && secondPhone ? toE164(secondPhone) : '',
      'Guardian consent': 'yes',
      'Photo and video consent': body.photoConsent === true ? 'yes' : 'no',
    },
  };
}
