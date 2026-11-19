'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { CHURCH_EMAIL } from '@/lib/church';
import { STAGE_OF_LIFE_OPTIONS } from '@/lib/stageOfLife';
import { WELCOME_INTERESTS } from '@/lib/welcome';
import { PrivacyLink } from './PrivacyLink';
import styles from './WelcomeForm.module.css';

type Errors = Partial<Record<'firstName' | 'lastName' | 'stageOfLife', string>>;

/**
 * "Connect with us" on the /welcome page: a short way to say you came, with room for a
 * message. The "Let's connect" interests (same options as the paper guest card) and the
 * message box are both optional, so this is also just "I came, say hi" if that's all someone
 * wants. Phone and email are both optional too — the contact-consent checkbox only shows up
 * once one of them is filled in, so there's nothing to tick when there's no way to reply.
 */
export function WelcomeConnectForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stageOfLife, setStageOfLife] = useState('');
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
  const stageOfLifeRef = useRef<HTMLFieldSetElement>(null);

  function toggleInterest(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Tell us your first name.';
    if (!lastName.trim()) next.lastName = 'Tell us your last name.';
    if (!stageOfLife) next.stageOfLife = 'Choose the one that fits best.';
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
      else if (nextErrors.stageOfLife) stageOfLifeRef.current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'welcome-connect',
          interests,
          firstName,
          lastName,
          phone: phone || undefined,
          email: email || undefined,
          stageOfLife,
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

      <fieldset
        ref={stageOfLifeRef}
        className={styles.field}
        tabIndex={-1}
        aria-describedby={errors.stageOfLife ? 'stageOfLife-error' : undefined}
      >
        <legend className={styles.label}>Stage of life</legend>
        <span className={styles.hint}>Helps us understand who&apos;s coming through the door.</span>
        <div className={styles.pillGroup}>
          {STAGE_OF_LIFE_OPTIONS.map((s) => (
            <label key={s.value} className={styles.pill}>
              <input
                type="radio"
                name="stageOfLife"
                checked={stageOfLife === s.value}
                onChange={() => setStageOfLife(s.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
        {errors.stageOfLife && <span id="stageOfLife-error" className={styles.error}>{errors.stageOfLife}</span>}
      </fieldset>

      <fieldset className={styles.field}>
        <legend className={styles.label}>Let&apos;s connect</legend>
        <span className={styles.hint}>What would you like help with? Choose any that apply.</span>
        <div className={styles.pillGroup}>
          {WELCOME_INTERESTS.map((i) => (
            <label key={i.value} className={styles.pill}>
              <input type="checkbox" checked={interests.includes(i.value)} onChange={() => toggleInterest(i.value)} />
              {i.label}
            </label>
          ))}
        </div>
      </fieldset>

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
        <PrivacyLink />
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
