import { SPOTIFY_SHOW_ID, latestEpisode as fallback, type Episode } from './episodes';

/**
 * The newest episode of the show, read from Spotify's public embed page (no API key needed).
 * Cached by Next for 30 minutes; any failure falls back to the entry in lib/episodes.ts.
 */
export async function getLatestEpisode(): Promise<Episode> {
  try {
    const res = await fetch(`https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ONEFORGE-site)' },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const json = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1];
    if (!json) return fallback;
    const e = JSON.parse(json)?.props?.pageProps?.state?.data?.entity;
    if (!e || e.type !== 'episode' || typeof e.id !== 'string' || !/^[A-Za-z0-9]{22}$/.test(e.id) || typeof e.title !== 'string') return fallback;
    const art: { url: string; maxWidth: number }[] = Array.isArray(e.relatedEntityCoverArt) ? e.relatedEntityCoverArt : [];
    const cover = art.find((a) => a.maxWidth >= 600)?.url ?? art[art.length - 1]?.url;
    const artworkUrl = cover && /^https:\/\/[a-z0-9.-]*spotifycdn\.com\//.test(cover) ? cover : fallback.artworkUrl;
    const iso: string | undefined = e.releaseDate?.isoString;
    return {
      id: e.id,
      title: e.title.slice(0, 160),
      uri: `spotify:episode:${e.id}`,
      publishDate: iso
        ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Africa/Lagos' })
        : fallback.publishDate,
      artworkUrl,
    };
  } catch {
    return fallback;
  }
}
