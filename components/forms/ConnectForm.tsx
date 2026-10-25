'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DatePicker } from './DatePicker';
import { IconCheck } from '@/components/ui/icons';
import { CHURCH_EMAIL } from '@/lib/church';
import { LAUNCH_DATE } from '@/lib/launch';
import type { ConnectTopic } from '@/lib/connect';
import styles from './ConnectForm.module.css';

const TOPICS: { value: ConnectTopic; label: string }[] = [
  { value: 'visiting', label: "I'm planning to visit" },
  { value: 'group', label: "I'd like to join a group" },
  { value: 'serving', label: "I'd like to serve on a team" },
  { value: 'prayer', label: "I'd like prayer" },
  { value: 'opening', label: 'Tell me when something opens' },
  { value: 'question', label: 'I have a question' },
  { value: 'hello', label: 'Just saying hello' },
];

const OPENING_OPTIONS: { value: string; label: string }[] = [
  { value: 'foundations', label: 'Foundations' },
  { value: 'worship', label: 'Worship' },
  { value: 'depth', label: 'Depth' },
  { value: 'craft', label: 'Craft' },
  { value: 'calling', label: 'Calling' },
  { value: 'junior-church', label: 'Junior Church' },
  { value: 'family-ministry-marriage', label: 'Family Ministry: marriage' },
  { value: 'family-ministry-singles', label: 'Family Ministry: singles' },
  { value: 'family-ministry-men', label: 'Family Ministry: men' },
  { value: 'family-ministry-women', label: 'Family Ministry: women' },
];

type Errors = Partial<Record<'firstName' | 'whatsapp' | 'topic' | 'permission', string>>;

export function ConnectForm() {
  const params = useSearchParams();
  const initialTopic = (params.get('topic') as ConnectTopic | null) ?? undefined;
  const initialDetail = params.get('detail') ?? '';

  const [firstName, setFirstName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+234 ');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<ConnectTopic | ''>(initialTopic ?? '');
  const [opening, setOpening] = useState(
    OPENING_OPTIONS.some((o) => o.value === initialDetail) ? initialDetail : '',
  );
  const [group, setGroup] = useState(initialDetail === 'forge' ? 'forge' : initialDetail === 'fireside' ? 'fireside' : '');
  const [serving, setServing] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [prayerPrivate, setPrayerPrivate] = useState(true);
  const [question, setQuestion] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [bringingChildren, setBringingChildren] = useState<'yes' | 'no' | ''>('');
  const [childrenAges, setChildrenAges] = useState('');
  const [permission, setPermission] = useState(false);
  const [community, setCommunity] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = Date.now(); }, []);
  const [errorCode, setErrorCode] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const firstNameRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const topicFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const permissionRef = useRef<HTMLInputElement>(null);
  const fieldRefs = { firstName: firstNameRef, whatsapp: whatsappRef, topic: topicFieldsetRef, permission: permissionRef };

  function validate(): Errors {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Tell us your first name.';
    const digits = whatsapp.replace(/\D/g, '');
    if (!digits) next.whatsapp = 'Add your WhatsApp number so we can reply.';
    else if (digits.length < 10) next.whatsapp = 'That number looks too short. Check it and try again.';
    if (!topic) next.topic = 'Choose what brings you here.';
    if (!permission) next.permission = "Tick the box so we're allowed to message you.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap — silently drop
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Focus the first invalid field, in visual (top-to-bottom) order — a
      // screen reader announces its label plus the describedby error text
      // the moment focus lands, so this doubles as the failure announcement.
      const firstKey = (['firstName', 'whatsapp', 'topic', 'permission'] as const).find((k) => nextErrors[k]);
      if (firstKey) fieldRefs[firstKey].current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          whatsapp,
          email: email || undefined,
          topic,
          opening: topic === 'opening' ? opening : undefined,
          group: topic === 'group' ? group : undefined,
          serving: topic === 'serving' ? serving : undefined,
          prayerText: topic === 'prayer' ? prayerText : undefined,
          prayerPrivate: topic === 'prayer' ? prayerPrivate : undefined,
          question: topic === 'question' ? question : undefined,
          visitDate: topic === 'visiting' ? visitDate : undefined,
          bringingChildren: topic === 'visiting' ? bringingChildren : undefined,
          childrenAges: topic === 'visiting' && bringingChildren === 'yes' ? childrenAges : undefined,
          permission,
          community,
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
          We&apos;ve got it. Someone from ONEFORGE will message you on WhatsApp.
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
        <label className={styles.label} htmlFor="firstName">Your first name</label>
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
        <label className={styles.label} htmlFor="whatsapp">Your WhatsApp number</label>
        <input
          ref={whatsappRef}
          id="whatsapp"
          className={styles.input}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          aria-invalid={!!errors.whatsapp}
          aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
        />
        {errors.whatsapp && <span id="whatsapp-error" className={styles.error}>{errors.whatsapp}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email (optional)</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <fieldset
        ref={topicFieldsetRef}
        className={styles.field}
        tabIndex={-1}
        aria-describedby={errors.topic ? 'topic-error' : undefined}
      >
        <legend className={styles.label}>What brings you here?</legend>
        <div className={styles.radioGroup}>
          {TOPICS.map((t) => (
            <label key={t.value} className={styles.radio}>
              <input
                type="radio"
                name="topic"
                value={t.value}
                checked={topic === t.value}
                onChange={() => setTopic(t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
        {errors.topic && <span id="topic-error" className={styles.error}>{errors.topic}</span>}
      </fieldset>

      {topic === 'opening' && (
        <div className={`${styles.field} ${styles.half}`}>
          <label className={styles.label} htmlFor="opening">Which one?</label>
          <select id="opening" className={styles.input} value={opening} onChange={(e) => setOpening(e.target.value)}>
            <option value="">Choose one</option>
            {OPENING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {topic === 'visiting' && (
        <>
          <div className={`${styles.field} ${styles.half}`}>
            <label className={styles.label} htmlFor="visitDate">Which Sunday?</label>
            <DatePicker id="visitDate" value={visitDate} onChange={setVisitDate} minDate={LAUNCH_DATE} />
          </div>
          <fieldset className={`${styles.field} ${styles.half}`}>
            <legend className={styles.label}>Bringing children?</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="bringingChildren"
                  checked={bringingChildren === 'yes'}
                  onChange={() => setBringingChildren('yes')}
                />
                Yes
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="bringingChildren"
                  checked={bringingChildren === 'no'}
                  onChange={() => setBringingChildren('no')}
                />
                No
              </label>
            </div>
          </fieldset>
          {bringingChildren === 'yes' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="childrenAges">Their ages</label>
              <input
                id="childrenAges"
                className={styles.input}
                value={childrenAges}
                onChange={(e) => setChildrenAges(e.target.value)}
                placeholder="So we can have the right learning packs ready"
              />
            </div>
          )}
        </>
      )}

      {topic === 'serving' && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="serving">What are you good at, or want to try?</label>
          <textarea
            id="serving"
            className={styles.textarea}
            value={serving}
            onChange={(e) => setServing(e.target.value)}
            placeholder="Anything counts, from sound desks to spreadsheets to making people feel welcome."
          />
        </div>
      )}

      {topic === 'prayer' && (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="prayerText">What would you like prayer for?</label>
            <textarea
              id="prayerText"
              className={styles.textarea}
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
            />
          </div>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={prayerPrivate} onChange={(e) => setPrayerPrivate(e.target.checked)} />
            Keep this between me and the prayer team
          </label>
        </>
      )}

      {topic === 'question' && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="question">Your question</label>
          <textarea id="question" className={styles.textarea} value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
      )}

      {topic === 'group' && (
        <fieldset className={styles.field}>
          <legend className={styles.label}>Which group?</legend>
          <div className={styles.radioGroup}>
            <label className={styles.radio}>
              <input type="radio" name="group" checked={group === 'fireside'} onChange={() => setGroup('fireside')} />
              Fireside Group, open to anyone
            </label>
            <label className={styles.radio}>
              <input type="radio" name="group" checked={group === 'forge'} onChange={() => setGroup('forge')} />
              Forge Group, a closed group that asks a commitment
            </label>
          </div>
          <span className={styles.hint}>Groups start in February. We&apos;ll be in touch before then.</span>
        </fieldset>
      )}

      <label className={styles.checkbox}>
        <input
          ref={permissionRef}
          type="checkbox"
          checked={permission}
          onChange={(e) => setPermission(e.target.checked)}
          aria-invalid={!!errors.permission}
          aria-describedby={errors.permission ? 'permission-error' : undefined}
        />
        ONEFORGE can message me on WhatsApp about what I&apos;ve asked for.
      </label>
      {errors.permission && <span id="permission-error" className={styles.error}>{errors.permission}</span>}

      <label className={styles.checkbox}>
        <input type="checkbox" checked={community} onChange={(e) => setCommunity(e.target.checked)} />
        Add me to the ONEFORGE WhatsApp community too.
      </label>

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
  );
}
