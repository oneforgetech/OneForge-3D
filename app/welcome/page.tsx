import { PageHero, PageShell } from '@/components/site/Site';
import w from '@/components/site/Welcome.module.css';
import { WelcomeSections } from '@/components/site/WelcomeSections';
import { buildMetadata } from '@/lib/metadata';

// The guest card's QR code lands here too, but it's also a first-class page now:
// linked from the header ("Next Steps") and the footer/menu, and in the sitemap.
export const metadata = buildMetadata({
  title: 'Your Next Step · ONEFORGE Church',
  description: "We're glad you're here. Connect with us, find a place to serve, or give — whatever your next step is.",
  path: '/welcome',
});

export default function Page() {
  return (
    <PageShell snap={false}>
      <PageHero
        kicker="Welcome"
        title={`We're glad\nyou're here!`}
        titleClassName={w.heroTitle}
        className={w.heroCompact}
        lead="You don't have to have it all figured out to belong."
        image="/images/risen/group-cast.jpg"
        alt="The ONEFORGE community gathered together"
        centred
      />
      <WelcomeSections />
    </PageShell>
  );
}
