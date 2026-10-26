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
            <h2 className={`${p.h2} display-heading`} style={{ marginTop: 0, fontSize: 'clamp(30px, 3.6vw, 52px)' }}>
              WHAT HAPPENS HERE GOES FURTHER.
            </h2>
            <p className={p.lead}>What God is doing in a life was never meant to end in one room.</p>
            <p className={p.body}>
              It reaches homes. Workplaces. Communities. Every room where someone can make a difference.
            </p>
            <p className={p.body}>
              Your generosity helps create room for people to encounter Jesus, grow in Christ, and carry His presence into the
              world.
            </p>
            <p className={p.body}>If ONEFORGE has meant something to you, help make room for someone else.</p>
          </div>
          <div className={p.slab}>
            <GivingAccounts />
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
