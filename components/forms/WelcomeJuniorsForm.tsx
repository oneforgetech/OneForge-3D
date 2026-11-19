'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { PrivacyLink } from './PrivacyLink';
import styles from './WelcomeForm.module.css';

const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'];

/** Today in Lagos (UTC+1), for the date picker's upper limit. */
const lagosToday = () => new Date(Date.now() + 3600_000).toISOString().slice(0, 10);

const MESSAGES: Record<string, string> = {
  parent_name_required: 'Tell us your name.',
  relationship_required: 'Choose how you’re related to the child.',
  child_name_required: 'Give your child’s first name and surname.',
  gender_required: 'Choose your child’s gender.',
  dob_invalid: 'Enter your child’s date of birth.',
  dob_out_of_range: 'ONEFORGE Juniors is for children up to 18. Check the date of birth.',
  phone_invalid: 'That phone number doesn’t look right. Check it and try again.',
  email_invalid: 'That email address doesn’t look right.',
  allergies_required: 'Tell us whether your child has any known allergies.',
  allergy_details_required: 'Tell us about the allergies so our team can keep your child safe.',
  consent_required: 'We need your permission to keep these details.',
  rate_limited: 'You’ve sent a few forms in a short time. Please wait a little and try again.',
  hub_unavailable: 'We couldn’t save this just now. Please try again in a minute, or register at the Juniors desk on Sunday.',
};

/**
 * "Register a child for ONEFORGE Juniors" on /welcome. Replaces the old Google Form.
 * Posts to /api/connect (topic "welcome-juniors"), which sends it ONLY to ONEFORGE Hub:
 * health details are never written to the sheet, email or a webhook. No age field:
 * the Hub works out the age and group from the date of birth.
 */
export function WelcomeJuniorsForm() {
  const [f, setF] = useState({
    parentName: '',
    relationship: '',
    email: '',
    phone: '',
    whatsapp: '',
    childName: '',
    gender: '',
    dateOfBirth: '',
    schoolClass: '',
    allergies: '',
    allergyDetails: '',
    needs: '',
    secondName: '',
    secondRelationship: '',
    secondPhone: '',
  });
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));
  const today = lagosToday();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    if (!guardianConsent) {
      setError('consent_required');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'welcome-juniors',
          ...f,
          guardianConsent,
          photoConsent,
          website: honeypot,
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : '');
        throw new Error('request failed');
      }
      setStatus('sent');
      track('welcome_juniors_form_sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.confirmation}>
        <span className={styles.confirmationIcon}>
          <IconCheck />
        </span>
        <h2 className={`${styles.heading} display-heading`}>Thank you.</h2>
        <p className={styles.confirmationBody}>
          {f.childName.split(' ')[0] || 'Your child'} is registered for ONEFORGE Juniors. Someone from the Juniors team will
          be in touch this week. Register another child by opening this form again.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jParent">Your name (parent or guardian)</label>
        <input id="jParent" className={styles.input} value={f.parentName} onChange={set('parentName')} autoComplete="name" required />
      </div>
      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jRel">Relationship to the child</label>
        <select id="jRel" className={styles.input} value={f.relationship} onChange={set('relationship')} required>
          <option value="">Choose…</option>
          {RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jPhone">Phone you can answer during Sunday services</label>
        <input id="jPhone" className={styles.input} value={f.phone} onChange={set('phone')} type="tel" inputMode="tel" autoComplete="tel" required />
      </div>
      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jWa">WhatsApp number (if different)</label>
        <input id="jWa" className={styles.input} value={f.whatsapp} onChange={set('whatsapp')} type="tel" inputMode="tel" />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="jEmail">Email (optional)</label>
        <input id="jEmail" className={styles.input} value={f.email} onChange={set('email')} type="email" autoComplete="email" />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="jChild">Child&apos;s full name (first, middle, surname)</label>
        <input id="jChild" className={styles.input} value={f.childName} onChange={set('childName')} required />
      </div>
      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jDob">Date of birth</label>
        <input id="jDob" className={styles.input} value={f.dateOfBirth} onChange={set('dateOfBirth')} type="date" max={today} required />
      </div>
      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="jGender">Gender</label>
        <select id="jGender" className={styles.input} value={f.gender} onChange={set('gender')} required>
          <option value="">Choose…</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="jClass">Current class or grade in school (optional)</label>
        <input id="jClass" className={styles.input} value={f.schoolClass} onChange={set('schoolClass')} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="jAllergies">Does your child have any known allergies?</label>
        <select id="jAllergies" className={styles.input} value={f.allergies} onChange={set('allergies')} required>
          <option value="">Choose…</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      {f.allergies === 'yes' && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="jAllergyDetails">Allergy details</label>
          <textarea id="jAllergyDetails" className={styles.textarea} value={f.allergyDetails} onChange={set('allergyDetails')} maxLength={1000} required />
        </div>
      )}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="jNeeds">Special learning needs, disabilities or medical conditions we should know about (optional)</label>
        <textarea id="jNeeds" className={styles.textarea} value={f.needs} onChange={set('needs')} maxLength={1500} />
      </div>

      {showSecond ? (
        <>
          <div className={`${styles.field} ${styles.half}`}>
            <label className={styles.label} htmlFor="j2Name">Second contact&apos;s name</label>
            <input id="j2Name" className={styles.input} value={f.secondName} onChange={set('secondName')} />
          </div>
          <div className={`${styles.field} ${styles.half}`}>
            <label className={styles.label} htmlFor="j2Phone">Second contact&apos;s phone</label>
            <input id="j2Phone" className={styles.input} value={f.secondPhone} onChange={set('secondPhone')} type="tel" inputMode="tel" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="j2Rel">Their relationship to the child</label>
            <select id="j2Rel" className={styles.input} value={f.secondRelationship} onChange={set('secondRelationship')}>
              <option value="">Choose…</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <button type="button" className={styles.fineprint} style={{ textAlign: 'left', textDecoration: 'underline', background: 'none', border: 0, padding: 0, cursor: 'pointer', minHeight: 44 }} onClick={() => setShowSecond(true)}>
          Add a second contact (optional)
        </button>
      )}

      <label className={styles.checkbox}>
        <input type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} required />
        I&apos;m this child&apos;s parent or guardian, and I agree that ONEFORGE may keep these details, including any health
        information, to care for my child at ONEFORGE Juniors.<PrivacyLink />
      </label>
      <label className={styles.checkbox}>
        <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} />
        ONEFORGE may include my child in photos and videos of church life (optional).
      </label>

      <p className={styles.fineprint}>
        Health details are seen only by the Juniors lead and our safeguarding lead.
      </p>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Register'}
      </button>

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {MESSAGES[error] ?? 'We couldn’t send that just now. Please try again, or register at the Juniors desk on Sunday.'}
        </p>
      )}
    </form>
  );
}
