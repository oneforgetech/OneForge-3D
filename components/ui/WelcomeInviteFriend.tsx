import { IconArrowUpRight } from '@/components/ui/icons';
import { SITE_URL } from '@/lib/church';
import styles from './WelcomeInviteFriend.module.css';

const INVITE_TEXT =
  "I thought of you. I've started going to ONEFORGE in Ogudu, and I think you'd really like it. Sundays at 9am. " +
  `Come with me next Sunday? I'll save you a seat.\n\n${SITE_URL}/visit`;

/** "Bring someone next Sunday" banner at the end of /welcome: a pre-filled WhatsApp share. */
export function WelcomeInviteFriend() {
  return (
    <div className={styles.band}>
      <p className={styles.text}>Bring someone next Sunday.</p>
      <a
        className={styles.link}
        href={`https://wa.me/?text=${encodeURIComponent(INVITE_TEXT)}`}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Go"
      >
        Invite a friend
        <IconArrowUpRight size={16} />
      </a>
    </div>
  );
}
