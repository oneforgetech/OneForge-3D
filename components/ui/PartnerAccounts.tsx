'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IconArrowUpRight } from '@/components/ui/icons';
import { GIVING_ACCOUNT_NAME } from '@/lib/church';
import {
  PARTNER_NGN_ACCOUNTS,
  PARTNER_USD_ACCOUNT,
  PARTNER_USD_GUIDE_URL,
  PARTNER_USD_SWIFT,
  type PartnerAccount,
} from '@/lib/partner';
import styles from './PartnerAccounts.module.css';

/** The /partner page's bank details: three naira accounts, then the dollar account for giving from abroad. */
export function PartnerAccounts() {
  return (
    <div className={styles.wrap}>
      <h3 className={`${styles.heading} display-heading`}>Naira accounts</h3>
      <div className={styles.grid}>
        {PARTNER_NGN_ACCOUNTS.map((account) => (
          <BankCard key={account.number} account={account} />
        ))}
      </div>

      <div className={styles.abroad}>
        <h3 className={`${styles.heading} display-heading`}>Giving from abroad: Dollar Account</h3>
        <BankCard account={PARTNER_USD_ACCOUNT} wide>
          <p className={styles.swift}>
            Bank SWIFT code: <strong>{PARTNER_USD_SWIFT}</strong>
          </p>
          <a className={styles.guide} href={PARTNER_USD_GUIDE_URL} target="_blank" rel="noopener noreferrer" data-cursor="Open">
            Full sending details, including the correspondent bank (Premium Trust)
            <IconArrowUpRight size={16} />
          </a>
        </BankCard>
      </div>
    </div>
  );
}

function BankCard({ account, wide, children }: { account: PartnerAccount; wide?: boolean; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(true);
    } catch {
      // Clipboard API unavailable: the number is still selectable text.
    }
  }

  return (
    <div className={`${styles.card} ${wide ? styles.wide : ''} glass-on-dark`}>
      <div className={styles.main}>
        <span className={styles.logo}>
          <Image src={account.logo.src} alt={`${account.bank} logo`} width={account.logo.width} height={account.logo.height} />
        </span>
        <p className={styles.bank}>{account.bank}</p>
        <p className={styles.number}>{account.number}</p>
        <p className={styles.holder}>
          {GIVING_ACCOUNT_NAME} · {account.currency}
        </p>
      </div>
      <div className={styles.side}>
        {children}
        <button
          type="button"
          className={`${styles.copy} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label={copied ? `${account.bank} ${account.currency} account number copied` : `Copy ${account.bank} ${account.currency} account number`}
        >
          {copied ? 'Copied' : 'Copy account number'}
        </button>
      </div>
    </div>
  );
}
