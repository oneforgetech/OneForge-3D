import { BreadcrumbStructuredData } from '@/components/chrome/BreadcrumbStructuredData';
import { PageHero, PageShell, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import { LIVE_URL, YOUTUBE_MUSIC_URL } from '@/lib/church';
import { SPOTIFY_SHOW_EMBED_URL, SPOTIFY_SHOW_URL } from '@/lib/episodes';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Listen · ONEFORGE Church, Lagos',
  description: 'Every ONEFORGE message, free, on Spotify. Or join our Sunday service live.',
  path: '/listen',
});

export default function Page() {
  return (
    <PageShell>
      <BreadcrumbStructuredData items={[{ label: 'Listen', path: '/listen' }]} />
      <PageHero title="Listen." lead="Every message, free. Or join us live." image="/images/risen/singer.jpg" alt="A ONEFORGE worship leader singing" />

      <Section id="messages">
        <Reveal className={p.split}>
          <div>
            <h2 className={`${p.h2} display-heading`}>Every message, free.</h2>
            <p className={p.lead}>Something to have on while you do the dishes or drive to work.</p>
            <div className={p.actions}>
              <a className={p.pill} href={SPOTIFY_SHOW_URL} target="_blank" rel="noreferrer" data-cursor="Spotify">
                Open in Spotify
                <span className={p.pillIcon}>↗</span>
              </a>
              <a className={p.ghost} href={YOUTUBE_MUSIC_URL} target="_blank" rel="noreferrer" data-cursor="Open">
                Open on YouTube Music ↗
              </a>
            </div>
          </div>
          <div className={`${p.slab} glass-on-dark`}>
            <iframe
              title="ONEFORGE on Spotify"
              src={SPOTIFY_SHOW_EMBED_URL}
              width="100%"
              height="352"
              style={{ border: 0, borderRadius: 14, display: 'block' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </Reveal>
      </Section>

      <Section band id="live">
        <Reveal>
          <h2 className={`${p.h2} display-heading`}>Join us live.</h2>
          <p className={p.lead}>Can&apos;t be in the room? Watch our services as they happen.</p>
          <div className={p.actions}>
            <a className={p.pill} href={LIVE_URL} target="_blank" rel="noreferrer">
              Join Us Live
              <span className={p.pillIcon}>↗</span>
            </a>
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
