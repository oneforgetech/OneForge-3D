import Link from 'next/link';
import styles from './StatusAction.module.css';

/**
 * Status-label system (site-wide copy rules): every item on GROUNDED and Next
 * Steps carries exactly one of these labels, each paired with one action.
 * `open` items use their own action instead of a connect-form link.
 */
export function StatusAction({
  label,
  action,
}: {
  label: string;
  action: { label: string; href: string } | null;
}) {
  const external = action?.href.startsWith('http');

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      {action && (external ? (
        <a href={action.href} className={styles.action} target="_blank" rel="noreferrer">
          {action.label} →
        </a>
      ) : (
        <Link href={action.href} className={styles.action}>
          {action.label} →
        </Link>
      ))}
    </div>
  );
}
