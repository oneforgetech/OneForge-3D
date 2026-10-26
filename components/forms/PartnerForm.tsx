'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { CHURCH_EMAIL } from '@/lib/church';
import { PARTNER_GIFT_OPTIONS } from '@/lib/partner';
import styles from './ConnectForm.module.css';

type Errors = Partial<Record<'name' | 'email', string>>;

/** The /partner page's "Let us say thank you" form. Same endpoint and protections as Say hello, topic "partner". */
export function PartnerForm({ className }: { className?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gift, setGift] = useState(PARTNER_GIFT_OPTIONS[0].value);
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = Date.now(); }, []);
  const [errorCode, setErrorCode] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Tell us your name.';
    if (!email.trim()) next.email = 'Add your email so we can thank you.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'That email looks incomplete. Check it and try again.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap — silently drop
    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();

    setStatus('sending');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'partner',
          name,
          email,
          phone: phone || undefined,
          gift,
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
      track('partner_form_sent', { gift });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.confirmation} role="status">
        <span className={styles.confirmationIcon}>
          <IconCheck />
        </span>
        <h3 className={`${styles.heading} display-heading`}>Thank you, {name.trim() || 'friend'}.</h3>
        <p className={styles.confirmationBody}>We&apos;ve got it, and we&apos;ll be in touch.</p>
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${className ?? ''}`} onSubmit={handleSubmit} noValidate>
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
        <label className={styles.label} htmlFor="partner-name">Your name</label>
        <input
          ref={nameRef}
          id="partner-name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'partner-name-error' : undefined}
        />
        {errors.name && <span id="partner-name-error" className={styles.error}>{errors.name}</span>}
      </div>

      <div className={`${styles.field} ${styles.half}`}>
        <label className={styles.label} htmlFor="partner-email">Email</label>
        <input
          ref={emailRef}
          id="partner-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'partner-email-error' : undefined}
        />
        {errors.email && <span id="partner-email-error" className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="partner-phone">Phone or WhatsApp (optional)</label>
        <input
          id="partner-phone"
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="partner-gift">What did you give to?</label>
        <select id="partner-gift" className={styles.input} value={gift} onChange={(e) => setGift(e.target.value)}>
          {PARTNER_GIFT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {errorCode === 'rate_limited'
            ? 'You’ve sent a few messages in a short time. Please wait a little and try again.'
            : errorCode === 'phone_invalid'
              ? 'That phone number doesn’t look right. Check it, or leave it blank.'
              : `We couldn’t send that just now. Please try again, or email us at ${CHURCH_EMAIL}.`}
        </p>
      )}
    </form>
  );
}
