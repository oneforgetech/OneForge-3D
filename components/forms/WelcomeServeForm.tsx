'use client';

import { useRef, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { track } from '@/lib/analytics';
import { CHURCH_EMAIL } from '@/lib/church';
import { SERVE_AREAS, SERVE_CHILDREN_NOTE } from '@/lib/serve';
import { ServeAreasModal } from './ServeAreasModal';
import styles from './WelcomeForm.module.css';

type Errors = Partial<Record<'firstName' | 'phone' | 'areas' | 'consent', string>>;

/**
 * "Serve with us" on the /welcome page: starts as two buttons. "I'm willing" reveals the
 * sign-up form; "Learn more" opens a modal describing each area, for anyone who wants to
 * read before deciding whether to open the form at all.
 */
export function WelcomeServeForm() {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(0);
  const [errorCode, setErrorCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const firstNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const areasRef = useRef<HTMLFieldSetElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  function toggleArea(value: string) {
    setAreas((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function openForm() {
    setOpen(true);
    openedAt.current = Date.now();
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Tell us your first name.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      next.phone = 'Add your WhatsApp number so we can call you. It looks too short right now.';
    }
    if (areas.length === 0) next.areas = 'Tick at least one — “Not sure yet” is fine.';
    if (!consent) next.consent = "Tick the box so we're allowed to contact you.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap — silently drop
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.firstName) firstNameRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.areas) areasRef.current?.focus();
      else if (nextErrors.consent) consentRef.current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const areaLabels = areas.map((v) => SERVE_AREAS.find((a) => a.value === v)!.label);
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'welcome-serve',
          firstName,
          phone,
          email: email || undefined,
          areas,
          areaLabels,
          consent,
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
      track('welcome_serve_form_sent');
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
          Someone will call you within a week for a ten-minute chat. That&apos;s the whole first step.
        </p>
      </div>
    );
  }

  return (
    <>
      {!open && (
        <div className={styles.actions}>
          <button type="button" className={styles.submit} onClick={openForm}>
            I&apos;m willing
          </button>
          <button type="button" className={styles.link} onClick={() => setModalOpen(true)}>
            Learn more
          </button>
        </div>
      )}

      {open && (
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
            <label className={styles.label} htmlFor="serveFirstName">Your first name</label>
            <input
              ref={firstNameRef}
              id="serveFirstName"
              className={styles.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'serveFirstName-error' : undefined}
            />
            {errors.firstName && <span id="serveFirstName-error" className={styles.error}>{errors.firstName}</span>}
          </div>

          <div className={`${styles.field} ${styles.half}`}>
            <label className={styles.label} htmlFor="servePhone">Your WhatsApp number</label>
            <input
              ref={phoneRef}
              id="servePhone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              type="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'servePhone-error' : undefined}
            />
            {errors.phone && <span id="servePhone-error" className={styles.error}>{errors.phone}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="serveEmail">Email (optional)</label>
            <input
              id="serveEmail"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <fieldset
            ref={areasRef}
            className={styles.field}
            tabIndex={-1}
            aria-describedby={errors.areas ? 'areas-error' : undefined}
          >
            <legend className={styles.label}>Where would you like to help?</legend>
            <div className={styles.pillGroup}>
              {SERVE_AREAS.map((a) => (
                <label key={a.value} className={styles.pill}>
                  <input type="checkbox" checked={areas.includes(a.value)} onChange={() => toggleArea(a.value)} />
                  <span className={styles.pillBody}>
                    <span>{a.label}</span>
                    <span className={styles.hint}>{a.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {areas.includes('children') && <p className={styles.note}>{SERVE_CHILDREN_NOTE}</p>}
            {errors.areas && <span id="areas-error" className={styles.error}>{errors.areas}</span>}
          </fieldset>

          <label className={styles.checkbox}>
            <input
              ref={consentRef}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'consent-error' : undefined}
            />
            Yes, ONEFORGE may contact me about serving.
          </label>
          {errors.consent && <span id="consent-error" className={styles.error}>{errors.consent}</span>}

          <p className={styles.fineprint}>We only use this to reply to you, and we never share it.</p>

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
      )}

      <ServeAreasModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
