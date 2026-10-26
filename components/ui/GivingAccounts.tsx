'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { GIVING_ACCOUNTS, GIVING_ACCOUNT_NAME } from '@/lib/church';
import styles from './GivingAccounts.module.css';

export function GivingAccounts({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(number: string, bank: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(number);
      track('copy_account_number', { bank, currency: 'NGN' });
      setTimeout(() => setCopied((current) => (current === number ? null : current)), 1500);
    } catch {
      // Clipboard API unavailable — nothing to fall back to silently; the number is still selectable text.
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.accountName}>{GIVING_ACCOUNT_NAME}</span>
      <div className={styles.fields}>
        {GIVING_ACCOUNTS.map((account) => (
          <div className={`${styles.field} glass-on-${theme}`} key={account.bank}>
            <div className={styles.fieldText}>
              <span className={styles.bank}>{account.bank}</span>
              <span className={styles.number}>{account.number}</span>
            </div>
            <button
              type="button"
              className={`${styles.copyButton} ${theme === 'light' ? styles.copyButtonLight : ''}`}
              onClick={() => handleCopy(account.number, account.bank)}
            >
              {copied === account.number ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
