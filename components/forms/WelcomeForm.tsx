'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { CHURCH_EMAIL } from '@/lib/church';
import { WELCOME_INTERESTS } from '@/lib/welcome';
import styles from './WelcomeForm.module.css';

type Errors = Partial<Record<'name' | 'interests', string>>;

/**
 * The online twin of the paper guest card handed out in-service — reached only by the
 * QR code printed on it, never linked from the site's own nav.
 */
export function WelcomeForm() {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [anythingElse, setAnythingElse] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = Date.now(); }, []);
  const [errorCode, setErrorCode] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const nameRef = useRef<HTMLInputElement>(null);
  const interestsRef = useRef<HTMLFieldSetElement>(null);

  function toggleInterest(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Let us know what name to use — doesn't have to be your full name.";
    if (interests.length === 0) next.interests = 'Choose at least one, so we know how to help.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap — silently drop
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.interests) interestsRef.current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'welcome',
          name,
          interests,
          email: email || undefined,
          phone: phone || undefined,
          contactConsent: phone || email ? contactConsent : undefined,
          anythingElse: anythingElse || undefined,
          website: honeypot,
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorCode(typeof data.error === 'string' ? data.error : '');
        throw new Error('request failed');
      }
      setStatus('sent');
      track('welcome_form_sent');
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
        <h2 className={`${styles.heading} display-heading`}>Thanks, {name || 'friend'}.</h2>
        <p className={styles.confirmationBody}>
          Someone from our team has this. You&apos;re welcome to settle in — we&apos;ll find you.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <fieldset
        ref={interestsRef}
        className={styles.field}
        tabIndex={-1}
        aria-describedby={errors.interests ? 'interests-error' : undefined}
      >
        <legend className={styles.label}>Let&apos;s connect</legend>
        <span className={styles.hint}>What would you like help with? Choose any that apply.</span>
        <div className={styles.pillGroup}>
          {WELCOME_INTERESTS.map((i) => (
            <label key={i.value} className={styles.pill}>
              <input
                type="checkbox"
                checked={interests.includes(i.value)}
                onChange={() => toggleInterest(i.value)}
              />
              {i.label}
            </label>
          ))}
        </div>
        {errors.interests && <span id="interests-error" className={styles.error}>{errors.interests}</span>}
      </fieldset>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="name">Name you&apos;d like us to use</label>
        <input
          ref={nameRef}
          id="name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <span id="name-error" className={styles.error}>{errors.name}</span>}
      </div>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="phone">Phone number</label>
        <span className={styles.hint}>If you&apos;d like us to get in touch</span>
        <input
          id="phone"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          type="tel"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email (optional)</label>
        <input
          id="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      </div>

      {(phone || email) && (
        <label className={styles.checkbox}>
          <input type="checkbox" checked={contactConsent} onChange={(e) => setContactConsent(e.target.checked)} />
          Yes, ONEFORGE may contact me about the request I&apos;ve selected.
        </label>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="anythingElse">Anything else you&apos;d like us to know?</label>
        <textarea
          id="anythingElse"
          className={styles.textarea}
          value={anythingElse}
          maxLength={1500}
          onChange={(e) => setAnythingElse(e.target.value)}
        />
      </div>

      <p className={styles.fineprint}>
        Share only what you&apos;re comfortable sharing. Your details stay with our church team and are never shared.
      </p>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {errorCode === 'rate_limited'
            ? 'You’ve sent a few messages in a short time. Please wait a little and try again.'
            : `We couldn’t send that just now. Please try again, or message us at ${CHURCH_EMAIL}.`}
        </p>
      )}
    </form>
  );
}
