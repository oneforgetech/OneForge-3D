import { Modal } from '@/components/ui/Modal';
import { SERVE_AREAS } from '@/lib/serve';
import styles from './ServeAreasModal.module.css';

/** "Learn more" on the /welcome Serve card: what each area involves, to read before signing up. */
export function ServeAreasModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label="Ways to serve" wide>
      <h2 className={`${styles.heading} display-heading`}>Ways to serve</h2>
      <p className={styles.intro}>Here&apos;s a closer look at each one, so you know what you&apos;re saying yes to.</p>
      <div className={styles.grid}>
        {SERVE_AREAS.map((a, i) => (
          <div key={a.value} className={styles.card}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={styles.cardTitle}>{a.label}</h3>
            <p className={styles.cardText}>{a.description}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
