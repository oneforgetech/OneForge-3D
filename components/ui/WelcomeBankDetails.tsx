'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { GIVING_ACCOUNT_NAME, GIVING_ACCOUNTS } from '@/lib/church';
import styles from './WelcomeBankDetails.module.css';

/** "Show bank details" on the /welcome Give section: the same accounts as /give and /partner, without leaving the page. */
export function WelcomeBankDetails() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.toggle} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide bank details' : 'Show bank details'}
      </button>
      {open && (
        <div className={styles.panel}>
          <p className={styles.name}>{GIVING_ACCOUNT_NAME}</p>
          {GIVING_ACCOUNTS.map((account) => (
            <AccountRow key={account.number} bank={account.bank} number={account.number} />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountRow({ bank, number }: { bank: string; number: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      track('copy_account_number', { bank, currency: 'NGN' });
    } catch {
      // Clipboard API unavailable: the number is still selectable text.
    }
  }

  return (
    <div className={styles.row}>
      <div>
        <p className={styles.bank}>{bank}</p>
        <p className={styles.number}>{number}</p>
      </div>
      <button type="button" className={styles.copy} onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
