import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { PageHero, PageShell, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { GivingAccounts } from '@/components/ui/GivingAccounts';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Give · ONEFORGE Church, Lagos',
  description: 'It costs money to keep ONEFORGE going. Bank details for giving, with no pressure and no guilt.',
  path: '/give',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'Give', path: '/give' }]} />
      <PageHero title="Keep this fire lit." lead="It costs money to keep ONEFORGE going, and it stays worth it." image="/images/risen/group-cast.jpg" alt="The ONEFORGE community gathered together" />
      <Section>
        <Reveal className={p.split}>
          <div>
            <p className={p.lead} style={{ marginTop: 0 }}>
              Here&apos;s the plain truth: it costs money to keep this going. The room, the lights, the people who follow up
              with someone new. If ONEFORGE has been worth something to you, you can help keep it going for the next person
              who walks in tired. If you can&apos;t right now, that changes nothing about your place here. The door stays open
              either way.
            </p>
            <p className={p.body}>
              We&apos;ll teach on giving, because we believe it&apos;s part of worship. We&apos;ll never use guilt or pressure
              to ask for it.
            </p>
          </div>
          <div className={p.slab}>
            <GivingAccounts />
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
