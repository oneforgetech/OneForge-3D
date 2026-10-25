import { Preloader } from '@/components/chrome/Preloader';
import { World } from '@/components/world/World';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'ONEFORGE Church · Ogudu, Lagos · Sundays 9 AM',
  description: 'A place to be shaped, not managed. A church in Ogudu, Lagos, meeting Sundays at 9 AM from 1 November. Come as you are.',
  path: '/',
});

export default function Home() {
  return (
    <main>
      <Preloader />
      <World />
    </main>
  );
}
