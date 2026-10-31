'use client';

import { useState } from 'react';
import { ServeAreasModal } from '@/components/forms/ServeAreasModal';
import { WelcomeConnectForm } from '@/components/forms/WelcomeConnectForm';
import { WelcomeFormModal } from '@/components/forms/WelcomeFormModal';
import { WelcomeServeForm } from '@/components/forms/WelcomeServeForm';
import { WelcomeInviteFriend } from '@/components/ui/WelcomeInviteFriend';
import { Pill, Section } from './Site';
import styles from './Welcome.module.css';

/**
 * The body of /welcome below the hero: Connect, Serve and Give as cards (two per row), each
 * opening its form in a modal instead of the page scrolling through full sections for them.
 */
export function WelcomeSections() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [serveOpen, setServeOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);

  return (
    <>
      <Section className={styles.sectionTight}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={`${styles.cardTitle} display-heading`}>Connect with us.</h2>
            <p className={styles.cardText}>
              Let us know you came — it only takes a minute, and a real person reads every one.
            </p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.cardButton} onClick={() => setConnectOpen(true)}>
                Say hello
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={`${styles.cardTitle} display-heading`}>Serve with us.</h2>
            <p className={styles.cardText}>You don&apos;t have to be ready. You just have to be willing.</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.cardButton} onClick={() => setServeOpen(true)}>
                I&apos;m willing
              </button>
              <button type="button" className={styles.cardLink} onClick={() => setAreasOpen(true)}>
                Learn more
              </button>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardWide}`}>
            <h2 className={`${styles.cardTitle} display-heading`}>Give.</h2>
            <p className={styles.cardText}>
              Your giving keeps the doors open for the next person who walks in. Give if and when it means something to you.
            </p>
            <div className={styles.cardActions}>
              <Pill href="/give">Ways to give</Pill>
            </div>
          </div>
        </div>

        <WelcomeInviteFriend />
      </Section>

      <WelcomeFormModal open={connectOpen} onClose={() => setConnectOpen(false)} title="Connect with us.">
        <WelcomeConnectForm />
      </WelcomeFormModal>

      <WelcomeFormModal open={serveOpen} onClose={() => setServeOpen(false)} title="Serve with us.">
        <WelcomeServeForm />
      </WelcomeFormModal>

      <ServeAreasModal open={areasOpen} onClose={() => setAreasOpen(false)} />
    </>
  );
}
