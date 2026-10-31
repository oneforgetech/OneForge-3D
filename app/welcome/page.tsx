import type { Metadata } from 'next';
import { WelcomeConnectForm } from '@/components/forms/WelcomeConnectForm';
import { WelcomeServeForm } from '@/components/forms/WelcomeServeForm';
import { PageHero, PageShell, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import w from '@/components/site/Welcome.module.css';

// Unlisted on purpose — reached only by the QR code on the physical guest card, never
// linked from the site's own nav/footer. noindex (and left out of sitemap.ts) so it
// doesn't show up in search either: there's nothing here for anyone who isn't already
// holding the card.
export const metadata: Metadata = {
  title: 'Welcome · ONEFORGE Church',
  description: "We're glad you're here. Let us know how we can help.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PageShell>
      <PageHero
        kicker="Welcome"
        title={`We're glad\nyou're here!`}
        titleClassName={w.heroTitle}
        lead="You don't have to have it all figured out to belong."
        image="/images/risen/group-cast.jpg"
        alt="The ONEFORGE community gathered together"
        centred
      />
      <Section>
        <p className={`kicker ${p.kick}`}>Connect</p>
        <h2 className={`${p.h2} ${p.wide} display-heading`}>Connect with us.</h2>
        <WelcomeConnectForm />
      </Section>

      <Section>
        <p className={`kicker ${p.kick}`}>Serve</p>
        <h2 className={`${p.h2} ${p.wide} display-heading`}>Serve with us.</h2>
        <p className={p.lead}>You don&apos;t have to be ready. You just have to be willing.</p>
        <p className={p.lead}>
          Tell us where you&apos;d like to help. Someone will call you within a week for a ten-minute chat.
        </p>
        <WelcomeServeForm />
      </Section>
    </PageShell>
  );
}
