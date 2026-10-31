import { Modal } from '@/components/ui/Modal';
import styles from './WelcomeFormModal.module.css';

/** Wraps a Welcome form (Connect, Serve) in the shared modal shell, opened from its card on /welcome. */
export function WelcomeFormModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} label={title}>
      <h2 className={`${styles.heading} display-heading`}>{title}</h2>
      {children}
    </Modal>
  );
}
