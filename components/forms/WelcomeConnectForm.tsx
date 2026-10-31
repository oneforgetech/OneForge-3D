'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { CHURCH_EMAIL } from '@/lib/church';
import styles from './WelcomeForm.module.css';

type Errors = Partial<Record<'firstName' | 'lastName', string>>;

/**
 * "Connect with us" on the /welcome page: a short way to say you came, with room for a
 * message. Phone and email are both optional — the contact-consent checkbox only shows up
 * once one of them is filled in, so there's nothing to tick when there's no way to reply.
 */
export function WelcomeConnectForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = Date.now(); }, []);
  const [errorCode, setErrorCode] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  function validate(): Errors {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Tell us your first name.';
    if (!lastName.trim()) next.lastName = 'Tell us your last name.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap — silently drop
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.firstName) firstNameRef.current?.focus();
      else if (nextErrors.lastName) lastNameRef.current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'welcome-connect',
          firstName,
          lastName,
          phone: phone || undefined,
          email: email || undefined,
          message: message || undefined,
          contactConsent: phone || email ? contactConsent : undefined,
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
      track('welcome_connect_form_sent');
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
        <h2 className={`${styles.heading} display-heading`}>Thanks, {firstName || 'friend'}.</h2>
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

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="firstName">First name</label>
        <input
          ref={firstNameRef}
          id="firstName"
          className={styles.input}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
        />
        {errors.firstName && <span id="firstName-error" className={styles.error}>{errors.firstName}</span>}
      </div>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="lastName">Last name</label>
        <input
          ref={lastNameRef}
          id="lastName"
          className={styles.input}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? 'lastName-error' : undefined}
        />
        {errors.lastName && <span id="lastName-error" className={styles.error}>{errors.lastName}</span>}
      </div>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="phone">Phone (optional)</label>
        <input
          id="phone"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          type="tel"
        />
      </div>

      <div className={`${styles.field} ${styles.half}`}>
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
          Yes, ONEFORGE may contact me.
        </label>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">Anything you&apos;d like to tell us? (optional)</label>
        <textarea
          id="message"
          className={styles.textarea}
          value={message}
          maxLength={1500}
          onChange={(e) => setMessage(e.target.value)}
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
