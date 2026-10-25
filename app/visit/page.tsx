import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { PageHero, PageShell, Pill, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { VISIT_BLOCKS } from '@/lib/content';
import { SPOTIFY_SHOW_URL } from '@/lib/episodes';
import { LIVE_URL } from '@/lib/church';
import { connectHref } from '@/lib/connect';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Plan a Visit · ONEFORGE Church, Ogudu, Lagos',
  description: 'Sundays at 9 AM in Ogudu, Lagos. What to expect, what to wear, and what happens with your kids.',
  path: '/visit',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'Plan a Visit', path: '/visit' }]} />
      <PageHero
        title="Your first Sunday."
        image="/images/risen/teaching-wide.jpg"
        alt="A ONEFORGE Sunday gathering"
      />
      <Section>
        <Reveal>
          <p className={p.lead} style={{ marginTop: 0 }}>
            There&apos;s no test at the door and nothing you have to believe to come. If you&apos;re curious, come once and see.
            If it&apos;s not for you, no one will chase you.
          </p>
        </Reveal>
        <div className={p.grid3}>
          {VISIT_BLOCKS.map((b, i) => (
            <Reveal key={b.label} delay={(i % 3) * 90}>
              <div id={b.id} className={p.detail}>
                <span className={p.label}>{b.label}</span>
                <p>{b.body}</p>
                {b.link && (
                  <a className={p.link} href={b.link.href} target="_blank" rel="noreferrer">
                    {b.link.label}
                  </a>
                )}
                {b.label === "Can't make it in person?" && (
                  <a className={p.link} href={SPOTIFY_SHOW_URL} target="_blank" rel="noreferrer">
                    Listen on Spotify ↗
                  </a>
                )}
                {b.label === "Can't make it in person?" && (
                  <>
                    {' '}
                    <a className={p.link} href={LIVE_URL} target="_blank" rel="noreferrer">
                      Join us online ↗
                    </a>
                  </>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section band>
        <Reveal>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Tell us you&apos;re coming.</h2>
          <p className={p.lead}>You don&apos;t have to. It just means someone will look out for you.</p>
          <div className={p.actions}>
            <Pill href={connectHref('visiting')}>I&apos;m planning to come</Pill>
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
