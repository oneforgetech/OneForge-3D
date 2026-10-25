import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { PageHero, PageShell, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { StatusAction } from '@/components/ui/StatusAction';
import { connectHref } from '@/lib/connect';
import { GROUNDED_FAQ, STREAMS } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'GROUNDED · ONEFORGE Church, Lagos',
  description: 'Five streams you pick up when you need them: Foundations, Worship, Depth, Craft and Calling. Free, small classes.',
  path: '/grounded',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'GROUNDED', path: '/grounded' }]} />
      <PageHero title="GROUNDED" lead="Five streams you pick up when you need them. Not schools, and not levels." image="/images/risen/teaching-wide.jpg" alt="A ONEFORGE teaching gathering" />
      <Section>
        <Reveal>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>“Rooted and grounded in love” (Ephesians 3:17).</h2>
          <p className={p.lead}>Each stream runs four to eight weeks, in a class of up to 25 sitting at tables of eight. It’s free.</p>
        </Reveal>
        <div className={p.grid2}>
          {STREAMS.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 90}>
              <div className={`${p.slab} glass-on-dark`}>
                <span className={p.label}>For {s.forWho}</span>
                <h3 className={p.slabTitle} style={{ fontSize: 'clamp(30px,3vw,46px)' }}>{s.name}</h3>
                <p className={p.slabText}>{s.body}</p>
                <p className={p.slabText} style={{ marginTop: 10 }}>
                  <strong>You’ll leave able to:</strong> {s.outcome}.
                </p>
                <StatusAction label={s.status} action={{ label: 'Tell me when it opens', href: connectHref('opening', s.detail) }} />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section band>
        <Reveal>
          <h2 className={`${p.h2} display-heading`}>Before you sign up.</h2>
          <div className={p.accordion}>
            {GROUNDED_FAQ.map((f) => (
              <details key={f.q} className={p.acc} open>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
