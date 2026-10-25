import Image from 'next/image';
import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { AboutHero, Closing, Journey, Rooms, VisionMission } from '@/components/site/AboutParts';
import { PageShell, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { BELIEFS } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'About · ONEFORGE Church, Lagos',
  description:
    'Who you are matters. ONEFORGE exists to help you grow in Christ, not just for Sunday, but for every room you enter after it.',
  path: '/about',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'About', path: '/about' }]} />
      <AboutHero />
      <Rooms />
      <VisionMission />
      <Journey />

      <Section id="leadership">
        <Reveal>
          <div className={`${p.leader} glass-on-dark`}>
            <span className={p.avatar}>
              <Image src="/images/boye-oloyede.jpg" alt="Boye Oloyede, Lead Pastor" fill sizes="220px" />
            </span>
            <div>
              <span className={p.leaderName}>Boye Oloyede</span>
              <span className={p.leaderRole}>Lead Pastor</span>
              <p className={p.quote}>
                You don’t need to have anything figured out to walk in here. Bring your work, your questions and your doubts
                with you. God takes you exactly as you are, and loves you too much to leave you there. So do we. I’ll look
                for you on Sunday.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section id="believe">
        <Reveal className={p.beliefsGrid}>
          <div className={p.beliefsText}>
            <h2 className={`${p.h2} display-heading`}>Where we stand.</h2>
            <p className={p.lead}>
              Nine short statements. Open any one for a plain explanation. You don’t have to agree with them to come in. But
              you should know where we stand.
            </p>
            <div className={p.accordion}>
              {BELIEFS.map((b) => (
                <details key={b.title} className={p.acc}>
                  <summary data-cursor="Open">{b.title}</summary>
                  <p>{b.text}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <Closing />
    </PageShell>
  );
}
