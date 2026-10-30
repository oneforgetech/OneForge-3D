import type { Metadata } from 'next';
import { WelcomeForm } from '@/components/forms/WelcomeForm';
import { PageHero, PageShell, Section } from '@/components/site/Site';

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
        title="Welcome."
        lead="You don't have to have it all figured out to belong."
        image="/images/risen/group-cast.jpg"
        alt="The ONEFORGE community gathered together"
        centred
      />
      <Section>
        <WelcomeForm />
      </Section>
    </PageShell>
  );
}
