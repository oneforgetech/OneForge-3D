import { Suspense } from 'react';
import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { ConnectForm } from '@/components/forms/ConnectForm';
import { PageHero, PageShell, Section } from '@/components/site/Site';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Say hello · ONEFORGE Church',
  description: 'Plan a visit, serve, ask for prayer or ask a question. Two minutes, and a real person reads it.',
  path: '/connect',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'Connect', path: '/connect' }]} />
      <PageHero
        title="Say hello."
        lead="Two minutes. A real person reads every one."
        image="/images/risen/embrace.jpg"
        alt="Two members of the ONEFORGE community greeting each other"
        centred
      />
      <Section>
        <Suspense fallback={null}>
          <ConnectForm />
        </Suspense>
      </Section>
    </PageShell>
  );
}
