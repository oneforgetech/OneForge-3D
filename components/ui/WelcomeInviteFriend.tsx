import { IconArrowUpRight } from '@/components/ui/icons';
import { CHURCH_ADDRESS_STRUCTURED, CHURCH_SUNDAY_TIME, SITE_URL } from '@/lib/church';
import styles from './WelcomeInviteFriend.module.css';

const INVITE_TEXT =
  `I've just found ONEFORGE and I think you'd like it. Sundays at ${CHURCH_SUNDAY_TIME} in ` +
  `${CHURCH_ADDRESS_STRUCTURED.addressLocality}, ${CHURCH_ADDRESS_STRUCTURED.addressRegion}. Come with me? ${SITE_URL}/visit`;

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
