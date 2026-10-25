import Image from 'next/image';
import Link from 'next/link';
import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { PageHero, PageShell, Pill, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { StatusAction } from '@/components/ui/StatusAction';
import { connectHref } from '@/lib/connect';
import { MOVEMENT_CARDS, WAYS_IN } from '@/lib/content';
import { MOVEMENTS } from '@/lib/movements';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Find where you are · ONEFORGE Church, Lagos',
  description: 'Four questions, not four levels. Find where you are and take one next step at ONEFORGE Church.',
  path: '/next-steps',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'Find where you are', path: '/next-steps' }]} />
      <PageHero
        title="Find where you are."
        lead="Nobody here is ranked or promoted. We help you find the room where your question gets answered."
        image="/images/risen/embrace.jpg"
        alt="Two members of the ONEFORGE community greeting each other"
      />

      <Section>
        <Reveal>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Four questions, not four levels.</h2>
          <p className={p.lead}>
            “We are his workmanship” (Ephesians 2:10). We call how people change here The Making. It has four movements,
            named for what happens to metal in a forge, and each one is a question you might be asking right now. Find
            yours. Whichever it is, you’re fully part of this church.
          </p>
        </Reveal>

        <div className={p.moves}>
          {MOVEMENTS.map((m, i) => (
            <Reveal key={m.slug}>
              <article id={`branch-${m.slug}`} className={`${p.move} glass-on-dark`}>
                <div className={p.moveMedia}>
                  <Image src={m.image} alt={m.alt} fill sizes="(min-width: 860px) 30vw, 90vw" />
                </div>
                <div>
                  <h3 className={p.moveName}>{m.name}</h3>
                  <p className={p.moveQ}>{m.question}</p>
                  <p className={p.slabText}>{m.body}</p>
                  <dl className={p.compare}>
                    {MOVEMENT_CARDS[i].facts.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {m.actions.map((a) => (
                    <StatusAction key={a.action.href} label={a.label} action={a.action} />
                  ))}
                  {m.note && <p className={p.note}>{m.note}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className={p.body}>
            How do I know which one I’m in? Nobody assigns it and there’s no certificate. The question you’re asking places
            you. Not sure?{' '}
            <Link href={connectHref('question')} style={{ textDecoration: 'underline' }}>
              Ask us.
            </Link>
          </p>
        </Reveal>
      </Section>

      <Section band>
        <Reveal>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Whatever your question.</h2>
        </Reveal>
        <div className={p.grid3}>
          {WAYS_IN.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 90}>
              <div className={`${p.slab} glass-on-dark`}>
                <h3 className={p.slabTitle}>{w.title}</h3>
                <p className={p.slabText}>{w.body}</p>
                <StatusAction label={w.status} action={w.action} />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Not sure where to start?</h2>
          <p className={p.lead}>Come on a Sunday, or just say hello. We’ll help you find your next step.</p>
          <div className={p.actions}>
            <Pill href="/visit">Plan a Visit</Pill>
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
