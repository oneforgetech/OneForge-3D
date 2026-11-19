import { PageShell, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { buildMetadata } from '@/lib/metadata';
import { PRIVACY_DRAFT_NOTE, PRIVACY_SECTIONS, PRIVACY_UPDATED } from '@/lib/privacy';

export const metadata = buildMetadata({
  title: 'Privacy notice · ONEFORGE Church',
  description: 'How ONEFORGE uses the details you give us on our forms, who sees them, how long we keep them, and your rights.',
  path: '/privacy',
});

export default function Page() {
  return (
    <PageShell snap={false}>
      <Section>
        <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 96 }}>
          <h1 className="display-heading" style={{ fontSize: 'clamp(2rem, 6vw, 3.25rem)', margin: 0 }}>Privacy notice</h1>
          <p role="note" style={{ fontWeight: 600, marginTop: 16 }}>{PRIVACY_DRAFT_NOTE}</p>
          <p style={{ opacity: 0.75 }}>Last updated {PRIVACY_UPDATED}.</p>
          {PRIVACY_SECTIONS.map((s) => (
            <section key={s.heading} style={{ marginTop: 40 }}>
              <h2 className="display-heading" style={{ fontSize: '1.5rem', margin: 0 }}>{s.heading}</h2>
              {s.paragraphs.map((t) => (
                <p key={t.slice(0, 40)} className={p.body} style={{ lineHeight: 1.6 }}>{t}</p>
              ))}
              {s.bullets?.length ? (
                <ul style={{ paddingLeft: 24, lineHeight: 1.6 }}>
                  {s.bullets.map((b) => (
                    <li key={b.slice(0, 40)} style={{ marginTop: 8 }}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
